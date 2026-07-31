# Certificados Verificables — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing certificate system to auto-emit verified certificates stored in DB, with a public verification URL and LinkedIn share button.

**Architecture:** A new `certificates` table stores one record per (user, course) pair with a UUID verification code. The existing `/certificados/[slug]` page auto-inserts the certificate on first visit when the course is complete, then passes the code to the redesigned Client Component. A new public route `/verificar/[code]` renders the certificate without auth for employers/LinkedIn to verify.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + RLS), jsPDF (already installed), TypeScript.

## Global Constraints

- Cero colores hardcodeados en componentes React — solo `var(--en-*)` de `globals.css`
- El PDF usa hex equivalentes exactos: `#FAFAF8` (bg), `#3D7A5F` (green), `#E8735A` (coral), `#0F0F0F` (text), `#8A8A8A` (text-soft)
- Supabase server client: `import { createClient } from '@/lib/supabase/server'` (async, para reads)
- Supabase admin client: `import { createAdminClient } from '@/lib/supabase/admin'` (para INSERT en certificates, bypasea RLS)
- `issued_at` siempre viene de la DB — nunca `new Date()` en el cliente
- Server Components en todas las rutas, `'use client'` solo en `CertificadoClient.tsx`
- La ruta `/verificar/[code]` es pública — sin auth check, sin redirect a login

---

## File Map

```
supabase/migrations/004_certificates.sql   ← NEW: tabla certificates + RLS
app/certificados/[slug]/page.tsx           ← MODIFY: auto-emit, pasar verificationCode + issuedAt
app/certificados/[slug]/CertificadoClient.tsx  ← REWRITE: DS V2 + 3 botones + PDF V2
app/verificar/[code]/page.tsx              ← NEW: página pública de verificación
```

---

### Task 1: Migración DB — tabla `certificates`

**Files:**
- Create: `supabase/migrations/004_certificates.sql`

**Interfaces:**
- Produces: tabla `certificates` con columnas `id`, `user_id`, `course_id`, `issued_at`, `verification_code`; RLS con SELECT público

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- supabase/migrations/004_certificates.sql

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verification_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  UNIQUE(user_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Cualquier persona puede leer un certificado por su código (ruta pública /verificar/[code])
CREATE POLICY "certificates_public_read"
  ON certificates FOR SELECT
  USING (true);

-- No INSERT policy para usuarios autenticados:
-- la emisión ocurre server-side vía admin client (service role bypasea RLS)
```

- [ ] **Step 2: Ejecutar la migración en Supabase**

Ir al SQL Editor del proyecto en Supabase y ejecutar el contenido completo del archivo.

Verificar que la tabla existe:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'certificates';
```
Esperado: columnas `id`, `user_id`, `course_id`, `issued_at`, `verification_code`.

- [ ] **Step 3: Verificar RLS**

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'certificates';
```
Esperado: `certificates_public_read` con `cmd = SELECT`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_certificates.sql
git commit -m "feat: migración tabla certificates con RLS pública de lectura"
```

---

### Task 2: Auto-emisión en `/certificados/[slug]/page.tsx`

**Files:**
- Modify: `app/certificados/[slug]/page.tsx`

**Interfaces:**
- Consumes: tabla `certificates` (Task 1), `createAdminClient` de `@/lib/supabase/admin`
- Produces: props `verificationCode: string | null` e `issuedAt: string | null` pasadas a `CertificadoClient`

- [ ] **Step 1: Reemplazar el contenido completo de `page.tsx`**

```typescript
// app/certificados/[slug]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import CertificadoClient from './CertificadoClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CertificadoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/cursos/${slug}`)

  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons (id)')
    .eq('course_id', course.id)

  const allLessonIds = (modules || []).flatMap(m =>
    ((m.lessons as unknown as { id: string }[]) || []).map(l => l.id)
  )

  const totalLessons = allLessonIds.length

  const { data: progressRows } = allLessonIds.length > 0
    ? await supabase
        .from('progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', allLessonIds)
    : { data: [] }

  const completedCount = (progressRows || []).length
  const isComplete = totalLessons > 0 && completedCount >= totalLessons

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Alumno'

  let verificationCode: string | null = null
  let issuedAt: string | null = null

  if (isComplete) {
    const admin = createAdminClient()

    // Emitir certificado (idempotente — ignorar conflicto si ya existe)
    await admin
      .from('certificates')
      .upsert(
        { user_id: user.id, course_id: course.id },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )

    const { data: cert } = await admin
      .from('certificates')
      .select('verification_code, issued_at')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single()

    verificationCode = cert?.verification_code ?? null
    issuedAt = cert?.issued_at ?? null
  }

  return (
    <CertificadoClient
      courseTitle={course.title}
      courseSlug={slug}
      displayName={displayName}
      isComplete={isComplete}
      completedCount={completedCount}
      totalLessons={totalLessons}
      verificationCode={verificationCode ?? undefined}
      issuedAt={issuedAt ?? undefined}
    />
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/certificados/[slug]/page.tsx
git commit -m "feat: auto-emitir certificado en DB al completar curso"
```

---

### Task 3: Reescribir `CertificadoClient.tsx` — DS V2 + botones + PDF V2

**Files:**
- Modify: `app/certificados/[slug]/CertificadoClient.tsx`

**Interfaces:**
- Consumes: props de Task 2 — `verificationCode?: string`, `issuedAt?: string`

- [ ] **Step 1: Reemplazar el contenido completo de `CertificadoClient.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  courseTitle: string
  courseSlug: string
  displayName: string
  isComplete: boolean
  completedCount: number
  totalLessons: number
  verificationCode?: string
  issuedAt?: string
}

export default function CertificadoClient({
  courseTitle, courseSlug, displayName, isComplete,
  completedCount, totalLessons, verificationCode, issuedAt,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const verifyUrl = verificationCode
    ? `https://estudionorte.ar/verificar/${verificationCode}`
    : ''

  const issuedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const linkedInUrl = (() => {
    if (!issuedAt || !verificationCode) return '#'
    const d = new Date(issuedAt)
    const p = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: courseTitle,
      organizationName: 'Estudio Norte',
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: verifyUrl,
      certId: verificationCode,
    })
    return `https://www.linkedin.com/profile/add?${p}`
  })()

  const copyLink = async () => {
    await navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297, H = 210

      // Background #FAFAF8
      doc.setFillColor(250, 250, 248)
      doc.rect(0, 0, W, H, 'F')

      // Borde #3D7A5F
      doc.setDrawColor(61, 122, 95)
      doc.setLineWidth(0.8)
      doc.rect(12, 12, W - 24, H - 24)

      // Línea superior coral #E8735A
      doc.setFillColor(232, 115, 90)
      doc.rect(12, 12, W - 24, 2.5, 'F')

      // "ESTUDIO NORTE"
      doc.setTextColor(61, 122, 95)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTUDIO NORTE', W / 2, 30, { align: 'center' })

      // Título
      doc.setTextColor(15, 15, 15)
      doc.setFontSize(26)
      doc.text('Certificado de Finalización', W / 2, 50, { align: 'center' })

      // Separador coral
      doc.setDrawColor(232, 115, 90)
      doc.setLineWidth(0.8)
      doc.line(W / 2 - 40, 56, W / 2 + 40, 56)

      // "Se certifica que"
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Se certifica que', W / 2, 70, { align: 'center' })

      // Nombre
      doc.setTextColor(15, 15, 15)
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.text(displayName, W / 2, 88, { align: 'center' })

      // "completó..."
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('completó satisfactoriamente el curso', W / 2, 102, { align: 'center' })

      // Título del curso coral
      doc.setTextColor(232, 115, 90)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(courseTitle, W / 2, 118, { align: 'center' })

      // Fecha
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(issuedDate, W / 2, 132, { align: 'center' })

      // Firma
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.4)
      doc.line(W / 2 - 35, 163, W / 2 + 35, 163)
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(9)
      doc.text('Juan Gallino', W / 2, 169, { align: 'center' })
      doc.text('Director - Estudio Norte', W / 2, 175, { align: 'center' })

      // URL de verificación
      doc.setTextColor(61, 122, 95)
      doc.setFontSize(7)
      doc.text(
        `Verificar en: estudionorte.ar/verificar/${verificationCode}`,
        W / 2, H - 16, { align: 'center' }
      )

      doc.save(`certificado-${courseSlug}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  // Vista incompleta
  if (!isComplete) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--en-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          maxWidth: '480px', width: '100%', textAlign: 'center',
          padding: '48px 40px', borderRadius: '24px',
          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
          boxShadow: 'var(--en-shadow)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900,
            color: 'var(--en-text)', marginBottom: '12px',
          }}>
            Todavía no terminaste el curso
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--en-text-soft)', marginBottom: '28px', lineHeight: 1.6,
          }}>
            {completedCount} de {totalLessons} clases ({pct}%).
            Terminá el curso para obtener tu certificado.
          </p>
          <div style={{
            height: '6px', borderRadius: '100px',
            background: 'var(--en-track-bg)', marginBottom: '28px',
          }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              width: pct + '%', background: 'var(--en-green)',
            }} />
          </div>
          <Link
            href={'/aprender/' + courseSlug}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px', textDecoration: 'none',
              background: 'var(--en-coral)', color: 'var(--en-white)',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
            }}
          >
            Continuar curso →
          </Link>
        </div>
      </div>
    )
  }

  // Vista completa
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--en-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Certificado visual */}
      <div style={{
        width: '100%', maxWidth: '760px',
        background: 'var(--en-surface)', borderRadius: '20px',
        border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-lg)',
        borderTop: '3px solid var(--en-coral)',
        padding: 'clamp(40px, 6vw, 72px) clamp(32px, 6vw, 64px)',
        textAlign: 'center', marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px',
          color: 'var(--en-green)', marginBottom: '20px',
          textTransform: 'uppercase', fontWeight: 700,
        }}>
          ESTUDIO NORTE
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900,
          letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px',
        }}>
          Certificado de Finalización
        </h1>
        <div style={{
          width: '60px', height: '2px',
          background: 'var(--en-coral)', margin: '0 auto 28px',
        }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
          Se certifica que
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900,
          letterSpacing: '-1.5px', color: 'var(--en-text)',
          marginBottom: '16px', lineHeight: 1.1,
        }}>
          {displayName}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '12px' }}>
          completó satisfactoriamente el curso
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 700,
          letterSpacing: '-0.5px', color: 'var(--en-coral)', marginBottom: '32px',
        }}>
          {courseTitle}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '40px' }}>
          {issuedDate}
        </p>
        <div style={{ display: 'inline-block' }}>
          <div style={{ width: '140px', height: '1px', background: 'var(--en-border-mid)', margin: '0 auto 8px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>Juan Gallino</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-faint)' }}>Director - Estudio Norte</p>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '12px', cursor: 'pointer',
            background: 'var(--en-green)', color: 'var(--en-white)',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
            border: 'none', opacity: downloading ? 0.7 : 1,
            boxShadow: 'var(--en-shadow-green-sm)',
          }}
        >
          {downloading ? 'Generando PDF...' : '↓ Descargar PDF'}
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '12px', textDecoration: 'none',
            background: '#0A66C2', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
          }}
        >
          Agregar a LinkedIn
        </a>
        <button
          onClick={copyLink}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '12px', cursor: 'pointer',
            background: 'var(--en-surface)', border: '1.5px solid var(--en-border-mid)',
            color: 'var(--en-text)', fontFamily: 'var(--font-body)',
            fontSize: '14px', fontWeight: 500,
          }}
        >
          {copied ? '✓ ¡Copiado!' : '🔗 Copiar link verificable'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/certificados/[slug]/CertificadoClient.tsx
git commit -m "feat: rediseño certificado DS V2 con botones PDF, LinkedIn y link verificable"
```

---

### Task 4: Ruta pública `/verificar/[code]`

**Files:**
- Create: `app/verificar/[code]/page.tsx`

**Interfaces:**
- Consumes: tabla `certificates` (Task 1) vía `createClient` (anon read — la policy permite SELECT público)

- [ ] **Step 1: Crear `app/verificar/[code]/page.tsx`**

```typescript
// app/verificar/[code]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Verificar Certificado — Estudio Norte' }
}

export default async function VerificarPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('issued_at, verification_code, user_id, courses(title)')
    .eq('verification_code', code)
    .single()

  if (!cert) notFound()

  const courseTitle = Array.isArray((cert as any).courses)
    ? ((cert as any).courses[0]?.title ?? '')
    : ((cert as any).courses as { title: string } | null)?.title ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', cert.user_id)
    .single()

  const displayName = profile?.full_name || 'Alumno'

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--en-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'var(--font-body)',
    }}>
      {/* Badge de autenticidad */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'var(--en-green-light)', border: '1px solid var(--en-green)',
        borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
      }}>
        <span style={{ color: 'var(--en-green)', fontSize: '13px', fontWeight: 600 }}>
          ✓ Certificado auténtico
        </span>
      </div>

      {/* Certificado */}
      <div style={{
        width: '100%', maxWidth: '680px',
        background: 'var(--en-surface)', borderRadius: '20px',
        border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow)',
        borderTop: '3px solid var(--en-coral)',
        padding: 'clamp(40px, 6vw, 64px)',
        textAlign: 'center', marginBottom: '32px',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '3px', color: 'var(--en-green)',
          marginBottom: '20px', textTransform: 'uppercase', fontWeight: 700,
        }}>
          ESTUDIO NORTE
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 900,
          letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px',
        }}>
          Certificado de Finalización
        </h1>
        <div style={{
          width: '60px', height: '2px',
          background: 'var(--en-coral)', margin: '0 auto 28px',
        }} />
        <p style={{ fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
          Se certifica que
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900,
          letterSpacing: '-1.5px', color: 'var(--en-text)',
          marginBottom: '16px', lineHeight: 1.1,
        }}>
          {displayName}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '12px' }}>
          completó satisfactoriamente el curso
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(15px, 3vw, 20px)', fontWeight: 700,
          color: 'var(--en-coral)', marginBottom: '32px',
        }}>
          {courseTitle}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '40px' }}>
          {issuedDate}
        </p>
        <div style={{ display: 'inline-block' }}>
          <div style={{
            width: '140px', height: '1px',
            background: 'var(--en-border-mid)', margin: '0 auto 8px',
          }} />
          <p style={{ fontSize: '12px', color: 'var(--en-text-soft)' }}>Juan Gallino</p>
          <p style={{ fontSize: '10px', color: 'var(--en-text-faint)' }}>Director - Estudio Norte</p>
        </div>
      </div>

      {/* Footer */}
      <Link
        href="/"
        style={{
          fontSize: '14px', color: 'var(--en-green)',
          fontWeight: 600, textDecoration: 'none',
        }}
      >
        Conocé Estudio Norte →
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Step 3: Test manual — ruta 404**

Navegar a `http://localhost:3000/verificar/codigo-inexistente`.
Esperado: página 404 de Next.js.

- [ ] **Step 4: Commit**

```bash
git add app/verificar/[code]/page.tsx
git commit -m "feat: ruta pública /verificar/[code] para verificación de certificados"
```

---

### Task 5: Deploy

**Files:** ninguno nuevo

- [ ] **Step 1: Build local**

```bash
npx next build
```
Esperado: sin errores de build.

- [ ] **Step 2: Deploy a Vercel**

```bash
npx vercel --prod --scope tatitosrafaela
```

- [ ] **Step 3: Verificar en producción**

1. Ir a un curso completo en prod → `/certificados/[slug]` → confirmar que el certificado se muestra con fecha real, los 3 botones visibles.
2. Click "Copiar link verificable" → abrir la URL copiada → confirmar que `/verificar/[code]` muestra el certificado sin login.
3. Click "Descargar PDF" → verificar que el PDF descargado tiene colores claros (fondo crema, verde, coral) y la URL de verificación al pie.

- [ ] **Step 4: Commit de cierre**

```bash
git commit --allow-empty -m "deploy: certificados verificables v1 a producción"
```
