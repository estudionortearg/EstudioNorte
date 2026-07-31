# Estudio Norte — Gamificación: XP + Rachas + Badges + Ranking + Recompensas
**Fecha:** 2026-07-31
**Estado:** Aprobado

---

## Sección 1 — Sistema Visual

Sigue el design system V2 existente (globals.css). Sin colores hardcodeados — todo via CSS variables. Nuevos componentes usan `var(--en-green)`, `var(--en-coral)`, `var(--en-surface)`, `var(--en-border)`, `var(--en-shadow)`.

---

## Sección 2 — Base de Datos

### Tablas nuevas (`supabase/migrations/003_gamification.sql`)

```sql
-- XP global del usuario (para recompensas)
CREATE TABLE user_xp (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP por curso (para ranking por curso)
CREATE TABLE user_course_xp (
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id)
);

-- Rachas diarias
CREATE TABLE user_streaks (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  freeze_used_date DATE  -- NULL = freeze disponible hoy
);

-- Definición de badges (editables por admin)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  condition_type TEXT NOT NULL,  -- ver valores válidos abajo
  condition_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges ganados por usuario
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  course_id UUID REFERENCES courses(id),  -- NULL para badges globales, populated para course_complete
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  -- Badge global: solo 1 vez por usuario
  UNIQUE NULLS NOT DISTINCT (user_id, badge_id) WHERE course_id IS NULL,
  -- Badge de curso: 1 vez por usuario por curso
  UNIQUE (user_id, badge_id, course_id)
);

-- Recompensas canjeables
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'discount', 'mentoria')),
  xp_cost INTEGER NOT NULL,
  stock INTEGER,  -- NULL = ilimitado
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitudes de canje
CREATE TABLE reward_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  reward_id UUID REFERENCES rewards(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);
```

### Columna nueva en tabla existente

```sql
ALTER TABLE lessons ADD COLUMN xp_value INTEGER NOT NULL DEFAULT 10;
```

### Badges iniciales (seed)

| slug | name | emoji | condition_type | condition_value |
|------|------|-------|----------------|-----------------|
| first_lesson | Primera lección | 🌱 | first_lesson | 1 |
| streak_3 | 3 días seguidos | 🔥 | streak_days | 3 |
| streak_7 | Una semana | ⚡ | streak_days | 7 |
| streak_30 | Un mes | 🏆 | streak_days | 30 |
| xp_100 | 100 XP | ⭐ | total_xp | 100 |
| xp_500 | 500 XP | 💎 | total_xp | 500 |
| first_course | Primer curso | 🎓 | courses_completed | 1 |
| course_complete | Completaste un curso | ✅ | course_complete | 1 |

**Valores válidos de `condition_type`:**
- `first_lesson` — completó su primera lección (condition_value ignorado)
- `streak_days` — racha actual ≥ condition_value
- `total_xp` — XP total ≥ condition_value
| `courses_completed` — cursos completados ≥ condition_value (solo se gana 1 vez)
- `course_complete` — completó un curso (puede ganarse 1 vez por curso)

---

## Sección 3 — Lógica de Negocio

### Completar una lección (`POST /api/progress`)

La API route ejecuta todo en secuencia con manejo de errores por separado en cada paso:

**Paso 1 — Transaction atómica (XP + racha):**
```
1. INSERT INTO progress (user_id, lesson_id) ON CONFLICT DO NOTHING
   → Si ya existía: retornar { already_completed: true }
2. UPSERT user_xp: total_xp += lesson.xp_value
3. UPSERT user_course_xp: xp += lesson.xp_value (para el curso de la lección)
4. Evaluar y actualizar user_streaks:
   - last_activity_date = HOY → nada (ya completó hoy)
   - last_activity_date = AYER → current_streak + 1, actualizar longest_streak si supera
   - last_activity_date = HOY - 2 Y freeze_used_date ≠ HOY - 1 → freeze: mantener racha, freeze_used_date = HOY - 1
   - last_activity_date ≤ HOY - 3 → current_streak = 1, freeze_used_date = NULL
   - last_activity_date IS NULL → current_streak = 1
   Siempre: last_activity_date = HOY
```

**Paso 2 — Evaluación de badges (independiente, no bloquea si falla):**
```
Para cada badge activo, chequear la condición contra el estado actual del usuario.
Solo insertar en user_badges si la condición se cumple Y el badge no fue ganado aún
(excepción: course_complete puede ganarse una vez por curso, tracked por course_id en earned_at context).
Retornar lista de badges_earned[] recién ganados en este request.
```

**Respuesta al cliente:**
```typescript
{
  xp_earned: number,
  new_total_xp: number,
  new_course_xp: number,
  streak: { current: number, longest: number },
  badges_earned: Array<{ slug: string, name: string, emoji: string, description: string }>
}
```

### Reglas de racha

| Situación | Resultado |
|-----------|-----------|
| `last_activity_date = hoy` | Sin cambio (ya sumó hoy) |
| `last_activity_date = ayer` | `current_streak + 1` |
| `last_activity_date = hoy - 2` + freeze disponible | Freeze aplicado, racha se mantiene |
| `last_activity_date ≤ hoy - 3` | Reset a 1 (freeze no aplica) |
| `last_activity_date IS NULL` | Inicio en 1 |

El freeze se "usa" cuando `freeze_used_date` se setea a `hoy - 1`. Un freeze está disponible cuando `freeze_used_date IS NULL` o `freeze_used_date < hoy - 1`.

### Canje de recompensas

**Solicitar (`POST /api/rewards`):**
- Verificar que `reward.is_active = true` y `reward.stock > 0` (o NULL)
- Verificar que `user_xp.total_xp >= reward.xp_cost`
- Verificar que no exista un `reward_request` pending para el mismo `reward_id` del mismo usuario
- Crear `reward_request` con status `pending`
- **No descontar XP al solicitar**

**Aprobar (`PATCH /api/rewards/[id]`, solo admin):**
- Verificar nuevamente que `user_xp.total_xp >= reward.xp_cost` (puede haber cambiado)
- Descontar XP: `user_xp.total_xp -= reward.xp_cost`
- Reducir stock en 1 (si no es NULL)
- Actualizar `reward_request`: status = `approved`, `processed_at = NOW()`, `processed_by = admin_user_id`

**Rechazar (`PATCH /api/rewards/[id]`, solo admin):**
- Actualizar `reward_request`: status = `rejected`, `processed_at = NOW()`, `processed_by = admin_user_id`
- No tocar XP ni stock

---

## Sección 4 — Pantallas

### Dashboard (`/dashboard`) — modificar existente
Agregar fila de stats de gamificación encima de los stats de cursos:
- **XP total** con ícono de estrella
- **Racha actual** con flame icon. Si `last_activity_date = hoy - 2` y freeze disponible: flame amarilla parpadeante con texto "¡En riesgo!". Si racha activa: flame naranja.
- **Badges ganados** con contador y link a `/perfil`

### Player (`/aprender/[slug]/[lessonId]`) — modificar existente
**Sidebar:** agregar toggle "Módulos | Ranking" en el panel lateral existente.
- Tab Módulos: igual que hoy
- Tab Ranking: lista top 10 alumnos del curso con posición + nombre + XP del curso. Si el usuario no está en top 10, mostrar su posición al final separada con `···`.

**Modal de badge ganado:** se muestra automáticamente cuando `badges_earned.length > 0` en la respuesta del API. Muestra emoji grande (80px) + nombre del badge + descripción + XP ganado en esta lección. Botón "¡Genial!" para cerrar. Si ganó múltiples badges, mostrarlos en secuencia.

### Perfil (`/perfil`) — modificar existente
Agregar tabs: **Mis badges | Recompensas | Mis canjes**
- **Mis badges:** grid de badges ganados (emoji + nombre + fecha). Badges no ganados en gris con candado.
- **Recompensas:** grid de recompensas activas con tipo, costo XP, stock disponible, botón "Canjear" (deshabilitado si XP insuficiente o ya tiene un pending).
- **Mis canjes:** lista de reward_requests con estado badge (pendiente/aprobado/rechazado) y fecha.

### Admin Gamificación (`/admin/gamificacion`) — nueva ruta
Tres secciones en tabs:

**Badges:**
- Lista de todos los badges con emoji + nombre + condición + estado activo/inactivo
- Click para editar: nombre, emoji, descripción (condición y valor no editables para no romper lógica)
- Toggle activo/inactivo

**Recompensas:**
- Lista con tipo + costo XP + stock + estado
- Formulario para crear nueva recompensa
- Editar / desactivar existentes

**Canjes pendientes:**
- Lista de reward_requests con status=pending: nombre del alumno + recompensa + fecha de solicitud + XP actual del alumno
- Botones "Aprobar" y "Rechazar" en cada fila

---

## Sección 5 — Arquitectura de Archivos

### Nuevos archivos
```
supabase/migrations/003_gamification.sql
supabase/seed_gamification.sql                    — 8 badges iniciales

app/api/progress/route.ts                         — reemplaza lógica actual, agrega XP+racha+badges
app/api/rewards/route.ts                          — POST crear reward_request
app/api/rewards/[id]/route.ts                     — PATCH aprobar/rechazar (admin)

app/perfil/PerfilClient.tsx                       — modificar: agregar tabs
app/admin/gamificacion/page.tsx                   — Server Component
app/admin/gamificacion/GamificacionClient.tsx     — Client Component

components/gamification/XPStreak.tsx              — recibe props { totalXp, streak, lastActivityDate }
components/gamification/BadgeGrid.tsx             — recibe props { earnedBadges, allBadges }
components/gamification/BadgeModal.tsx            — recibe props { badges: Badge[], onClose }
components/gamification/RankingPanel.tsx          — fetcha user_course_xp para courseId dado
```

### Archivos modificados
```
app/dashboard/page.tsx                            — agrega <XPStreak />
app/aprender/[slug]/[lessonId]/PlayerClient.tsx   — tab Ranking + <BadgeModal />
app/api/progress/route.ts                         — reescritura completa
```

---

## Sección 6 — Global Constraints

- Cero colores hardcodeados: solo CSS variables de `globals.css`
- Cero lógica de negocio en Client Components: solo en API routes (Server)
- Cero Edge Functions: toda la lógica vive en `app/api/`
- `components/gamification/*` reciben props, no fetchan datos propios (excepción: `RankingPanel` fetchea su propio dato por diseño)
- RLS de Supabase: `user_xp`, `user_streaks`, `user_badges` son read-only para el usuario dueño; `reward_requests` el usuario puede crear los propios y leer los propios; las tablas `badges` y `rewards` son read-only para todos los usuarios autenticados
- Admin routes (`/admin/*`) protegidas por middleware con check de `is_admin` en profiles
