# Admin de Cursos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un panel admin completo en `/admin/cursos` que permita crear/editar cursos, módulos y lecciones, y subir PDFs a Supabase Storage, sin tocar Supabase directamente.

**Architecture:** Página de lista existente habilitada con botón "Nuevo curso"; página `/admin/cursos/nuevo` para crear; página `/admin/cursos/[id]` para editar metadata + gestionar módulos y lecciones en una sola pantalla. El upload de PDFs usa signed upload URLs (browser → Storage directo, el servidor solo genera el token). Todas las API routes protegidas con `createClient()` auth + is_admin guard antes de cualquier operación, luego `createAdminClient()` para las writes.

**Tech Stack:** Next.js 15 App Router, Supabase (DB + Storage), TypeScript, React hooks (useState, useTransition)

## Global Constraints

- El panel admin usa el **tema oscuro DS V1** — usar SOLO estas variables CSS: `var(--color-teal)`, `var(--color-text)`, `var(--color-coral)`, `var(--font-body)`, `var(--font-display)`, y colores rgba como `rgba(247,247,242,0.X)` para texto suave, `rgba(255,255,255,0.0X)` para fondos/bordes. NO usar variables `--en-*` (esas son DS V2, solo para páginas de usuario).
- Patrón de auth en todas las API routes admin:
  ```typescript
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admin = createAdminClient()
  ```
- Imports: `createClient` desde `@/lib/supabase/server`, `createAdminClient` desde `@/lib/supabase/admin`
- Next.js 15: `params` en Server Components es `Promise<{...}>` — siempre `await params`
- `revalidatePath` de `next/cache` para invalidar caché tras mutations en Server Actions
- No hay test suite automatizado — "verificar" significa navegar manualmente en el browser al final de cada tarea
- DB: tabla `courses` (id, slug, title, subtitle, description, price_ars, price_usd, is_published, is_featured), `modules` (id, course_id, title, order_index), `lessons` (id, module_id, title, description, pdf_url, video_url, duration_minutes, is_free_preview, order_index, xp_value)
- Storage bucket: `course-pdfs` (público para lectura, uploads autenticados via signed URL)
- Slug del curso: generado automáticamente desde el título (lowercase, espacios → guiones, sin caracteres especiales)

---

## File Map

**Crear:**
- `supabase/migrations/006_admin_content.sql` — add `pdf_url` column a lessons + RLS para storage
- `app/api/admin/cursos/route.ts` — POST crear curso
- `app/api/admin/cursos/[id]/route.ts` — PATCH editar curso
- `app/api/admin/cursos/[id]/modulos/route.ts` — POST crear módulo
- `app/api/admin/modulos/[id]/route.ts` — PATCH editar módulo, DELETE eliminar
- `app/api/admin/modulos/[id]/lecciones/route.ts` — POST crear lección
- `app/api/admin/lecciones/[id]/route.ts` — PATCH editar lección, DELETE eliminar
- `app/api/admin/upload/pdf/route.ts` — POST generar signed upload URL
- `app/admin/cursos/nuevo/page.tsx` — Server Component shell
- `app/admin/cursos/nuevo/NuevoCursoForm.tsx` — Client Component form
- `app/admin/cursos/[id]/page.tsx` — Server Component: carga datos, renderiza cliente
- `app/admin/cursos/[id]/EditCursoClient.tsx` — Client Component: toda la UI interactiva

**Modificar:**
- `app/admin/cursos/page.tsx` — habilitar botón "Nuevo curso" (Link), agregar columna "Editar"

---

### Task 1: DB Migration — pdf_url + Storage bucket

**Files:**
- Create: `supabase/migrations/006_admin_content.sql`

**Interfaces:**
- Produces: columna `lessons.pdf_url TEXT`, bucket `course-pdfs` disponible en Supabase Storage

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/006_admin_content.sql

-- Add pdf_url to lessons (video_url already exists from initial schema)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Storage bucket for course PDFs
-- Run this in Supabase Dashboard > Storage > New bucket:
-- Name: course-pdfs, Public: true
-- OR via SQL (requires pg_storage extension):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('course-pdfs', 'course-pdfs', true) ON CONFLICT DO NOTHING;

-- RLS for storage: only admins can upload, anyone can read
DROP POLICY IF EXISTS "Admin can upload PDFs" ON storage.objects;
CREATE POLICY "Admin can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-pdfs'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Public can read PDFs" ON storage.objects;
CREATE POLICY "Public can read PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-pdfs');
```

- [ ] **Step 2: Aplicar la migración en Supabase**

Ir a Supabase Dashboard → SQL Editor → pegar y ejecutar el SQL de arriba.

Luego ir a Storage → New bucket → nombre: `course-pdfs`, marcar "Public bucket" → Create.

(La parte de RLS de storage puede hacerse también desde SQL Editor.)

- [ ] **Step 3: Verificar**

En Supabase Dashboard → Table Editor → lessons → confirmar que existe columna `pdf_url`.
En Storage → confirmar que existe bucket `course-pdfs`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_admin_content.sql
git commit -m "feat: add pdf_url to lessons + course-pdfs storage bucket"
```

---

### Task 2: API Routes — CRUD completo

**Files:**
- Create: `app/api/admin/cursos/route.ts`
- Create: `app/api/admin/cursos/[id]/route.ts`
- Create: `app/api/admin/cursos/[id]/modulos/route.ts`
- Create: `app/api/admin/modulos/[id]/route.ts`
- Create: `app/api/admin/modulos/[id]/lecciones/route.ts`
- Create: `app/api/admin/lecciones/[id]/route.ts`
- Create: `app/api/admin/upload/pdf/route.ts`

**Interfaces:**
- Consumes: auth pattern del Global Constraints, `createClient` y `createAdminClient`
- Produces: endpoints que consume la UI en Tasks 4 y 5

#### `app/api/admin/cursos/route.ts`

- [ ] **Step 1: Crear POST /api/admin/cursos**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, subtitle, description, price_ars, price_usd, is_featured } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })
  if (typeof price_ars !== 'number') return NextResponse.json({ error: 'price_ars required' }, { status: 400 })

  const slug = slugify(title)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('courses')
    .insert({ title: title.trim(), subtitle: subtitle?.trim() || null, description: description?.trim() || null, slug, price_ars, price_usd: price_usd || null, is_featured: !!is_featured, is_published: false })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'slug_conflict', slug }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
```

#### `app/api/admin/cursos/[id]/route.ts`

- [ ] **Step 2: Crear PATCH /api/admin/cursos/[id]**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['title', 'subtitle', 'description', 'price_ars', 'price_usd', 'is_featured', 'is_published']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'no fields to update' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('courses').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

#### `app/api/admin/cursos/[id]/modulos/route.ts`

- [ ] **Step 3: Crear POST /api/admin/cursos/[id]/modulos**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id: course_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const admin = createAdminClient()
  // Get next order_index
  const { count } = await admin.from('modules').select('id', { count: 'exact', head: true }).eq('course_id', course_id)
  const order_index = (count || 0)

  const { data, error } = await admin
    .from('modules')
    .insert({ course_id, title: title.trim(), order_index })
    .select('id, title, order_index')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

#### `app/api/admin/modulos/[id]/route.ts`

- [ ] **Step 4: Crear PATCH y DELETE /api/admin/modulos/[id]**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return null
  return createAdminClient()
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if ('title' in body) updates.title = body.title
  if ('order_index' in body) updates.order_index = body.order_index
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const { error } = await admin.from('modules').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await admin.from('modules').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

#### `app/api/admin/modulos/[id]/lecciones/route.ts`

- [ ] **Step 5: Crear POST /api/admin/modulos/[id]/lecciones**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id: module_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, is_free_preview, duration_minutes, xp_value } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const admin = createAdminClient()
  const { count } = await admin.from('lessons').select('id', { count: 'exact', head: true }).eq('module_id', module_id)
  const order_index = (count || 0)

  const { data, error } = await admin
    .from('lessons')
    .insert({
      module_id,
      title: title.trim(),
      description: description?.trim() || null,
      is_free_preview: !!is_free_preview,
      duration_minutes: duration_minutes || null,
      xp_value: xp_value || 10,
      order_index,
      pdf_url: null,
    })
    .select('id, title, description, is_free_preview, duration_minutes, xp_value, order_index, pdf_url')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

#### `app/api/admin/lecciones/[id]/route.ts`

- [ ] **Step 6: Crear PATCH y DELETE /api/admin/lecciones/[id]**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return null
  return createAdminClient()
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['title', 'description', 'is_free_preview', 'duration_minutes', 'xp_value', 'order_index', 'pdf_url']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const { error } = await admin.from('lessons').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await admin.from('lessons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

#### `app/api/admin/upload/pdf/route.ts`

- [ ] **Step 7: Crear POST /api/admin/upload/pdf (signed upload URL)**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { courseSlug, lessonId } = await req.json()
  if (!courseSlug || !lessonId) return NextResponse.json({ error: 'courseSlug and lessonId required' }, { status: 400 })

  const path = `${courseSlug}/${lessonId}.pdf`
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('course-pdfs')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-pdfs/${path}`
  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
```

- [ ] **Step 8: Commit**

```bash
git add app/api/admin/cursos/ app/api/admin/modulos/ app/api/admin/lecciones/ app/api/admin/upload/
git commit -m "feat: admin CRUD API routes for courses, modules, lessons, pdf upload"
```

---

### Task 3: Admin list page — habilitar "Nuevo curso" y link "Editar"

**Files:**
- Modify: `app/admin/cursos/page.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: botón "Nuevo curso" navega a `/admin/cursos/nuevo`; columna Acciones tiene link "Editar" → `/admin/cursos/[id]`

- [ ] **Step 1: Reemplazar el div "Nuevo curso" por un Link**

Localizar el `<div>` con `cursor: 'not-allowed'` y el texto "Nuevo curso (próximamente)" y reemplazarlo por:

```tsx
<Link href="/admin/cursos/nuevo" style={{
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
  background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)',
  fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-teal)', fontWeight: 600,
}}>
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
  Nuevo curso
</Link>
```

- [ ] **Step 2: Agregar link "Editar" en columna Acciones**

En la celda de Acciones (td con `display: 'flex', gap: '8px'`), agregar antes del `TogglePublish`:

```tsx
<Link href={`/admin/cursos/${c.id}`} style={{
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  fontSize: '12px', color: 'var(--color-teal)', textDecoration: 'none',
  padding: '5px 12px', borderRadius: '8px',
  background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.12)',
  fontFamily: 'var(--font-body)', fontWeight: 600,
}}>
  Editar
</Link>
```

- [ ] **Step 3: Verificar en browser**

Navegar a `/admin/cursos`. El botón "Nuevo curso" debe ser clickeable y navegar a `/admin/cursos/nuevo`. En la tabla, cada fila debe tener botón "Editar" que navega a `/admin/cursos/[id]`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/cursos/page.tsx
git commit -m "feat: enable Nuevo curso button and Editar links in admin course list"
```

---

### Task 4: Página /admin/cursos/nuevo — Formulario de creación

**Files:**
- Create: `app/admin/cursos/nuevo/page.tsx`
- Create: `app/admin/cursos/nuevo/NuevoCursoForm.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/cursos` (Task 2) — body: `{ title, subtitle, description, price_ars, price_usd, is_featured }`, response: `{ id, slug }`
- Produces: al crear, redirige a `/admin/cursos/[id]` para continuar con módulos

#### `app/admin/cursos/nuevo/page.tsx`

- [ ] **Step 1: Crear Server Component shell**

```tsx
import NuevoCursoForm from './NuevoCursoForm'

export default function NuevoCursoPage() {
  return <NuevoCursoForm />
}
```

#### `app/admin/cursos/nuevo/NuevoCursoForm.tsx`

- [ ] **Step 2: Crear Client Component del formulario**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoCursoForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    price_ars: '',
    price_usd: '',
    is_featured: false,
  })

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (!form.price_ars || isNaN(Number(form.price_ars))) { setError('Precio ARS inválido'); return }

    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        price_ars: Number(form.price_ars),
        price_usd: form.price_usd ? Number(form.price_usd) : null,
        is_featured: form.is_featured,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'slug_conflict' ? 'Ya existe un curso con ese nombre. Probá un título diferente.' : (data.error || 'Error al crear'))
      setSaving(false)
      return
    }
    router.push(`/admin/cursos/${data.id}`)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px',
    fontFamily: 'var(--font-body)', fontSize: '12px',
    color: 'rgba(247,247,242,0.4)', fontWeight: 600, letterSpacing: '0.5px',
  }

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Gestión
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Nuevo curso
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Análisis Técnico desde Cero" />
        </div>
        <div>
          <label style={labelStyle}>Subtítulo</label>
          <input style={inputStyle} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Una línea descriptiva" />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción larga del curso" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Precio ARS *</label>
            <input style={inputStyle} type="number" value={form.price_ars} onChange={e => set('price_ars', e.target.value)} placeholder="29999" />
          </div>
          <div>
            <label style={labelStyle}>Precio USD</label>
            <input style={inputStyle} type="number" value={form.price_usd} onChange={e => set('price_usd', e.target.value)} placeholder="29" />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
          <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-teal)' }} />
          Destacado en la home
        </label>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-coral)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => router.push('/admin/cursos')}
            style={{ padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(247,247,242,0.4)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '12px 24px', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', color: 'var(--color-teal)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Creando...' : 'Crear curso'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Verificar en browser**

Navegar a `/admin/cursos/nuevo`. Completar el form con título "Curso de Prueba" y precio ARS 10000. Hacer click en "Crear curso". Debe redirigir a `/admin/cursos/[id]` (aunque todavía no exista esa página — mostrará 404, lo cual es correcto en este punto).

Verificar en Supabase Dashboard que el curso fue creado con el slug correcto.

- [ ] **Step 4: Commit**

```bash
git add app/admin/cursos/nuevo/
git commit -m "feat: admin /cursos/nuevo page with course creation form"
```

---

### Task 5: Página /admin/cursos/[id] — Edición de curso + módulos + lecciones

**Files:**
- Create: `app/admin/cursos/[id]/page.tsx`
- Create: `app/admin/cursos/[id]/EditCursoClient.tsx`

**Interfaces:**
- Consumes: todos los endpoints de Task 2
- Produces: UI completa para gestionar un curso

#### `app/admin/cursos/[id]/page.tsx`

- [ ] **Step 1: Crear Server Component que carga los datos**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import EditCursoClient from './EditCursoClient'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditCursoPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, title, subtitle, description, price_ars, price_usd, is_published, is_featured')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, order_index, lessons(id, title, description, is_free_preview, duration_minutes, xp_value, order_index, pdf_url)')
    .eq('course_id', id)
    .order('order_index')

  return (
    <EditCursoClient
      course={course}
      initialModules={(modules || []).map(m => ({
        ...m,
        lessons: ((m.lessons as unknown as Lesson[]) || []).sort((a, b) => a.order_index - b.order_index),
      }))}
    />
  )
}

interface Lesson {
  id: string; title: string; description: string | null
  is_free_preview: boolean; duration_minutes: number | null
  xp_value: number; order_index: number; pdf_url: string | null
}
```

#### `app/admin/cursos/[id]/EditCursoClient.tsx`

- [ ] **Step 2: Crear tipos e interfaces**

Al inicio del archivo:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  description: string | null
  is_free_preview: boolean
  duration_minutes: number | null
  xp_value: number
  order_index: number
  pdf_url: string | null
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  price_ars: number
  price_usd: number | null
  is_published: boolean
  is_featured: boolean
}

interface Props {
  course: Course
  initialModules: Module[]
}
```

- [ ] **Step 3: Implementar el componente principal**

```tsx
export default function EditCursoClient({ course, initialModules }: Props) {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [savingMsg, setSavingMsg] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState({
    title: course.title,
    subtitle: course.subtitle || '',
    description: course.description || '',
    price_ars: String(course.price_ars),
    price_usd: course.price_usd ? String(course.price_usd) : '',
    is_featured: course.is_featured,
    is_published: course.is_published,
  })
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null)

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontFamily: 'var(--font-body)',
    fontSize: '11px', color: 'rgba(247,247,242,0.35)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
  }
  const sectionStyle: React.CSSProperties = {
    borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.015)', padding: '28px', marginBottom: '24px',
  }

  async function saveCourse() {
    setSaving(true)
    setSavingMsg(null)
    const res = await fetch(`/api/admin/cursos/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: courseForm.title.trim(),
        subtitle: courseForm.subtitle.trim() || null,
        description: courseForm.description.trim() || null,
        price_ars: Number(courseForm.price_ars),
        price_usd: courseForm.price_usd ? Number(courseForm.price_usd) : null,
        is_featured: courseForm.is_featured,
        is_published: courseForm.is_published,
      }),
    })
    setSaving(false)
    setSavingMsg(res.ok ? '✓ Guardado' : '✗ Error al guardar')
    setTimeout(() => setSavingMsg(null), 2000)
  }

  async function addModule() {
    const title = prompt('Título del módulo:')
    if (!title?.trim()) return
    const res = await fetch(`/api/admin/cursos/${course.id}/modulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (!res.ok) return
    const newMod: Module = { ...(await res.json()), lessons: [] }
    setModules(m => [...m, newMod])
    setExpandedModules(s => new Set([...s, newMod.id]))
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return
    const res = await fetch(`/api/admin/modulos/${moduleId}`, { method: 'DELETE' })
    if (!res.ok) return
    setModules(m => m.filter(mod => mod.id !== moduleId))
  }

  async function moveModule(moduleId: string, direction: 'up' | 'down') {
    const idx = modules.findIndex(m => m.id === moduleId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === modules.length - 1) return
    const newModules = [...modules]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newModules[idx], newModules[swapIdx]] = [newModules[swapIdx], newModules[idx]]
    const updated = newModules.map((m, i) => ({ ...m, order_index: i }))
    setModules(updated)
    await Promise.all([
      fetch(`/api/admin/modulos/${updated[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: idx }) }),
      fetch(`/api/admin/modulos/${updated[swapIdx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: swapIdx }) }),
    ])
  }

  async function addLesson(moduleId: string) {
    const title = prompt('Título de la lección:')
    if (!title?.trim()) return
    const res = await fetch(`/api/admin/modulos/${moduleId}/lecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (!res.ok) return
    const newLesson: Lesson = await res.json()
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: [...mod.lessons, newLesson] } : mod))
    setExpandedLessons(s => new Set([...s, newLesson.id]))
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    const res = await fetch(`/api/admin/lecciones/${lessonId}`, { method: 'DELETE' })
    if (!res.ok) return
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) } : mod))
  }

  async function saveLesson(moduleId: string, lesson: Lesson) {
    const res = await fetch(`/api/admin/lecciones/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: lesson.title,
        description: lesson.description || null,
        is_free_preview: lesson.is_free_preview,
        duration_minutes: lesson.duration_minutes || null,
        xp_value: lesson.xp_value || 10,
      }),
    })
    if (res.ok) {
      setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.map(l => l.id === lesson.id ? lesson : l) } : mod))
    }
  }

  async function moveLesson(moduleId: string, lessonId: string, direction: 'up' | 'down') {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    const idx = mod.lessons.findIndex(l => l.id === lessonId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === mod.lessons.length - 1) return
    const newLessons = [...mod.lessons]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newLessons[idx], newLessons[swapIdx]] = [newLessons[swapIdx], newLessons[idx]]
    const updated = newLessons.map((l, i) => ({ ...l, order_index: i }))
    setModules(m => m.map(mod2 => mod2.id === moduleId ? { ...mod2, lessons: updated } : mod2))
    await Promise.all([
      fetch(`/api/admin/lecciones/${updated[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: idx }) }),
      fetch(`/api/admin/lecciones/${updated[swapIdx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: swapIdx }) }),
    ])
  }

  async function uploadPdf(moduleId: string, lessonId: string, file: File) {
    if (file.type !== 'application/pdf') { alert('Solo se aceptan archivos PDF'); return }
    if (file.size > 50 * 1024 * 1024) { alert('El archivo no puede superar 50MB'); return }

    setUploadingLesson(lessonId)
    try {
      // 1. Get signed URL
      const signRes = await fetch('/api/admin/upload/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, lessonId }),
      })
      if (!signRes.ok) { alert('Error al obtener URL de subida'); return }
      const { signedUrl, publicUrl } = await signRes.json()

      // 2. Upload directly to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      })
      if (!uploadRes.ok) { alert('Error al subir el archivo'); return }

      // 3. Save pdf_url to lesson
      await fetch(`/api/admin/lecciones/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_url: publicUrl }),
      })

      setModules(m => m.map(mod => mod.id === moduleId ? {
        ...mod,
        lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, pdf_url: publicUrl } : l)
      } : mod))
    } finally {
      setUploadingLesson(null)
    }
  }

  function updateLessonField(moduleId: string, lessonId: string, field: keyof Lesson, value: unknown) {
    setModules(m => m.map(mod => mod.id === moduleId ? {
      ...mod,
      lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
    } : mod))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => router.push('/admin/cursos')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', marginBottom: '8px', padding: 0 }}>
            ← Volver a cursos
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-1.5px', color: 'var(--color-text)', margin: 0 }}>
            {courseForm.title || 'Sin título'}
          </h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.2)', marginTop: '4px' }}>/{course.slug}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {savingMsg && <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: savingMsg.startsWith('✓') ? 'var(--color-teal)' : 'var(--color-coral)' }}>{savingMsg}</span>}
          <button
            onClick={saveCourse}
            disabled={saving}
            style={{ padding: '10px 20px', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)', color: 'var(--color-teal)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Course metadata section */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '24px' }}>
          Datos del curso
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input style={inputStyle} value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Subtítulo</label>
            <input style={inputStyle} value={courseForm.subtitle} onChange={e => setCourseForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Precio ARS</label>
              <input style={inputStyle} type="number" value={courseForm.price_ars} onChange={e => setCourseForm(f => ({ ...f, price_ars: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Precio USD</label>
              <input style={inputStyle} type="number" value={courseForm.price_usd} onChange={e => setCourseForm(f => ({ ...f, price_usd: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
              <input type="checkbox" checked={courseForm.is_featured} onChange={e => setCourseForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ accentColor: 'var(--color-teal)' }} />
              Destacado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
              <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm(f => ({ ...f, is_published: e.target.checked }))} style={{ accentColor: 'var(--color-teal)' }} />
              Publicado
            </label>
          </div>
        </div>
      </div>

      {/* Modules section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', margin: 0 }}>
            Módulos ({modules.length})
          </h2>
          <button
            onClick={addModule}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)', color: 'var(--color-teal)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Agregar módulo
          </button>
        </div>

        {modules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(247,247,242,0.2)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            Sin módulos. Agregá el primero.
          </div>
        )}

        {modules.map((mod, modIdx) => {
          const isExpanded = expandedModules.has(mod.id)
          return (
            <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Module header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                onClick={() => setExpandedModules(s => { const n = new Set(s); isExpanded ? n.delete(mod.id) : n.add(mod.id); return n })}>
                <span style={{ color: 'rgba(247,247,242,0.3)', fontSize: '12px', userSelect: 'none' }}>{isExpanded ? '▼' : '▶'}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                  {modIdx + 1}. {mod.title}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)' }}>
                  {mod.lessons.length} lección{mod.lessons.length !== 1 ? 'es' : ''}
                </span>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveModule(mod.id, 'up')} disabled={modIdx === 0} style={{ background: 'none', border: 'none', cursor: modIdx === 0 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '14px', padding: '2px 6px', opacity: modIdx === 0 ? 0.2 : 1 }}>↑</button>
                  <button onClick={() => moveModule(mod.id, 'down')} disabled={modIdx === modules.length - 1} style={{ background: 'none', border: 'none', cursor: modIdx === modules.length - 1 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '14px', padding: '2px 6px', opacity: modIdx === modules.length - 1 ? 0.2 : 1 }}>↓</button>
                  <button onClick={() => deleteModule(mod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,107,0.4)', fontSize: '18px', padding: '2px 6px', lineHeight: 1 }}>×</button>
                </div>
              </div>

              {/* Lessons */}
              {isExpanded && (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mod.lessons.map((lesson, lsnIdx) => {
                    const lsnExpanded = expandedLessons.has(lesson.id)
                    return (
                      <div key={lesson.id} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Lesson header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                          onClick={() => setExpandedLessons(s => { const n = new Set(s); lsnExpanded ? n.delete(lesson.id) : n.add(lesson.id); return n })}>
                          <span style={{ color: 'rgba(247,247,242,0.25)', fontSize: '11px' }}>{lsnExpanded ? '▼' : '▶'}</span>
                          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.75)' }}>
                            {modIdx + 1}.{lsnIdx + 1} {lesson.title}
                            {lesson.is_free_preview && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(78,205,196,0.1)', color: 'var(--color-teal)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(78,205,196,0.2)' }}>preview</span>}
                            {lesson.pdf_url && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(255,255,255,0.04)', color: 'rgba(247,247,242,0.3)', padding: '2px 8px', borderRadius: '100px' }}>PDF ✓</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => moveLesson(mod.id, lesson.id, 'up')} disabled={lsnIdx === 0} style={{ background: 'none', border: 'none', cursor: lsnIdx === 0 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '13px', padding: '2px 5px', opacity: lsnIdx === 0 ? 0.2 : 1 }}>↑</button>
                            <button onClick={() => moveLesson(mod.id, lesson.id, 'down')} disabled={lsnIdx === mod.lessons.length - 1} style={{ background: 'none', border: 'none', cursor: lsnIdx === mod.lessons.length - 1 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '13px', padding: '2px 5px', opacity: lsnIdx === mod.lessons.length - 1 ? 0.2 : 1 }}>↓</button>
                            <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,107,0.4)', fontSize: '16px', padding: '2px 5px', lineHeight: 1 }}>×</button>
                          </div>
                        </div>

                        {/* Lesson form */}
                        {lsnExpanded && (
                          <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={labelStyle}>Título</label>
                              <input style={inputStyle} value={lesson.title} onChange={e => updateLessonField(mod.id, lesson.id, 'title', e.target.value)} />
                            </div>
                            <div>
                              <label style={labelStyle}>Descripción</label>
                              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={lesson.description || ''} onChange={e => updateLessonField(mod.id, lesson.id, 'description', e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <label style={labelStyle}>Duración (min)</label>
                                <input style={inputStyle} type="number" value={lesson.duration_minutes ?? ''} onChange={e => updateLessonField(mod.id, lesson.id, 'duration_minutes', e.target.value ? Number(e.target.value) : null)} />
                              </div>
                              <div>
                                <label style={labelStyle}>XP</label>
                                <input style={inputStyle} type="number" value={lesson.xp_value} onChange={e => updateLessonField(mod.id, lesson.id, 'xp_value', Number(e.target.value) || 10)} />
                              </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)' }}>
                              <input type="checkbox" checked={lesson.is_free_preview} onChange={e => updateLessonField(mod.id, lesson.id, 'is_free_preview', e.target.checked)} style={{ accentColor: 'var(--color-teal)' }} />
                              Preview gratuita (visible sin suscripción)
                            </label>

                            {/* PDF upload */}
                            <div>
                              <label style={labelStyle}>PDF</label>
                              {lesson.pdf_url ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-teal)' }}>Ver PDF actual</a>
                                  <span style={{ color: 'rgba(247,247,242,0.2)', fontSize: '12px' }}>|</span>
                                  <label style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.4)' }}>
                                    Reemplazar
                                    <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadPdf(mod.id, lesson.id, e.target.files[0]); e.target.value = '' }} />
                                  </label>
                                </div>
                              ) : (
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: uploadingLesson === lesson.id ? 'wait' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)' }}>
                                  {uploadingLesson === lesson.id ? 'Subiendo...' : '+ Subir PDF'}
                                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} disabled={uploadingLesson === lesson.id} onChange={e => { if (e.target.files?.[0]) uploadPdf(mod.id, lesson.id, e.target.files[0]); e.target.value = '' }} />
                                </label>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                              <button
                                onClick={() => saveLesson(mod.id, lesson)}
                                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)', color: 'var(--color-teal)' }}
                              >
                                Guardar lección
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button
                    onClick={() => addLesson(mod.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.08)', color: 'rgba(247,247,242,0.3)', width: '100%', justifyContent: 'center' }}
                  >
                    + Agregar lección
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar en browser**

1. Navegar a `/admin/cursos` → hacer click en "Editar" de un curso.
2. Verificar que la página carga con los datos del curso.
3. Modificar el título y hacer click en "Guardar cambios" — debe mostrar "✓ Guardado".
4. Hacer click en "Agregar módulo" → ingresar un nombre → verificar que aparece en la lista.
5. Expandir el módulo → "Agregar lección" → completar datos → "Guardar lección".
6. Subir un PDF de prueba → verificar que aparece "PDF ✓" en el header de la lección.
7. Probar los botones ↑ ↓ en módulos y lecciones.
8. Verificar en Supabase Dashboard que los datos se guardaron correctamente.

- [ ] **Step 5: Commit**

```bash
git add app/admin/cursos/
git commit -m "feat: admin /cursos/[id] — full course editing with modules, lessons and PDF upload"
```
