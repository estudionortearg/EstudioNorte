# Suscripciones, Pagos y Seguridad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar suscripciones mensuales via Mercado Pago Preapproval, gating de contenido por plan, y hardening de seguridad en todo el entorno (webhook HMAC, admin auth, doble gate en player y progress API).

**Architecture:** `profiles.plan` (denormalizado) es la fuente de verdad para gating — el middleware solo verifica auth, el Server Component del player es el gate definitivo de contenido. El webhook MP verifica firma HMAC antes de procesar, y maneja eventos `preapproval` (activa/desactiva plan) además de los `payment` existentes.

**Tech Stack:** Next.js 15 App Router, Supabase (server client + admin client), Mercado Pago REST API (Preapproval — NO SDK, llamadas fetch directo), Node.js `crypto` (HMAC-SHA256), Tailwind/inline styles DS V2.

## Global Constraints

- Cero colores hardcodeados en componentes React — solo `var(--en-*)` de `globals.css`. Excepciones: hex en jsPDF (ya existente), colores de terceros en botones de marca.
- `import { createClient } from '@/lib/supabase/server'` para lecturas autenticadas (async).
- `import { createAdminClient } from '@/lib/supabase/admin'` para escrituras desde webhook (bypasea RLS).
- Env var para MP: `process.env.MERCADOPAGO_ACCESS_TOKEN` (ya existe — NO crear `MP_ACCESS_TOKEN`).
- Env var nueva para HMAC: `process.env.MP_WEBHOOK_SECRET`.
- Env var base URL: `process.env.NEXT_PUBLIC_SITE_URL` (ya existe en checkout).
- `profiles.plan` es la única fuente de verdad para gating — nunca leer de `subscriptions` en el gate.
- El middleware NO verifica plan ni lección — solo auth y rol admin.
- La página `/gracias` NO debe mostrar plan como activo — el webhook es async.
- Todos los Server Components nuevos/modificados usan `await params` (Next.js 15 pattern — ya establecido en el repo).

---

### Task 1: DB Migration — subscriptions + profiles.plan

**Files:**
- Create: `supabase/migrations/005_subscriptions.sql`

**Interfaces:**
- Produces: columna `profiles.plan TEXT DEFAULT 'free'`, tabla `subscriptions`, columna condicional `profiles.is_admin BOOLEAN DEFAULT false`. Todas las tasks siguientes dependen de esta migración ejecutada en Supabase.

- [ ] **Step 1: Crear el archivo de migración**

Crear `supabase/migrations/005_subscriptions.sql` con este contenido exacto:

```sql
-- supabase/migrations/005_subscriptions.sql

-- Agregar columna plan a profiles (fuente de verdad para gating)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'norte', 'norte_pro'));

-- Agregar is_admin si no existe (puede haber sido creada manualmente)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Tabla subscriptions: lifecycle de suscripciones MP
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('norte', 'norte_pro')),
  mp_preapproval_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede leer su suscripción
CREATE POLICY IF NOT EXISTS "subscriptions_owner_read"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service role escribe (admin client bypasea RLS)
-- No INSERT/UPDATE policy para authenticated users
```

- [ ] **Step 2: Ejecutar en Supabase**

Ir a Supabase Dashboard → SQL Editor → pegar el contenido del archivo → Run.

Verificar en Table Editor que:
- `profiles` tiene columnas `plan` (text, default 'free') e `is_admin` (bool, default false)
- Tabla `subscriptions` existe con las 8 columnas

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_subscriptions.sql
git commit -m "feat: migration subscriptions + profiles.plan"
```

---

### Task 2: Middleware — re-enable admin auth

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `profiles.is_admin` (de Task 1 — ya disponible en Supabase)
- Produces: rutas `/admin/*` protegidas por `is_admin`; `/aprender/*` solo por auth (sin cambio de comportamiento para usuarios autenticados)

El middleware actual tiene `// Admin auth temporarily disabled for preview` y NO incluye `/admin` en las rutas privadas. Hay que añadir la check.

- [ ] **Step 1: Leer el middleware actual**

Leer `middleware.ts`. El archivo actualmente tiene:
```typescript
const privateRoutes = ['/dashboard', '/aprender', '/perfil', '/certificados']
// Admin auth temporarily disabled for preview
```

Y el `config.matcher` incluye `/admin/:path*` pero el código no lo procesa.

- [ ] **Step 2: Agregar admin check**

Reemplazar todo el contenido de `middleware.ts` con:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect private routes — auth only
  const privateRoutes = ['/dashboard', '/aprender', '/perfil', '/certificados']
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route))

  if (isPrivateRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin routes — auth + is_admin check
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/aprender/:path*',
    '/perfil/:path*',
    '/certificados/:path*',
    '/admin/:path*',
  ],
}
```

- [ ] **Step 3: Verificar manualmente**

Abrir en browser `/admin/gamificacion` sin sesión de admin → debe redirigir a `/login`.
Abrir `/aprender/cualquier-curso/cualquier-leccion` sin sesión → debe redirigir a `/login`.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: re-enable admin auth in middleware"
```

---

### Task 3: Player Server Component — plan gate

**Files:**
- Modify: `app/aprender/[slug]/[lessonId]/page.tsx`

**Interfaces:**
- Consumes: `profiles.plan` (Task 1), `lessons.is_free_preview` (ya en la query existente del módulo)
- Produces: usuarios free sin acceso son redirigidos a `/precios?ref=paywall&course=[slug]`

El archivo actual verifica enrollment pero NO verifica plan. La lección ya tiene `is_free_preview` en la query de módulos (línea 37: `lessons (id, title, duration_minutes, order_index, is_free_preview)`), pero la lección actual se consulta sin `is_free_preview` (línea 44). Hay que agregar `is_free_preview` a esa query y añadir el gate.

- [ ] **Step 1: Agregar `is_free_preview` a la query de lección actual**

En `app/aprender/[slug]/[lessonId]/page.tsx`, localizar la query de `lesson` actual (línea ~44):

```typescript
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, title, description, video_url, pdf_url, duration_minutes, order_index, module_id')
  .eq('id', lessonId)
  .single()
```

Cambiar a:

```typescript
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, title, description, video_url, pdf_url, duration_minutes, order_index, module_id, is_free_preview')
  .eq('id', lessonId)
  .single()
```

- [ ] **Step 2: Agregar plan check justo después del check de enrollment**

El archivo tiene este bloque (~línea 33):
```typescript
if (!enrollment) redirect(`/cursos/${slug}`)
```

Inmediatamente después de esa línea, agregar:

```typescript
  // Plan gate — fetch profile plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()
```

Y luego, DESPUÉS del bloque `if (!lesson) notFound()` (~línea 49), agregar:

```typescript
  // Gate: free plan + non-preview lesson → redirect to pricing
  if ((profile?.plan ?? 'free') === 'free' && !lesson.is_free_preview) {
    redirect(`/precios?ref=paywall&course=${slug}`)
  }
```

- [ ] **Step 3: Actualizar el tipo pasado a PlayerClient**

La variable `lesson` ahora tiene `is_free_preview`. Actualizar el cast en el `return` (~línea 81):

```typescript
lesson={lesson as { id: string; title: string; description: string | null; video_url: string | null; pdf_url: string | null; duration_minutes: number | null; order_index: number; module_id: string; is_free_preview: boolean }}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add app/aprender/[slug]/[lessonId]/page.tsx
git commit -m "feat: player gate — plan + is_free_preview check"
```

---

### Task 4: Progress API — plan guard

**Files:**
- Modify: `app/api/progress/route.ts`

**Interfaces:**
- Consumes: `profiles.plan` (Task 1), `lessons.is_free_preview` (ya disponible en DB)
- Produces: retorna 403 si usuario free intenta marcar progreso en lección no-preview

El archivo actual tiene auth check pero NO plan check. Hay que agregar la verificación antes del upsert de progreso.

- [ ] **Step 1: Agregar is_free_preview a la query de lección**

En `app/api/progress/route.ts`, localizar la query de lesson (~línea 133):

```typescript
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, xp_value, module_id, modules!inner(course_id)')
  .eq('id', lesson_id)
  .single()
```

Cambiar a:

```typescript
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, xp_value, module_id, is_free_preview, modules!inner(course_id)')
  .eq('id', lesson_id)
  .single()
```

- [ ] **Step 2: Agregar plan check + 403 guard**

Justo DESPUÉS de `if (!lesson) return NextResponse.json(...)` (~línea 140), y ANTES del upsert de progreso, agregar:

```typescript
  // Plan guard — free users cannot record progress on non-preview lessons
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if ((profile?.plan ?? 'free') === 'free' && !lesson.is_free_preview) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
```

- [ ] **Step 3: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add app/api/progress/route.ts
git commit -m "feat: progress API — plan guard before upsert"
```

---

### Task 5: Checkout Subscription API

**Files:**
- Create: `app/api/checkout/subscription/route.ts`

**Interfaces:**
- Consumes: nada de tasks anteriores (usa `MERCADOPAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_SITE_URL` ya existentes)
- Produces: endpoint `POST /api/checkout/subscription` que devuelve `{ init_point: string }`

- [ ] **Step 1: Crear el route**

Crear `app/api/checkout/subscription/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLAN_CONFIG = {
  norte: {
    reason: 'Estudio Norte — Plan Norte',
    transaction_amount: 7000,
  },
  norte_pro: {
    reason: 'Estudio Norte — Plan Norte Pro',
    transaction_amount: 15000,
  },
} as const

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body.plan as keyof typeof PLAN_CONFIG | undefined

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Invalid plan. Must be norte or norte_pro' }, { status: 400 })
    }

    const config = PLAN_CONFIG[plan]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: config.reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: config.transaction_amount,
          currency_id: 'ARS',
        },
        back_url: `${siteUrl}/gracias?plan=${plan}`,
        payer_email: user.email,
        external_reference: `${user.id}|${plan}`,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('MP preapproval error:', errorData)
      return NextResponse.json({ error: 'MP checkout failed' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ init_point: data.init_point })
  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Smoke test local (opcional si hay MP_ACCESS_TOKEN en .env.local)**

```bash
curl -X POST http://localhost:3000/api/checkout/subscription \
  -H "Content-Type: application/json" \
  -d '{"plan":"norte"}'
```

Esperado con sesión activa: `{ "init_point": "https://www.mercadopago.com.ar/subscriptions/..." }`
Sin sesión: `{ "error": "Unauthorized" }`

- [ ] **Step 4: Commit**

```bash
git add app/api/checkout/subscription/route.ts
git commit -m "feat: checkout subscription API — MP Preapproval"
```

---

### Task 6: Webhook — HMAC verification + preapproval handler

**Files:**
- Modify: `app/api/webhooks/mercadopago/route.ts`

**Interfaces:**
- Consumes: `subscriptions` table y `profiles.plan` (Task 1), `createAdminClient` de `@/lib/supabase/admin`
- Produces: webhook HMAC-verificado, maneja eventos `preapproval` (authorized → activa plan; paused/cancelled → degrada a free)

El archivo actual: usa `createClient` de `@supabase/supabase-js` en línea (no el helper de admin), NO verifica HMAC, solo maneja `payment`. Hay que reescribirlo.

**IMPORTANTE:** El env var del webhook secret es `MP_WEBHOOK_SECRET` — hay que agregarlo en Vercel también. El `MERCADOPAGO_ACCESS_TOKEN` ya existe.

- [ ] **Step 1: Reescribir el webhook**

Reemplazar todo el contenido de `app/api/webhooks/mercadopago/route.ts`:

```typescript
import { createHmac } from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email/resend'

function verifyMpSignature(request: NextRequest, dataId: string): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  // If secret not configured, skip verification (dev mode)
  if (!webhookSecret) {
    console.warn('MP_WEBHOOK_SECRET not set — skipping signature verification')
    return true
  }

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  const ts = xSignature.match(/ts=([^,]+)/)?.[1] ?? ''
  const v1 = xSignature.match(/v1=([^,]+)/)?.[1] ?? ''

  if (!ts || !v1) return false

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = createHmac('sha256', webhookSecret).update(template).digest('hex')

  return hmac === v1
}

async function handlePaymentEvent(paymentId: string): Promise<void> {
  const admin = createAdminClient()
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })

  const paymentClient = new Payment(client)
  const payment = await paymentClient.get({ id: paymentId })

  if (payment.status !== 'approved') return

  const payerEmail = payment.payer?.email
  const courseSlug = payment.external_reference

  if (!payerEmail || !courseSlug) {
    console.error('MP webhook payment: missing payer email or course slug')
    return
  }

  // Find user by email
  const { data: userData } = await admin.auth.admin.listUsers()
  const user = userData?.users?.find(u => u.email === payerEmail)
  if (!user) {
    console.error('MP webhook payment: user not found for email', payerEmail)
    return
  }

  // Find course by slug
  const { data: course } = await admin
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()
  if (!course) {
    console.error('MP webhook payment: course not found for slug', courseSlug)
    return
  }

  // Idempotency check
  const { data: existingPayment } = await admin
    .from('payments')
    .select('id')
    .eq('provider_payment_id', String(paymentId))
    .single()
  if (existingPayment) return

  await admin.from('payments').insert({
    user_id: user.id,
    course_id: course.id,
    provider: 'mercadopago',
    provider_payment_id: String(paymentId),
    amount: payment.transaction_amount,
    currency: 'ARS',
    status: 'approved',
  })

  await admin.from('enrollments').upsert({
    user_id: user.id,
    course_id: course.id,
    expires_at: null,
  })

  try {
    await sendWelcomeEmail({
      to: payerEmail,
      studentName: payerEmail.split('@')[0],
      courseTitle: courseSlug,
      courseSlug,
    })
  } catch (emailError) {
    console.error('Welcome email error (non-fatal):', emailError)
  }
}

async function handlePreapprovalEvent(preapprovalId: string): Promise<void> {
  const admin = createAdminClient()

  const res = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  )

  if (!res.ok) {
    console.error('MP webhook preapproval: fetch failed', preapprovalId)
    return
  }

  const preapproval = await res.json()
  const externalRef = preapproval.external_reference as string | undefined

  if (!externalRef || !externalRef.includes('|')) {
    console.error('MP webhook preapproval: invalid external_reference', externalRef)
    return
  }

  const [userId, plan] = externalRef.split('|')

  if (preapproval.status === 'authorized') {
    await admin.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        mp_preapproval_id: preapproval.id,
        status: 'active',
        current_period_end: preapproval.next_payment_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'mp_preapproval_id' }
    )
    await admin.from('profiles').update({ plan }).eq('id', userId)

  } else if (preapproval.status === 'paused' || preapproval.status === 'cancelled') {
    await admin
      .from('subscriptions')
      .update({ status: preapproval.status, updated_at: new Date().toISOString() })
      .eq('mp_preapproval_id', preapproval.id)
    await admin.from('profiles').update({ plan: 'free' }).eq('id', userId)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topic: string = body.type ?? body.topic ?? ''
    const dataId: string = String(body.data?.id ?? body.id ?? '')

    if (!dataId) return NextResponse.json({ ok: true })

    // Verify HMAC signature
    if (!verifyMpSignature(request, dataId)) {
      console.error('MP webhook: invalid signature for id', dataId)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (topic === 'payment') {
      await handlePaymentEvent(dataId)
    } else if (topic === 'preapproval') {
      await handlePreapprovalEvent(dataId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/mercadopago/route.ts
git commit -m "feat: webhook HMAC verification + preapproval plan lifecycle"
```

---

### Task 7: Precios — CTAs reales con checkout de suscripción

**Files:**
- Create: `app/precios/PreciosCTA.tsx`
- Modify: `app/precios/page.tsx`

**Interfaces:**
- Consumes: `/api/checkout/subscription` (Task 5)
- Produces: botones de plan que llaman al API y redirigen a MP; plan actual del usuario resaltado

El archivo `app/precios/page.tsx` es un Server Component con CTAs estáticas como `<Link href="/login?plan=norte">`. Hay que:
1. Convertir la page en Server Component que lee el plan actual del usuario (si está logueado)
2. Crear `PreciosCTA.tsx` ('use client') que maneja el fetch + redirect

- [ ] **Step 1: Crear `app/precios/PreciosCTA.tsx`**

```typescript
'use client'

import { useState } from 'react'

interface Props {
  planSlug: 'norte' | 'norte_pro'
  ctaText: string
  ctaStyle: 'solid' | 'coral'
  currentUserPlan: string | null // null = not logged in
  thisPlan: string
}

export default function PreciosCTA({ planSlug, ctaText, ctaStyle, currentUserPlan, thisPlan }: Props) {
  const [loading, setLoading] = useState(false)

  const isCurrentPlan = currentUserPlan === thisPlan
  const isHigherPlan =
    (currentUserPlan === 'norte_pro' && thisPlan === 'norte')

  const disabled = isCurrentPlan || isHigherPlan || loading

  const label = isCurrentPlan
    ? 'Tu plan actual'
    : isHigherPlan
    ? 'Ya tenés un plan superior'
    : loading
    ? 'Redirigiendo...'
    : ctaText

  async function handleClick() {
    if (disabled) return

    // Not logged in — redirect to login with plan param
    if (currentUserPlan === null) {
      window.location.href = `/login?plan=${planSlug}`
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planSlug }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('No init_point received', data)
        setLoading(false)
      }
    } catch (err) {
      console.error('Subscription checkout error', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: '14px',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...(ctaStyle === 'solid' && {
          background: 'var(--en-white)',
          color: 'var(--en-green)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }),
        ...(ctaStyle === 'coral' && {
          background: 'var(--en-coral)',
          color: 'var(--en-white)',
          boxShadow: 'var(--en-shadow-coral)',
        }),
      }}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 2: Modificar `app/precios/page.tsx` para leer el plan del usuario**

Agregar al inicio del archivo (antes de `export default function PreciosPage`):

```typescript
import { createClient } from '@/lib/supabase/server'
import PreciosCTA from './PreciosCTA'
```

Convertir `PreciosPage` a async y agregar lectura de plan:

```typescript
export default async function PreciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUserPlan: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    currentUserPlan = profile?.plan ?? 'free'
  }

  // ... resto del componente
```

- [ ] **Step 3: Reemplazar los CTAs estáticos de planes de pago**

En el `.map(plan => ...)` del archivo, localizar el `<Link href={plan.ctaHref}>` al final de cada card (~línea 166).

Para el plan FREE (index 0, `plan.name === 'FREE'`), mantener el Link estático.

Para NORTE y NORTE PRO, reemplazar el `<Link>` con `<PreciosCTA>`:

```typescript
{plan.name === 'FREE' ? (
  <a
    href="/login"
    style={{
      display: 'block', textAlign: 'center',
      padding: '14px 24px', borderRadius: '12px', textDecoration: 'none',
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px',
      background: 'transparent', color: 'var(--en-text)',
      border: '1.5px solid var(--en-border)',
    }}
  >
    {plan.cta}
  </a>
) : (
  <PreciosCTA
    planSlug={plan.name === 'NORTE' ? 'norte' : 'norte_pro'}
    ctaText={plan.cta}
    ctaStyle={plan.ctaStyle as 'solid' | 'coral'}
    currentUserPlan={currentUserPlan}
    thisPlan={plan.name === 'NORTE' ? 'norte' : 'norte_pro'}
  />
)}
```

También eliminar los campos `ctaHref` del array PLANS (ya no se usan para los planes pagos).

- [ ] **Step 4: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add app/precios/page.tsx app/precios/PreciosCTA.tsx
git commit -m "feat: precios — CTAs reales con checkout de suscripción"
```

---

### Task 8: Gracias page — estado de suscripción

**Files:**
- Modify: `app/gracias/page.tsx`

**Interfaces:**
- Consumes: query param `?plan=norte|norte_pro` (nuevo, viene de `back_url` del preapproval)
- Produces: mensaje "Tu suscripción está siendo procesada" cuando `plan` presente, comportamiento anterior para compra de cursos (`?curso=`)

El archivo actual maneja `?curso=` y `?pending=`. Hay que agregar manejo de `?plan=`. También usa CSS variables del DS V1 (`var(--color-bg-deep)`, `var(--color-text)`, etc.) — actualizar a DS V2.

- [ ] **Step 1: Actualizar `app/gracias/page.tsx`**

Reemplazar todo el contenido:

```typescript
import Link from 'next/link'

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string; plan?: string; pending?: string }>
}) {
  const { curso, plan, pending } = await searchParams
  const isPending = pending === 'true'
  const isSubscription = !!plan

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--en-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'var(--en-green)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--en-white)', fontFamily: 'var(--font-display)',
          fontWeight: 900, fontSize: '18px', marginBottom: '32px',
        }}>
          EN
        </div>

        {isSubscription ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⏳</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 36px)', letterSpacing: '-1.5px',
              color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Tu suscripción está siendo procesada
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '8px',
            }}>
              Mercado Pago está confirmando tu pago. Esto puede tomar unos minutos.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '14px',
              color: 'var(--en-text-faint)', lineHeight: 1.6, marginBottom: '32px',
            }}>
              Te avisaremos por email cuando tu plan esté activo.
            </p>
          </>
        ) : isPending ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⏳</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 36px)', letterSpacing: '-1.5px',
              color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Pago en proceso
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '32px',
            }}>
              Tu pago está siendo procesado. Te avisaremos por email cuando esté confirmado.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌟</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-1.5px',
              fontStyle: 'italic', color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Ya sos parte de Estudio Norte
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '32px',
            }}>
              Tu acceso está activado. Revisá tu email — te mandamos los detalles.
            </p>
            {curso && (
              <a
                href={`/aprender/${curso}`}
                style={{
                  display: 'inline-block',
                  padding: '14px 32px', borderRadius: '12px',
                  background: 'var(--en-green)', color: 'var(--en-white)',
                  fontFamily: 'var(--font-body)', fontWeight: 700,
                  fontSize: '14px', textDecoration: 'none',
                  boxShadow: 'var(--en-shadow-green)',
                }}
              >
                Empezar ahora
              </a>
            )}
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link href="/dashboard" style={{
            fontFamily: 'var(--font-body)', color: 'var(--en-green)',
            fontSize: '14px', textDecoration: 'none', fontWeight: 600,
          }}>
            Ir a mi dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add app/gracias/page.tsx
git commit -m "feat: gracias page — subscription state + DS V2 vars"
```

---

### Task 9: Dashboard — badge de plan

**Files:**
- Modify: `app/dashboard/page.tsx` (o el componente que muestre el nombre de usuario)

**Interfaces:**
- Consumes: `profiles.plan` (Task 1)
- Produces: badge visual mostrando el plan del usuario junto a su nombre

- [ ] **Step 1: Leer el dashboard**

Leer `app/dashboard/page.tsx` completo para entender dónde se muestra el nombre/avatar del usuario.

- [ ] **Step 2: Agregar plan a la query de profile**

Localizar la query de `profiles` en el dashboard. Si ya hace `.select('full_name, avatar_url')`, agregar `plan`:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('full_name, avatar_url, plan')
  .eq('id', user.id)
  .single()
```

- [ ] **Step 3: Agregar badge de plan**

Junto al nombre del usuario (o debajo del saludo), agregar:

```typescript
{profile?.plan && profile.plan !== 'free' && (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '100px',
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    background: profile.plan === 'norte_pro'
      ? 'color-mix(in srgb, var(--en-coral) 15%, transparent)'
      : 'color-mix(in srgb, var(--en-green) 15%, transparent)',
    color: profile.plan === 'norte_pro' ? 'var(--en-coral)' : 'var(--en-green)',
    border: `1px solid ${profile.plan === 'norte_pro' ? 'color-mix(in srgb, var(--en-coral) 30%, transparent)' : 'color-mix(in srgb, var(--en-green) 30%, transparent)'}`,
  }}>
    {profile.plan === 'norte_pro' ? 'Norte Pro' : 'Norte'}
  </span>
)}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: dashboard — plan badge"
```

---

### Task 10: Deploy

**Files:**
- No code changes — solo configuración Vercel y deploy

**Interfaces:**
- Consumes: todos los commits de Tasks 1-9
- Produces: app deployada en `https://estudio-norte-web-lac.vercel.app`

**Prerequisito:** antes de deployar, agregar `MP_WEBHOOK_SECRET` como env var en Vercel.

- [ ] **Step 1: Agregar `MP_WEBHOOK_SECRET` en Vercel**

Ir a Vercel Dashboard → proyecto `estudio-norte-web-lac` → Settings → Environment Variables.

Agregar:
- Name: `MP_WEBHOOK_SECRET`
- Value: el secret del webhook configurado en el panel de Mercado Pago (Sección Notificaciones → tu URL del webhook)
- Environment: Production + Preview

Si aún no configuraste el webhook en MP: ir a MP → Configuración del desarrollador → Webhooks → agregar URL `https://estudio-norte-web-lac.vercel.app/api/webhooks/mercadopago` con tópicos `payment` y `preapproval`. El secret lo muestra MP al crear/editar el webhook.

- [ ] **Step 2: Deploy a producción**

```bash
cd "D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web"
npx vercel --prod --scope tatitosrafaela
```

- [ ] **Step 3: Verificar en producción**

1. Abrir `https://estudio-norte-web-lac.vercel.app/precios` — los botones de plan deben ser clickeables (no Links estáticos)
2. Abrir `/aprender/[cualquier-slug]/[leccion-no-preview]` sin suscripción activa → debe redirigir a `/precios?ref=paywall&...`
3. Abrir `/admin/gamificacion` sin sesión admin → debe redirigir a `/login`
4. Abrir `/gracias?plan=norte` → debe mostrar "Tu suscripción está siendo procesada"

- [ ] **Step 4: Commit final si hay cambios**

```bash
git status
# Si hay cambios pendientes:
git add -A
git commit -m "chore: post-deploy fixes"
```
