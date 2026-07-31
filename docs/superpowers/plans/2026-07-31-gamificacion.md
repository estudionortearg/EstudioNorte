# Gamificación: XP + Rachas + Badges + Ranking + Recompensas — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar sistema de gamificación completo: XP por lección, racha diaria con freeze, 8 badges automáticos, ranking por curso en el player, y recompensas canjeables con XP desde el perfil.

**Architecture:** La lógica de XP + racha + badges vive íntegramente en `app/api/progress/route.ts` (API route de Next.js) usando una transaction de Supabase. Los componentes de UI reciben props del Server Component padre — solo `RankingPanel` fetchea su propio dato. El flujo de recompensas tiene dos endpoints propios (`/api/rewards`).

**Tech Stack:** Next.js 16 App Router, Supabase (postgres + RLS), TypeScript, CSS variables (globals.css).

## Global Constraints

- Cero colores hardcodeados: solo `var(--en-green)`, `var(--en-coral)`, `var(--en-surface)`, `var(--en-border)`, `var(--en-shadow)`, `var(--en-text)`, `var(--en-text-soft)`, `var(--en-white)`, `var(--en-bg)` y variantes definidas en globals.css.
- Cero lógica de negocio en Client Components: fetches de datos en Server Components o API routes.
- `components/gamification/*` reciben props, no fetchan — excepción explícita: `RankingPanel` fetchea `user_course_xp`.
- Supabase client en Server Components/API routes: `import { createClient } from '@/lib/supabase/server'`.
- Supabase client en Client Components que fetchen: `import { createClient } from '@/lib/supabase/client'`.
- Fuentes: `var(--font-display)` (Fraunces) para números grandes y títulos; `var(--font-body)` (Inter) para todo lo demás.
- No crear Edge Functions: toda la lógica en `app/api/`.
- El proyecto no tiene test runner — la verificación es manual via `curl` para APIs y browser para UI.

---

### Task 1: Migración de base de datos + seed de badges

**Files:**
- Create: `supabase/migrations/003_gamification.sql`
- Create: `supabase/seed_gamification.sql`

**Interfaces:**
- Produces: tablas `user_xp`, `user_course_xp`, `user_streaks`, `badges`, `user_badges`, `rewards`, `reward_requests`; columna `lessons.xp_value`; 8 badges seed.

- [ ] **Step 1: Crear migración**

```sql
-- supabase/migrations/003_gamification.sql

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS xp_value INTEGER NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_course_xp (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  freeze_used_date DATE
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge global: solo 1 vez por usuario (course_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_global_unique
  ON user_badges (user_id, badge_id)
  WHERE course_id IS NULL;

-- Badge de curso: 1 vez por usuario por curso
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_course_unique
  ON user_badges (user_id, badge_id, course_id)
  WHERE course_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'discount', 'mentoria')),
  xp_cost INTEGER NOT NULL,
  stock INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_xp_own" ON user_xp FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_course_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_course_xp_own" ON user_course_xp FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_streaks_own" ON user_streaks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_read_all" ON badges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "badges_admin_write" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_own" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards_read_active" ON rewards FOR SELECT USING (is_active = TRUE AND auth.role() = 'authenticated');
CREATE POLICY "rewards_admin_all" ON rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reward_requests_own" ON reward_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reward_requests_insert" ON reward_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reward_requests_admin_update" ON reward_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
```

- [ ] **Step 2: Crear seed de badges**

```sql
-- supabase/seed_gamification.sql
INSERT INTO badges (slug, name, emoji, description, condition_type, condition_value) VALUES
  ('first_lesson',   'Primera lección',   '🌱', 'Completaste tu primera lección. ¡El camino empieza aquí!', 'first_lesson', 1),
  ('streak_3',       '3 días seguidos',   '🔥', 'Estudiaste 3 días consecutivos. ¡Estás en racha!',         'streak_days',  3),
  ('streak_7',       'Una semana',        '⚡', 'Siete días de estudio seguidos. ¡Imparable!',               'streak_days',  7),
  ('streak_30',      'Un mes',            '🏆', '30 días de racha. Eso es disciplina de élite.',             'streak_days',  30),
  ('xp_100',         '100 XP',            '⭐', 'Acumulaste tus primeros 100 XP. ¡Vas creciendo!',           'total_xp',     100),
  ('xp_500',         '500 XP',            '💎', '500 XP acumulados. Sos un alumno de nivel avanzado.',       'total_xp',     500),
  ('first_course',   'Primer curso',      '🎓', 'Completaste tu primer curso. ¡Un logro enorme!',            'courses_completed', 1),
  ('course_complete','Curso completado',  '✅', 'Terminaste un curso de Estudio Norte.',                     'course_complete', 1)
ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 3: Ejecutar en Supabase**

Ir al Supabase dashboard → SQL Editor → pegar y ejecutar `003_gamification.sql`, luego `seed_gamification.sql`.

Verificar:
```sql
SELECT slug, name, emoji FROM badges ORDER BY created_at;
-- Debe retornar 8 filas
SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'xp_value';
-- Debe retornar 1 fila
```

- [ ] **Step 4: Verificar que profiles tiene columna is_admin**

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin';
```

Si no existe:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/003_gamification.sql supabase/seed_gamification.sql
git commit -m "feat: migración gamificación — XP, rachas, badges, recompensas"
```

---

### Task 2: API route de progreso — XP + racha + badges

**Files:**
- Modify: `app/api/progress/route.ts` (reescritura completa)

**Interfaces:**
- Consumes: tablas `progress`, `lessons`, `user_xp`, `user_course_xp`, `user_streaks`, `badges`, `user_badges`, `modules` (para obtener course_id de la lección)
- Produces:
```typescript
// POST /api/progress — request body
{ lesson_id: string }

// POST /api/progress — response (éxito)
{
  xp_earned: number           // xp_value de la lección
  new_total_xp: number        // total_xp del usuario después
  new_course_xp: number       // xp del usuario en este curso después
  streak: {
    current: number
    longest: number
  }
  badges_earned: Array<{
    slug: string
    name: string
    emoji: string
    description: string
  }>
  already_completed: boolean  // true si la lección ya estaba completada
}
```

- [ ] **Step 1: Reescribir `app/api/progress/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BadgeRow {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  condition_type: string
  condition_value: number
}

async function evaluateBadges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
  totalXp: number,
  currentStreak: number
): Promise<Array<{ slug: string; name: string; emoji: string; description: string }>> {
  const { data: allBadges } = await supabase
    .from('badges')
    .select('id, slug, name, emoji, description, condition_type, condition_value')
    .eq('is_active', true)

  if (!allBadges || allBadges.length === 0) return []

  const { data: existingGlobal } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .is('course_id', null)

  const { data: existingCourse } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)

  const globalEarned = new Set((existingGlobal || []).map((r: { badge_id: string }) => r.badge_id))
  const courseEarned = new Set((existingCourse || []).map((r: { badge_id: string }) => r.badge_id))

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .in('module_id', (
      await supabase.from('modules').select('id').eq('course_id', courseId)
    ).data?.map((m: { id: string }) => m.id) || [])

  const { count: completedLessons } = await supabase
    .from('progress')
    .select('lesson_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('lesson_id', (
      await supabase.from('lessons').select('id').in('module_id',
        (await supabase.from('modules').select('id').eq('course_id', courseId)).data?.map((m: { id: string }) => m.id) || []
      )
    ).data?.map((l: { id: string }) => l.id) || [])

  const { count: coursesCompleted } = await supabase
    .from('user_badges')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('badge_id', allBadges.find((b: BadgeRow) => b.slug === 'course_complete')?.id || '')

  const { count: totalProgressCount } = await supabase
    .from('progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const earned: Array<{ slug: string; name: string; emoji: string; description: string }> = []

  for (const badge of allBadges as BadgeRow[]) {
    let qualifies = false
    let isCourseScoped = false

    switch (badge.condition_type) {
      case 'first_lesson':
        qualifies = (totalProgressCount || 0) >= 1 && !globalEarned.has(badge.id)
        break
      case 'streak_days':
        qualifies = currentStreak >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'total_xp':
        qualifies = totalXp >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'courses_completed':
        qualifies = (coursesCompleted || 0) >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'course_complete':
        isCourseScoped = true
        qualifies = (totalLessons || 0) > 0 &&
          completedLessons === totalLessons &&
          !courseEarned.has(badge.id)
        break
    }

    if (qualifies) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        course_id: isCourseScoped ? courseId : null,
      })
      earned.push({ slug: badge.slug, name: badge.name, emoji: badge.emoji, description: badge.description })
    }
  }

  return earned
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lesson_id } = await req.json()
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  // Obtener lección y su course_id
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, xp_value, module_id, modules!inner(course_id)')
    .eq('id', lesson_id)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  const courseId = (lesson.modules as unknown as { course_id: string }).course_id
  const xpValue = lesson.xp_value || 10

  // Verificar si ya estaba completada
  const { data: existing } = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson_id)
    .single()

  if (existing) {
    const { data: xpRow } = await supabase.from('user_xp').select('total_xp').eq('user_id', user.id).single()
    const { data: courseXpRow } = await supabase.from('user_course_xp').select('xp').eq('user_id', user.id).eq('course_id', courseId).single()
    const { data: streakRow } = await supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single()
    return NextResponse.json({
      xp_earned: 0,
      new_total_xp: xpRow?.total_xp || 0,
      new_course_xp: courseXpRow?.xp || 0,
      streak: { current: streakRow?.current_streak || 0, longest: streakRow?.longest_streak || 0 },
      badges_earned: [],
      already_completed: true,
    })
  }

  // Paso 1: Insertar progreso
  await supabase.from('progress').insert({ user_id: user.id, lesson_id, completed_at: new Date().toISOString() })

  // Paso 2: Actualizar XP global
  const { data: xpRow } = await supabase.from('user_xp').select('total_xp').eq('user_id', user.id).single()
  const newTotalXp = (xpRow?.total_xp || 0) + xpValue
  await supabase.from('user_xp').upsert({ user_id: user.id, total_xp: newTotalXp, updated_at: new Date().toISOString() })

  // Paso 3: Actualizar XP del curso
  const { data: courseXpRow } = await supabase.from('user_course_xp').select('xp').eq('user_id', user.id).eq('course_id', courseId).single()
  const newCourseXp = (courseXpRow?.xp || 0) + xpValue
  await supabase.from('user_course_xp').upsert({ user_id: user.id, course_id: courseId, xp: newCourseXp })

  // Paso 4: Evaluar racha
  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single()

  let newStreak = 1
  let newLongest = streakRow?.longest_streak || 1
  let newFreezeUsedDate = streakRow?.freeze_used_date || null

  if (!streakRow || !streakRow.last_activity_date) {
    newStreak = 1
  } else if (streakRow.last_activity_date === today) {
    newStreak = streakRow.current_streak
    newLongest = streakRow.longest_streak
  } else if (streakRow.last_activity_date === yesterday) {
    newStreak = streakRow.current_streak + 1
    newLongest = Math.max(newStreak, streakRow.longest_streak)
  } else if (streakRow.last_activity_date === twoDaysAgo && streakRow.freeze_used_date !== yesterday) {
    // Freeze aplica: faltaste exactamente ayer y el freeze no fue usado ayer
    newStreak = streakRow.current_streak
    newLongest = streakRow.longest_streak
    newFreezeUsedDate = yesterday
  } else {
    // Reset: faltaste 2+ días o ya usaste el freeze ayer
    newStreak = 1
    newFreezeUsedDate = null
  }

  await supabase.from('user_streaks').upsert({
    user_id: user.id,
    current_streak: newStreak,
    longest_streak: newLongest,
    last_activity_date: today,
    freeze_used_date: newFreezeUsedDate,
  })

  // Paso 5: Evaluar badges (no bloquea si falla)
  let badgesEarned: Array<{ slug: string; name: string; emoji: string; description: string }> = []
  try {
    badgesEarned = await evaluateBadges(supabase, user.id, courseId, newTotalXp, newStreak)
  } catch (e) {
    console.error('Badge evaluation failed (non-fatal):', e)
  }

  return NextResponse.json({
    xp_earned: xpValue,
    new_total_xp: newTotalXp,
    new_course_xp: newCourseXp,
    streak: { current: newStreak, longest: newLongest },
    badges_earned: badgesEarned,
    already_completed: false,
  })
}
```

- [ ] **Step 2: Verificar manualmente**

Con un usuario logueado, completar una lección desde el browser o via curl:
```bash
# Reemplazar LESSON_ID y COOKIE con valores reales
curl -X POST https://estudio-norte-web-two.vercel.app/api/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"lesson_id":"<uuid>"}'
```

Respuesta esperada:
```json
{
  "xp_earned": 10,
  "new_total_xp": 10,
  "new_course_xp": 10,
  "streak": { "current": 1, "longest": 1 },
  "badges_earned": [{ "slug": "first_lesson", "name": "Primera lección", "emoji": "🌱", "description": "..." }],
  "already_completed": false
}
```

Segunda llamada con el mismo lesson_id debe retornar `"already_completed": true` y `"xp_earned": 0`.

- [ ] **Step 3: Commit**

```bash
git add app/api/progress/route.ts
git commit -m "feat: progress API con XP, racha diaria y badges automáticos"
```

---

### Task 3: API routes de recompensas

**Files:**
- Create: `app/api/rewards/route.ts`
- Create: `app/api/rewards/[id]/route.ts`

**Interfaces:**
- Consumes: tablas `rewards`, `reward_requests`, `user_xp`, `profiles` (is_admin)
- Produces:
```typescript
// POST /api/rewards — crear solicitud de canje
// Body: { reward_id: string }
// Response éxito: { ok: true, request_id: string }
// Response error: { error: string } con status 400/404/409

// PATCH /api/rewards/[id] — aprobar o rechazar (solo admin)
// Body: { action: 'approve' | 'reject' }
// Response éxito: { ok: true }
// Response error: { error: string } con status 400/403/404
```

- [ ] **Step 1: Crear `app/api/rewards/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reward_id } = await req.json()
  if (!reward_id) return NextResponse.json({ error: 'reward_id required' }, { status: 400 })

  // Verificar que la recompensa existe y está activa
  const { data: reward } = await supabase
    .from('rewards')
    .select('id, xp_cost, stock, is_active')
    .eq('id', reward_id)
    .single()

  if (!reward || !reward.is_active) {
    return NextResponse.json({ error: 'Recompensa no disponible' }, { status: 404 })
  }

  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json({ error: 'Sin stock disponible' }, { status: 400 })
  }

  // Verificar XP suficiente
  const { data: xpRow } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', user.id)
    .single()

  if ((xpRow?.total_xp || 0) < reward.xp_cost) {
    return NextResponse.json({ error: 'XP insuficiente' }, { status: 400 })
  }

  // Verificar que no hay un canje pending para esta recompensa del mismo usuario
  const { data: existingPending } = await supabase
    .from('reward_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('reward_id', reward_id)
    .eq('status', 'pending')
    .single()

  if (existingPending) {
    return NextResponse.json({ error: 'Ya tenés una solicitud pendiente para esta recompensa' }, { status: 409 })
  }

  // Crear solicitud
  const { data: request } = await supabase
    .from('reward_requests')
    .insert({ user_id: user.id, reward_id })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, request_id: request?.id })
}
```

- [ ] **Step 2: Crear `app/api/rewards/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verificar que es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  // Obtener la solicitud
  const { data: request } = await supabase
    .from('reward_requests')
    .select('id, user_id, reward_id, status')
    .eq('id', id)
    .single()

  if (!request) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 400 })
  }

  if (action === 'approve') {
    // Verificar XP al momento de aprobar
    const { data: reward } = await supabase
      .from('rewards')
      .select('xp_cost, stock')
      .eq('id', request.reward_id)
      .single()

    const { data: xpRow } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', request.user_id)
      .single()

    if ((xpRow?.total_xp || 0) < (reward?.xp_cost || 0)) {
      // Rechazar automáticamente: XP insuficiente al momento de aprobar
      await supabase.from('reward_requests').update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      }).eq('id', id)
      return NextResponse.json({ error: 'XP insuficiente al momento de aprobar — solicitud rechazada automáticamente' }, { status: 400 })
    }

    // Descontar XP
    await supabase.from('user_xp').update({
      total_xp: (xpRow?.total_xp || 0) - (reward?.xp_cost || 0),
      updated_at: new Date().toISOString(),
    }).eq('user_id', request.user_id)

    // Reducir stock si no es ilimitado
    if (reward?.stock !== null && reward.stock !== undefined) {
      await supabase.from('rewards').update({ stock: reward.stock - 1 }).eq('id', request.reward_id)
    }

    await supabase.from('reward_requests').update({
      status: 'approved',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    }).eq('id', id)
  } else {
    await supabase.from('reward_requests').update({
      status: 'rejected',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/rewards/route.ts app/api/rewards/[id]/route.ts
git commit -m "feat: API routes de recompensas — crear solicitud y aprobar/rechazar"
```

---

### Task 4: Componentes de gamificación

**Files:**
- Create: `components/gamification/XPStreak.tsx`
- Create: `components/gamification/BadgeGrid.tsx`
- Create: `components/gamification/BadgeModal.tsx`
- Create: `components/gamification/RankingPanel.tsx`

**Interfaces:**
- Consumes (RankingPanel): tabla `user_course_xp` vía Supabase client-side
- Produces:

```typescript
// XPStreak
interface XPStreakProps {
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null  // 'YYYY-MM-DD' o null
  badgesCount: number
}

// BadgeGrid
interface Badge {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  condition_type: string
  condition_value: number
}
interface EarnedBadge {
  badge: Badge
  earned_at: string
  course_id: string | null
}
interface BadgeGridProps {
  earnedBadges: EarnedBadge[]
  allBadges: Badge[]
}

// BadgeModal
interface BadgeModalProps {
  badges: Array<{ slug: string; name: string; emoji: string; description: string }>
  xpEarned: number
  onClose: () => void
}

// RankingPanel
interface RankingPanelProps {
  courseId: string
  userId: string
}
```

- [ ] **Step 1: Crear `components/gamification/XPStreak.tsx`**

```tsx
interface XPStreakProps {
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  badgesCount: number
}

function isStreakAtRisk(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return false
  const today = new Date().toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  return lastActivityDate === twoDaysAgo
}

export default function XPStreak({ totalXp, currentStreak, longestStreak, lastActivityDate, badgesCount }: XPStreakProps) {
  const atRisk = isStreakAtRisk(lastActivityDate)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '10px',
      marginBottom: '24px',
    }}>
      {/* XP Total */}
      <div style={{
        background: 'var(--en-surface)',
        border: '1px solid var(--en-border)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-green)', letterSpacing: '-1px', lineHeight: 1 }}>
          {totalXp}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          XP total
        </div>
      </div>

      {/* Racha */}
      <div style={{
        background: 'var(--en-surface)',
        border: `1px solid ${atRisk ? 'rgba(232,115,90,0.3)' : 'var(--en-border)'}`,
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
        position: 'relative' as const,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '20px', animation: atRisk ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
            {currentStreak > 0 ? '🔥' : '💤'}
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: atRisk ? 'var(--en-coral)' : 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
            {currentStreak}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: atRisk ? 'var(--en-coral)' : 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {atRisk ? '¡En riesgo!' : 'días de racha'}
        </div>
      </div>

      {/* Badges */}
      <div style={{
        background: 'var(--en-surface)',
        border: '1px solid var(--en-border)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
          {badgesCount}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          badges
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Crear `components/gamification/BadgeGrid.tsx`**

```tsx
interface Badge {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
}

interface EarnedBadge {
  badge: Badge
  earned_at: string
  course_id: string | null
}

interface BadgeGridProps {
  earnedBadges: EarnedBadge[]
  allBadges: Badge[]
}

export default function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map(e => e.badge.id))

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '12px',
    }}>
      {allBadges.map(badge => {
        const earned = earnedIds.has(badge.id)
        const earnedEntry = earnedBadges.find(e => e.badge.id === badge.id)
        const earnedDate = earnedEntry
          ? new Date(earnedEntry.earned_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
          : null

        return (
          <div key={badge.id} style={{
            background: 'var(--en-surface)',
            border: `1px solid ${earned ? 'var(--en-green-15)' : 'var(--en-border)'}`,
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center' as const,
            opacity: earned ? 1 : 0.45,
            transition: 'opacity 0.2s',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(100%)' }}>
              {badge.emoji}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: 'var(--en-text)', marginBottom: '4px' }}>
              {badge.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)', lineHeight: 1.3 }}>
              {earned ? `Ganado el ${earnedDate}` : badge.description}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Crear `components/gamification/BadgeModal.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'

interface BadgeInfo {
  slug: string
  name: string
  emoji: string
  description: string
}

interface BadgeModalProps {
  badges: BadgeInfo[]
  xpEarned: number
  onClose: () => void
}

export default function BadgeModal({ badges, xpEarned, onClose }: BadgeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (badges.length === 0) return null

  const current = badges[currentIndex]
  const hasMore = currentIndex < badges.length - 1

  const handleNext = () => {
    if (hasMore) setCurrentIndex(i => i + 1)
    else onClose()
  }

  return (
    <div style={{
      position: 'fixed' as const, inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--en-surface)',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center' as const,
        boxShadow: 'var(--en-shadow-lg)',
        border: '1px solid var(--en-border)',
      }} onClick={e => e.stopPropagation()}>

        {/* Contador si hay múltiples */}
        {badges.length > 1 && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {currentIndex + 1} de {badges.length}
          </div>
        )}

        {/* Emoji grande */}
        <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '20px' }}>
          {current.emoji}
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '8px' }}>
          ¡Nuevo badge!
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: 'var(--en-text)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          {current.name}
        </h2>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.5, marginBottom: '24px' }}>
          {current.description}
        </p>

        {/* XP ganado */}
        {xpEarned > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--en-green-light)', marginBottom: '24px',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color: 'var(--en-green)' }}>
              +{xpEarned} XP
            </span>
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: 'var(--en-green)',
            color: 'var(--en-white)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {hasMore ? `Ver siguiente →` : '¡Genial!'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear `components/gamification/RankingPanel.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RankingEntry {
  user_id: string
  xp: number
  full_name: string | null
  avatar_url: string | null
}

interface RankingPanelProps {
  courseId: string
  userId: string
}

export default function RankingPanel({ courseId, userId }: RankingPanelProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [myPosition, setMyPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_course_xp')
        .select('user_id, xp, profiles(full_name, avatar_url)')
        .eq('course_id', courseId)
        .order('xp', { ascending: false })
        .limit(50)

      if (!data) { setLoading(false); return }

      const entries: RankingEntry[] = data.map((r: { user_id: string; xp: number; profiles: { full_name: string | null; avatar_url: string | null } | null }) => ({
        user_id: r.user_id,
        xp: r.xp,
        full_name: r.profiles?.full_name || null,
        avatar_url: r.profiles?.avatar_url || null,
      }))

      const myIdx = entries.findIndex(e => e.user_id === userId)
      setMyPosition(myIdx === -1 ? null : myIdx + 1)
      setRanking(entries.slice(0, 10))
      setLoading(false)
    }
    load()
  }, [courseId, userId])

  if (loading) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
      Cargando ranking...
    </div>
  )

  if (ranking.length === 0) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
      Todavía no hay ranking para este curso.
    </div>
  )

  const isInTop10 = myPosition !== null && myPosition <= 10

  return (
    <div style={{ padding: '12px 0' }}>
      {ranking.map((entry, idx) => {
        const isMe = entry.user_id === userId
        const initials = entry.full_name
          ? entry.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
          : '?'
        return (
          <div key={entry.user_id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px',
            background: isMe ? 'var(--en-green-light)' : 'transparent',
            borderRadius: '10px',
            marginBottom: '2px',
          }}>
            <div style={{
              width: '20px', textAlign: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px',
              color: idx < 3 ? 'var(--en-green)' : 'var(--en-text-soft)',
            }}>
              {idx + 1}
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--en-green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '10px',
              color: 'var(--en-green)', flexShrink: 0,
            }}>
              {entry.avatar_url
                ? <img src={entry.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: isMe ? 600 : 400,
                color: isMe ? 'var(--en-green)' : 'var(--en-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.full_name || 'Alumno'}
                {isMe && ' (vos)'}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
              color: 'var(--en-green)', flexShrink: 0,
            }}>
              {entry.xp} XP
            </div>
          </div>
        )
      })}

      {/* Mi posición si no estoy en el top 10 */}
      {!isInTop10 && myPosition !== null && (
        <>
          <div style={{ textAlign: 'center', padding: '8px', color: 'var(--en-text-soft)', fontSize: '18px' }}>···</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px',
            background: 'var(--en-green-light)',
            borderRadius: '10px',
          }}>
            <div style={{ width: '20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-text-soft)' }}>
              {myPosition}
            </div>
            <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)' }}>
              Vos
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/gamification/
git commit -m "feat: componentes de gamificación XPStreak, BadgeGrid, BadgeModal, RankingPanel"
```

---

### Task 5: Dashboard — agregar XPStreak

**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `XPStreakProps` de `components/gamification/XPStreak`; tablas `user_xp`, `user_streaks`, `user_badges`

- [ ] **Step 1: Agregar queries de gamificación al Server Component**

En `app/dashboard/page.tsx`, después de las queries existentes de enrollments, agregar:

```typescript
// Después de `const validCourses = ...`

const { data: xpRow } = await supabase
  .from('user_xp')
  .select('total_xp')
  .eq('user_id', user.id)
  .single()

const { data: streakRow } = await supabase
  .from('user_streaks')
  .select('current_streak, longest_streak, last_activity_date')
  .eq('user_id', user.id)
  .single()

const { count: badgesCount } = await supabase
  .from('user_badges')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id)
```

- [ ] **Step 2: Agregar import y render de XPStreak**

Al inicio del archivo, agregar:
```typescript
import XPStreak from '@/components/gamification/XPStreak'
```

Dentro del JSX, justo antes del bloque que renderiza `validCourses.length === 0` (empty state) o el contenido principal, agregar:

```tsx
<XPStreak
  totalXp={xpRow?.total_xp || 0}
  currentStreak={streakRow?.current_streak || 0}
  longestStreak={streakRow?.longest_streak || 0}
  lastActivityDate={streakRow?.last_activity_date || null}
  badgesCount={badgesCount || 0}
/>
```

- [ ] **Step 3: Verificar en browser**

Navegar a `/dashboard`. Debe aparecer la fila de stats de gamificación encima de los cursos con XP, racha y badges. Si el usuario no tiene progreso aún, todos en 0.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: dashboard con XP, racha y badges en stats row"
```

---

### Task 6: Player — tab Ranking + BadgeModal

**Files:**
- Modify: `app/aprender/[slug]/[lessonId]/PlayerClient.tsx`
- Modify: `app/aprender/[slug]/[lessonId]/page.tsx`

**Interfaces:**
- Consumes: `BadgeModalProps` de `components/gamification/BadgeModal`; `RankingPanelProps` de `components/gamification/RankingPanel`; respuesta de `POST /api/progress` (campo `badges_earned`, `xp_earned`)
- Consumes de page.tsx: `courseId: string` (nuevo prop que el Server Component debe pasar)

- [ ] **Step 1: Modificar `page.tsx` para pasar courseId al PlayerClient**

En `app/aprender/[slug]/[lessonId]/page.tsx`, el Server Component ya tiene acceso al `course.id` cuando hace la query. Agregar `courseId` al prop del `PlayerClient`:

```typescript
// En la query existente que obtiene el curso, asegurarse de tener course.id
// Luego en el return:
<PlayerClient
  // ... props existentes ...
  courseId={course.id}   // NUEVO
  userId={user.id}       // NUEVO (si no estaba ya)
/>
```

- [ ] **Step 2: Agregar `courseId` y `userId` a la interface Props de PlayerClient**

```typescript
interface Props {
  // ... props existentes ...
  courseId: string    // NUEVO
  userId: string      // ya existe
}
```

- [ ] **Step 3: Agregar estado para badges y tab de sidebar**

```typescript
// Estado nuevo (junto a los useState existentes):
const [badgesEarned, setBadgesEarned] = useState<Array<{ slug: string; name: string; emoji: string; description: string }>>([])
const [xpEarned, setXpEarned] = useState(0)
const [sidebarTab, setSidebarTab] = useState<'modules' | 'ranking'>('modules')
```

- [ ] **Step 4: Actualizar la función `markComplete` para leer la respuesta**

Reemplazar el body de `markComplete`:

```typescript
const markComplete = async () => {
  if (isCurrentComplete) return
  startTransition(async () => {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lesson.id }),
    })
    const data = await res.json()
    setCompleted(prev => new Set([...prev, lesson.id]))
    if (data.badges_earned && data.badges_earned.length > 0) {
      setBadgesEarned(data.badges_earned)
      setXpEarned(data.xp_earned || 0)
    }
    if (nextLessonId) {
      router.push(`/aprender/${courseSlug}/${nextLessonId}`)
    } else {
      router.refresh()
    }
  })
}
```

- [ ] **Step 5: Agregar imports de los nuevos componentes**

```typescript
import BadgeModal from '@/components/gamification/BadgeModal'
import RankingPanel from '@/components/gamification/RankingPanel'
```

- [ ] **Step 6: Agregar toggle de tabs al sidebar y el RankingPanel**

En el JSX del sidebar (buscar donde se renderizan los módulos), agregar antes de la lista de módulos:

```tsx
{/* Tab toggle */}
<div style={{
  display: 'flex', gap: '4px', padding: '8px 12px',
  borderBottom: '1px solid var(--en-border)',
}}>
  {(['modules', 'ranking'] as const).map(tab => (
    <button
      key={tab}
      onClick={() => setSidebarTab(tab)}
      style={{
        flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: sidebarTab === tab ? 'var(--en-green-light)' : 'transparent',
        color: sidebarTab === tab ? 'var(--en-green)' : 'var(--en-text-soft)',
        fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: sidebarTab === tab ? 600 : 400,
      }}
    >
      {tab === 'modules' ? 'Módulos' : 'Ranking'}
    </button>
  ))}
</div>

{/* Contenido del tab */}
{sidebarTab === 'modules' ? (
  /* ... lista de módulos existente ... */
) : (
  <RankingPanel courseId={courseId} userId={userId} />
)}
```

- [ ] **Step 7: Agregar BadgeModal al final del JSX**

```tsx
{badgesEarned.length > 0 && (
  <BadgeModal
    badges={badgesEarned}
    xpEarned={xpEarned}
    onClose={() => setBadgesEarned([])}
  />
)}
```

- [ ] **Step 8: Verificar en browser**

- Completar una lección: debe aparecer el BadgeModal si ganó un badge.
- Abrir el sidebar del player y hacer click en "Ranking": debe mostrar el ranking del curso.
- Si solo hay 1 alumno, mostrar "Vos" en posición 1.

- [ ] **Step 9: Commit**

```bash
git add app/aprender/
git commit -m "feat: player con tab de ranking y modal de badge ganado"
```

---

### Task 7: Perfil — tabs Badges + Recompensas + Mis canjes

**Files:**
- Modify: `app/perfil/page.tsx`
- Modify: `app/perfil/PerfilClient.tsx`

**Interfaces:**
- Consumes: `BadgeGridProps` de `components/gamification/BadgeGrid`; tablas `user_badges`, `badges`, `rewards`, `reward_requests`, `user_xp`

- [ ] **Step 1: Agregar queries al Server Component `app/perfil/page.tsx`**

```typescript
// Después de las queries existentes:

const { data: allBadges } = await supabase
  .from('badges')
  .select('id, slug, name, emoji, description, condition_type, condition_value')
  .eq('is_active', true)
  .order('created_at')

const { data: earnedBadgesRaw } = await supabase
  .from('user_badges')
  .select('badge_id, earned_at, course_id, badges(id, slug, name, emoji, description, condition_type, condition_value)')
  .eq('user_id', user.id)
  .order('earned_at', { ascending: false })

const { data: activeRewards } = await supabase
  .from('rewards')
  .select('id, title, description, type, xp_cost, stock')
  .eq('is_active', true)
  .order('xp_cost')

const { data: myRequests } = await supabase
  .from('reward_requests')
  .select('id, status, requested_at, rewards(title, type, xp_cost)')
  .eq('user_id', user.id)
  .order('requested_at', { ascending: false })

const { data: xpRow } = await supabase
  .from('user_xp')
  .select('total_xp')
  .eq('user_id', user.id)
  .single()

const earnedBadges = (earnedBadgesRaw || []).map((r: {
  badge_id: string
  earned_at: string
  course_id: string | null
  badges: { id: string; slug: string; name: string; emoji: string; description: string; condition_type: string; condition_value: number } | null
}) => ({
  badge: r.badges!,
  earned_at: r.earned_at,
  course_id: r.course_id,
}))
```

- [ ] **Step 2: Pasar los nuevos props a PerfilClient**

```tsx
<PerfilClient
  // ... props existentes ...
  allBadges={allBadges || []}
  earnedBadges={earnedBadges}
  activeRewards={activeRewards || []}
  myRequests={myRequests || []}
  totalXp={xpRow?.total_xp || 0}
/>
```

- [ ] **Step 3: Actualizar la interface Props de PerfilClient y agregar las nuevas tabs**

Agregar a la interface Props:
```typescript
interface Badge {
  id: string; slug: string; name: string; emoji: string; description: string;
  condition_type: string; condition_value: number;
}
interface EarnedBadge { badge: Badge; earned_at: string; course_id: string | null }
interface Reward { id: string; title: string; description: string; type: string; xp_cost: number; stock: number | null }
interface RewardRequest {
  id: string; status: string; requested_at: string;
  rewards: { title: string; type: string; xp_cost: number } | null
}

// Agregar a Props:
allBadges: Badge[]
earnedBadges: EarnedBadge[]
activeRewards: Reward[]
myRequests: RewardRequest[]
totalXp: number
```

Cambiar el tipo de `activeTab`:
```typescript
const [activeTab, setActiveTab] = useState<'info' | 'pagos' | 'badges' | 'recompensas' | 'canjes'>('info')
```

Agregar al array de tabs:
```typescript
(['info', 'Mis datos'], ['pagos', 'Mis pagos'], ['badges', 'Badges'], ['recompensas', 'Recompensas'], ['canjes', 'Mis canjes'])
```

- [ ] **Step 4: Agregar import de BadgeGrid y el contenido de las nuevas tabs**

```typescript
import BadgeGrid from '@/components/gamification/BadgeGrid'
```

Tab badges:
```tsx
{activeTab === 'badges' && (
  <BadgeGrid earnedBadges={earnedBadges} allBadges={allBadges} />
)}
```

Tab recompensas:
```tsx
{activeTab === 'recompensas' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '4px' }}>
      Tu saldo: <strong style={{ color: 'var(--en-green)' }}>{totalXp} XP</strong>
    </div>
    {activeRewards.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
        No hay recompensas disponibles por ahora.
      </div>
    ) : activeRewards.map(reward => {
      const canAfford = totalXp >= reward.xp_cost
      const hasPending = myRequests.some(r => r.rewards && r.status === 'pending' && r.id === reward.id)
      const typeLabel = reward.type === 'course' ? '🎓 Curso gratis' : reward.type === 'discount' ? '💸 Descuento' : '🤝 Mentoría'
      return (
        <div key={reward.id} style={{
          padding: '20px', borderRadius: '14px',
          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginBottom: '4px' }}>{typeLabel}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)' }}>{reward.title}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginTop: '2px' }}>{reward.description}</div>
            {reward.stock !== null && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-coral)', marginTop: '4px' }}>
                {reward.stock} disponibles
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--en-green)' }}>
              {reward.xp_cost} XP
            </div>
            <RedeemButton rewardId={reward.id} canAfford={canAfford} hasPending={hasPending} />
          </div>
        </div>
      )
    })}
  </div>
)}
```

Agregar el componente cliente `RedeemButton` al mismo archivo (es client porque maneja click):

```tsx
function RedeemButton({ rewardId, canAfford, hasPending }: { rewardId: string; canAfford: boolean; hasPending: boolean }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRedeem = async () => {
    if (!canAfford || hasPending || loading || done) return
    setLoading(true)
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reward_id: rewardId }),
    })
    setLoading(false)
    if (res.ok) setDone(true)
  }

  if (done || hasPending) return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', padding: '8px 14px', borderRadius: '8px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
      Solicitud enviada
    </span>
  )

  return (
    <button
      onClick={handleRedeem}
      disabled={!canAfford || loading}
      style={{
        padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
        background: canAfford ? 'var(--en-green)' : 'var(--en-border)',
        color: canAfford ? 'var(--en-white)' : 'var(--en-text-soft)',
        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? '...' : canAfford ? 'Canjear' : 'XP insuficiente'}
    </button>
  )
}
```

Tab mis canjes:
```tsx
{activeTab === 'canjes' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {myRequests.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
        No tenés solicitudes de canje todavía.
      </div>
    ) : myRequests.map(req => {
      const statusColor = req.status === 'approved' ? 'var(--en-green)' : req.status === 'rejected' ? 'var(--en-coral)' : 'var(--en-text-soft)'
      const statusLabel = req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'
      const date = new Date(req.requested_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
      return (
        <div key={req.id} style={{
          padding: '16px 20px', borderRadius: '12px',
          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>
              {req.rewards?.title || 'Recompensa'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
              {req.rewards?.xp_cost} XP · {date}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '100px',
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
            color: statusColor, border: `1px solid ${statusColor}`,
          }}>
            {statusLabel}
          </span>
        </div>
      )
    })}
  </div>
)}
```

- [ ] **Step 5: Verificar en browser**

Navegar a `/perfil` → las 5 tabs deben funcionar. Tab Badges muestra la grilla de 8 badges (los no ganados en gris). Tab Recompensas muestra el saldo XP y las recompensas activas.

- [ ] **Step 6: Commit**

```bash
git add app/perfil/
git commit -m "feat: perfil con tabs de badges, recompensas y mis canjes"
```

---

### Task 8: Admin — página de gestión de gamificación

**Files:**
- Create: `app/admin/gamificacion/page.tsx`
- Create: `app/admin/gamificacion/GamificacionClient.tsx`

**Interfaces:**
- Consumes: tablas `badges`, `rewards`, `reward_requests`, `user_xp`, `profiles`; endpoints `PATCH /api/rewards/[id]`

- [ ] **Step 1: Crear `app/admin/gamificacion/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GamificacionClient from './GamificacionClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gamificación — Admin Estudio Norte' }

export default async function AdminGamificacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const [
    { data: badges },
    { data: rewards },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase.from('badges').select('*').order('created_at'),
    supabase.from('rewards').select('*').order('created_at'),
    supabase
      .from('reward_requests')
      .select('id, requested_at, user_id, reward_id, rewards(title, xp_cost, type), profiles(full_name)')
      .eq('status', 'pending')
      .order('requested_at'),
  ])

  // XP actual de cada usuario con solicitud pendiente
  const userIds = [...new Set((pendingRequests || []).map((r: { user_id: string }) => r.user_id))]
  const { data: xpRows } = userIds.length > 0
    ? await supabase.from('user_xp').select('user_id, total_xp').in('user_id', userIds)
    : { data: [] }

  const xpByUser = Object.fromEntries((xpRows || []).map((r: { user_id: string; total_xp: number }) => [r.user_id, r.total_xp]))

  const requestsWithXp = (pendingRequests || []).map((r: {
    id: string
    requested_at: string
    user_id: string
    reward_id: string
    rewards: { title: string; xp_cost: number; type: string } | null
    profiles: { full_name: string | null } | null
  }) => ({
    ...r,
    user_xp: xpByUser[r.user_id] || 0,
  }))

  return (
    <GamificacionClient
      badges={badges || []}
      rewards={rewards || []}
      pendingRequests={requestsWithXp}
    />
  )
}
```

- [ ] **Step 2: Crear `app/admin/gamificacion/GamificacionClient.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Badge {
  id: string; slug: string; name: string; emoji: string; description: string;
  condition_type: string; condition_value: number; is_active: boolean;
}

interface Reward {
  id: string; title: string; description: string; type: string;
  xp_cost: number; stock: number | null; is_active: boolean;
}

interface PendingRequest {
  id: string; requested_at: string; user_id: string;
  rewards: { title: string; xp_cost: number; type: string } | null
  profiles: { full_name: string | null } | null
  user_xp: number
}

interface Props {
  badges: Badge[]
  rewards: Reward[]
  pendingRequests: PendingRequest[]
}

type Tab = 'badges' | 'rewards' | 'canjes'

export default function GamificacionClient({ badges, rewards, pendingRequests }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('canjes')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [processed, setProcessed] = useState<Set<string>>(new Set())

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId)
    await fetch(`/api/rewards/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setProcessed(prev => new Set([...prev, requestId]))
    setProcessingId(null)
  }

  const pendingVisible = pendingRequests.filter(r => !processed.has(r.id))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <div style={{
        height: '56px', background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,40px)', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <Link href="/admin" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>
          ← Admin
        </Link>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)' }}>
          Gamificación
        </span>
        <div style={{ width: '80px' }}/>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--en-surface)', borderRadius: '12px', padding: '4px', border: '1px solid var(--en-border)' }}>
          {([['canjes', `Canjes pendientes (${pendingVisible.length})`], ['badges', 'Badges'], ['rewards', 'Recompensas']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer', border: 'none',
              background: activeTab === tab ? 'var(--en-green-light)' : 'transparent',
              color: activeTab === tab ? 'var(--en-green)' : 'var(--en-text-soft)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
            }}>{label}</button>
          ))}
        </div>

        {/* Tab: Canjes */}
        {activeTab === 'canjes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingVisible.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontSize: '14px' }}>
                No hay canjes pendientes.
              </div>
            )}
            {pendingVisible.map(req => {
              const typeLabel = req.rewards?.type === 'course' ? '🎓' : req.rewards?.type === 'discount' ? '💸' : '🤝'
              const date = new Date(req.requested_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
              const canApprove = req.user_xp >= (req.rewards?.xp_cost || 0)
              return (
                <div key={req.id} style={{
                  padding: '20px', borderRadius: '14px',
                  background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>
                      {typeLabel} {req.rewards?.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '4px' }}>
                      {req.profiles?.full_name || 'Alumno'} · {req.rewards?.xp_cost} XP · {date}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', marginTop: '2px', color: canApprove ? 'var(--en-green)' : 'var(--en-coral)' }}>
                      XP actual del alumno: {req.user_xp} {!canApprove && '⚠️ insuficiente'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRequest(req.id, 'approve')}
                      disabled={processingId === req.id || !canApprove}
                      style={{
                        padding: '9px 18px', borderRadius: '10px', border: 'none',
                        background: canApprove ? 'var(--en-green)' : 'var(--en-border)',
                        color: canApprove ? 'var(--en-white)' : 'var(--en-text-soft)',
                        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: canApprove ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {processingId === req.id ? '...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleRequest(req.id, 'reject')}
                      disabled={processingId === req.id}
                      style={{
                        padding: '9px 18px', borderRadius: '10px',
                        border: '1px solid var(--en-coral)',
                        background: 'transparent', color: 'var(--en-coral)',
                        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab: Badges */}
        {activeTab === 'badges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{
                padding: '16px 20px', borderRadius: '14px',
                background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: badge.is_active ? 1 : 0.5,
              }}>
                <span style={{ fontSize: '28px' }}>{badge.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>
                    {badge.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
                    {badge.description}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '2px', fontStyle: 'italic' }}>
                    Condición: {badge.condition_type} ≥ {badge.condition_value}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '100px',
                  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                  color: badge.is_active ? 'var(--en-green)' : 'var(--en-text-soft)',
                  border: `1px solid ${badge.is_active ? 'var(--en-green-15)' : 'var(--en-border)'}`,
                }}>
                  {badge.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', textAlign: 'center', marginTop: '8px' }}>
              Para editar badges, usar el SQL Editor de Supabase por ahora.
            </p>
          </div>
        )}

        {/* Tab: Recompensas */}
        {activeTab === 'rewards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rewards.map(reward => {
              const typeLabel = reward.type === 'course' ? '🎓 Curso gratis' : reward.type === 'discount' ? '💸 Descuento' : '🤝 Mentoría'
              return (
                <div key={reward.id} style={{
                  padding: '16px 20px', borderRadius: '14px',
                  background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  opacity: reward.is_active ? 1 : 0.5,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginBottom: '2px' }}>{typeLabel}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>{reward.title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>{reward.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--en-green)' }}>{reward.xp_cost} XP</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
                      Stock: {reward.stock === null ? '∞' : reward.stock}
                    </div>
                  </div>
                </div>
              )
            })}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', textAlign: 'center', marginTop: '8px' }}>
              Para crear o editar recompensas, usar el SQL Editor de Supabase por ahora.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
```

- [ ] **Step 3: Agregar link en el admin nav**

En `app/admin/page.tsx`, agregar un link a `/admin/gamificacion` en el panel de navegación existente.

- [ ] **Step 4: Verificar en browser**

Logueado como admin, navegar a `/admin/gamificacion`. Las 3 tabs deben funcionar. Si no hay canjes pendientes, mostrar el mensaje vacío.

- [ ] **Step 5: Commit**

```bash
git add app/admin/gamificacion/
git commit -m "feat: admin gamificación — gestión de badges, recompensas y canjes"
```

---

### Task 9: Deploy

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Corregir cualquier error de tipos antes de continuar.

- [ ] **Step 2: Deploy**

```bash
npx vercel --prod --cwd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
```

- [ ] **Step 3: Smoke test en producción**

1. Completar una lección → verificar que el XP sube en el dashboard
2. Ver el ranking en el sidebar del player
3. Ver los badges en `/perfil` → tab Badges
4. Ver las recompensas en `/perfil` → tab Recompensas
5. Logueado como admin, ir a `/admin/gamificacion`
