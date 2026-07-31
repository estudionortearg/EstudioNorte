# Estudio Norte — Certificados Verificables
**Fecha:** 2026-07-31
**Estado:** Aprobado

---

## Sección 1 — Base de Datos

### Tabla nueva (`supabase/migrations/004_certificates.sql`)

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  UNIQUE(user_id, course_id)
);

-- RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Cualquier persona puede leer por verification_code (para ruta pública)
CREATE POLICY "certificates_read_by_code"
  ON certificates FOR SELECT
  USING (true);

-- Solo el server client (service role) inserta — nunca el usuario directamente
-- No INSERT policy para authenticated users
```

**Nota:** La emisión del certificado ocurre server-side en `app/certificados/[slug]/page.tsx` usando el cliente de Supabase con service role (o el server client que bypasea RLS). El usuario nunca inserta directamente.

---

## Sección 2 — Rutas y Lógica

### `/certificados/[slug]` (modificar existente)

**Requiere login.** Server Component.

**Lógica de emisión:**
1. Verificar auth → redirect `/login` si no hay sesión
2. Obtener curso por slug → `notFound()` si no existe
3. Verificar enrollment → redirect `/cursos/[slug]` si no tiene
4. Calcular completitud (lecciones completadas vs total)
5. Si `isComplete`:
   - Intentar INSERT en `certificates` con `ON CONFLICT DO NOTHING`
   - SELECT el certificado (existente o recién creado) para obtener `verification_code` e `issued_at`
6. Si `!isComplete`: renderizar vista de progreso (igual que hoy)
7. Pasar al Client Component: `courseTitle`, `displayName`, `isComplete`, `verificationCode`, `issuedAt`, `completedCount`, `totalLessons`

**URL verificable:** `https://estudionorte.ar/verificar/[verification_code]`

### `/verificar/[code]` (nueva — pública, sin auth)

Server Component. Sin middleware de auth.

**Lógica:**
1. Query `certificates` WHERE `verification_code = code`, join `courses(title, slug)` y `profiles(full_name)`
2. Si no existe → `notFound()`
3. Renderizar vista de verificación standalone (sin layout de la app)

---

## Sección 3 — Componentes UI

### `CertificadoClient.tsx` (reescribir)

`'use client'`

**Props:**
```typescript
interface Props {
  courseTitle: string
  courseSlug: string
  displayName: string
  isComplete: boolean
  completedCount: number
  totalLessons: number
  verificationCode: string   // solo cuando isComplete
  issuedAt: string           // ISO string, solo cuando isComplete
}
```

**Vista incompleto** (igual que hoy, solo actualizar a vars V2):
- Barra de progreso con `--en-green`
- Botón "Continuar curso" con `--en-coral`
- Background `--en-bg`, texto `--en-text`

**Vista completo:**

Certificado visual en pantalla:
- Background: `--en-surface`, border: `--en-border`, shadow: `--en-shadow`
- Header: logo "EN" + "ESTUDIO NORTE" en `--en-green`
- Línea separadora con `--en-coral`
- Tipografía display (`--font-display`) para nombre del alumno y título del curso
- Texto: `--en-text`, soft: `--en-text-soft`
- Fecha: desde `issuedAt` formateada con `toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' })`
- Firma: "Juan Gallino / Director - Estudio Norte"

Botones bajo el certificado (3):
1. **Descargar PDF** — llama a `downloadPDF()` con jsPDF
2. **Compartir en LinkedIn** — `window.open(linkedInUrl, '_blank')`
3. **Copiar link** — `navigator.clipboard.writeText(verifyUrl)`, texto cambia a "¡Copiado!" por 2s

**URL de LinkedIn:**
```
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
  &name=[courseTitle]
  &organizationName=Estudio Norte
  &issueYear=[year]
  &issueMonth=[month]
  &certUrl=[verifyUrl]
  &certId=[verificationCode]
```

**PDF (jsPDF — DS V2):**
- Orientación: landscape A4
- Fondo: `#FAFAF8` (--en-bg)
- Borde: `#3D7A5F` (--en-green)
- Acento: `#E8735A` (--en-coral)
- Fuente: helvetica (jsPDF no soporta custom fonts sin embed)
- Fecha: desde `issuedAt` (no `new Date()`)
- Incluye URL de verificación al pie: `estudionorte.ar/verificar/[code]`

### `app/verificar/[code]/page.tsx` (nueva — standalone)

Server Component. Sin `import { createClient }` de auth — usa supabase anon.

**UI standalone** (sin layout de la app):
- Página completa centrada, background `--en-bg`
- Badge verde: "✓ Certificado auténtico"
- Logo "Estudio Norte" (texto, sin imagen)
- Nombre del alumno (Fraunces, grande)
- "completó satisfactoriamente"
- Título del curso (coral)
- Fecha de emisión
- Firma "Juan Gallino / Director"
- Footer: link "Conocé Estudio Norte →" → `/`
- Sin botones de descarga ni share (solo verificación)

---

## Sección 4 — Global Constraints

- Cero colores hardcodeados — solo CSS variables de `globals.css` en los componentes React (el PDF usa hex equivalentes porque jsPDF no lee CSS vars)
- El PDF usa los hex equivalentes exactos de las CSS vars: `#FAFAF8`, `#3D7A5F`, `#E8735A`, `#0F0F0F`, `#8A8A8A`
- Server Component en todas las rutas excepto `CertificadoClient.tsx`
- La ruta `/verificar/[code]` NO tiene auth check — es pública por diseño
- `issued_at` siempre viene de la DB, nunca de `new Date()` en el cliente
- La emisión del certificado usa `INSERT ... ON CONFLICT DO NOTHING` para ser idempotente

---

## Sección 5 — Archivos

### Nuevos
```
supabase/migrations/004_certificates.sql
app/verificar/[code]/page.tsx
```

### Modificados
```
app/certificados/[slug]/page.tsx       — auto-emitir certificado, pasar verificationCode + issuedAt
app/certificados/[slug]/CertificadoClient.tsx  — reescribir: DS V2 + botones share + LinkedIn
```
