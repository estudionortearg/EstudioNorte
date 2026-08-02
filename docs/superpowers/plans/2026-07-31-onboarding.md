# Onboarding Wizard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wizard de 3 pasos que aparece después del registro (y captura usuarios existentes sin completar) con bienvenida, selección de intereses y presentación de planes.

**Architecture:** Columna `onboarding_completed` en `profiles` como flag; middleware intercepta `/dashboard` y redirige a `/onboarding` si el flag es false; wizard es un Client Component con estado local de paso; al finalizar llama a `POST /api/onboarding/complete` que guarda intereses y marca completado, luego navega a `/cursos` o `/precios` según el CTA elegido.

**Tech Stack:** Next.js 15 App Router, Supabase, React useState, DS V2 (páginas de usuario)

## Global Constraints

- DS V2 en todas las páginas de usuario: usar SOLO `var(--en-*)` variables — `var(--en-text)`, `var(--en-text-soft)`, `var(--en-green)`, `var(--en-coral)`, `var(--en-bg)`, `var(--en-white)`, `var(--en-border)`, `var(--font-body)`, `var(--font-display)`. NO usar `var(--color-*)` ni `rgba(247,247,242,...)` (esos son DS V1, solo para el admin).
- Next.js 15: `params` en Server Components es `Promise<{...}>` — siempre `await params`. (No aplica aquí directamente pero respetar el patrón.)
- `createClient` de `@/lib/supabase/server` para Server Components y API routes; `createClient` de `@/lib/supabase/client` para Client Components.
- La API route `/api/onboarding/complete` usa `createClient()` (server) + `auth.getUser()` para auth — NO `createAdminClient()`.
- El middleware solo agrega una query DB en `/dashboard` — no en todas las rutas privadas (performance).
- `/onboarding` es una página sin layout de sidebar/nav (standalone, fullscreen).
- Intereses disponibles (exactos, usar estos valores en el código): `['Análisis Técnico', 'Macroeconomía', 'Cripto', 'Acciones y Bolsa', 'Opciones y Derivados', 'Economía Argentina']`
- El wizard tiene exactamente 3 pasos: Bienvenida (paso 1), Intereses (paso 2), Tu plan (paso 3).
- Al completar desde paso 3: CTA "Ver cursos" → llama API → redirige `/cursos`; CTA "Elegir un plan" → llama API → redirige `/precios`.
- El middleware debe agregar `/onboarding` al matcher y excluir `/onboarding` del redirect-to-onboarding (para evitar loop).

---

## File Map

**Crear:**
- `supabase/migrations/007_onboarding.sql` — add `onboarding_completed` + `interests` columns
- `app/api/onboarding/complete/route.ts` — POST: guarda intereses + marca onboarding_completed = true
- `app/onboarding/page.tsx` — Server Component: carga nombre/plan del usuario, pasa a cliente
- `app/onboarding/OnboardingWizard.tsx` — Client Component: wizard de 3 pasos

**Modificar:**
- `middleware.ts` — agregar redirect a /onboarding cuando user en /dashboard sin completar

---

### Task 1: DB Migration — onboarding_completed + interests

**Files:**
- Create: `supabase/migrations/007_onboarding.sql`

**Interfaces:**
- Produces: `profiles.onboarding_completed BOOLEAN DEFAULT FALSE`, `profiles.interests TEXT[] DEFAULT '{}'`

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/007_onboarding.sql

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] NOT NULL DEFAULT '{}';
```

- [ ] **Step 2: Aplicar en Supabase**

Ir a Supabase Dashboard → SQL Editor → pegar y ejecutar.

- [ ] **Step 3: Verificar**

En Table Editor → profiles → confirmar que existen las columnas `onboarding_completed` (boolean, default false) e `interests` (text[], default {}).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/007_onboarding.sql
git commit -m "feat: add onboarding_completed and interests to profiles"
```

---

### Task 2: Middleware — redirect a /onboarding

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `profiles.onboarding_completed` (Task 1)
- Produces: usuarios en `/dashboard` sin onboarding completado son redirigidos a `/onboarding`

El middleware actual (leer el archivo antes de editar):
- Protege rutas privadas: `/dashboard`, `/aprender`, `/perfil`, `/certificados`
- Protege `/admin` con check is_admin
- Matcher cubre esas rutas

Cambios a hacer:
1. Agregar `/onboarding/:path*` al matcher
2. Agregar bloque: si `pathname === '/dashboard'` y usuario existe → query `profiles.onboarding_completed` → si false, redirigir a `/onboarding`
3. Agregar protección de `/onboarding`: si no hay usuario → redirect a `/login`

- [ ] **Step 1: Leer el archivo actual**

Leer `middleware.ts` completo para ver la estructura exacta.

- [ ] **Step 2: Agregar lógica de onboarding**

Insertar después del bloque `isPrivateRoute && !user` y ANTES del bloque admin, el siguiente bloque:

```typescript
// Onboarding redirect — only on /dashboard to avoid per-request DB hit
if (pathname === '/dashboard' && user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile?.onboarding_completed) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
}

// Protect /onboarding — must be logged in
if (pathname.startsWith('/onboarding') && !user) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('next', '/onboarding')
  return NextResponse.redirect(redirectUrl)
}
```

- [ ] **Step 3: Agregar /onboarding al matcher**

Cambiar el config.matcher para agregar:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/aprender/:path*',
    '/perfil/:path*',
    '/certificados/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
  ],
}
```

**Nota:** `/onboarding` (sin trailing path) no lo captura `/:path*`. Para capturar `/onboarding` exacto y sus subpaths, agregar también `'/onboarding'` al array O usar un middleware matcher más amplio. La solución más simple: agregar `'/onboarding'` y `'/onboarding/:path*'` ambos.

El matcher final debe ser:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/aprender/:path*',
    '/perfil/:path*',
    '/certificados/:path*',
    '/admin/:path*',
    '/onboarding',
    '/onboarding/:path*',
  ],
}
```

- [ ] **Step 4: Verificar el archivo resultante**

Leer `middleware.ts` después de los cambios y confirmar que:
- El bloque onboarding está DESPUÉS de `isPrivateRoute && !user` y ANTES del bloque admin
- El matcher incluye `/onboarding` y `/onboarding/:path*`
- No hay loops: `/onboarding` redirige a login si no hay user, pero no se redirige a sí mismo

- [ ] **Step 5: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware redirect to /onboarding for users who haven't completed it"
```

---

### Task 3: API route — POST /api/onboarding/complete

**Files:**
- Create: `app/api/onboarding/complete/route.ts`

**Interfaces:**
- Consumes: auth user, body `{ interests: string[], destination: 'cursos' | 'precios' }`
- Produces: updates `profiles.onboarding_completed = true` + `profiles.interests`, returns `{ ok: true }`

- [ ] **Step 1: Crear la route**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_INTERESTS = [
  'Análisis Técnico', 'Macroeconomía', 'Cripto',
  'Acciones y Bolsa', 'Opciones y Derivados', 'Economía Argentina',
]

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interests } = await req.json()

  // Validate interests — filter to only known values
  const sanitizedInterests = Array.isArray(interests)
    ? interests.filter((i: unknown) => typeof i === 'string' && VALID_INTERESTS.includes(i))
    : []

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, interests: sanitizedInterests })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verificar el archivo creado**

Leer `app/api/onboarding/complete/route.ts` y confirmar que:
- Auth guard está presente (retorna 401 si no hay user)
- Intereses son sanitizados contra la lista allowlist
- `onboarding_completed: true` se actualiza junto con `interests`
- Usa `createClient` de `@/lib/supabase/server` (NO admin client)

- [ ] **Step 3: Commit**

```bash
git add app/api/onboarding/complete/
git commit -m "feat: POST /api/onboarding/complete — save interests and mark onboarding done"
```

---

### Task 4: Wizard /onboarding — UI de 3 pasos

**Files:**
- Create: `app/onboarding/page.tsx`
- Create: `app/onboarding/OnboardingWizard.tsx`

**Interfaces:**
- Consumes: `POST /api/onboarding/complete` (Task 3), `profiles.full_name` y `profiles.plan` del user
- Produces: UI completa del wizard; al terminar redirige a /cursos o /precios

#### `app/onboarding/page.tsx`

- [ ] **Step 1: Crear Server Component**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  // If already completed, skip to dashboard
  if (profile?.onboarding_completed) redirect('/dashboard')

  return (
    <OnboardingWizard
      userName={profile?.full_name || user.email?.split('@')[0] || 'estudiante'}
      userPlan={profile?.plan || 'free'}
    />
  )
}
```

#### `app/onboarding/OnboardingWizard.tsx`

- [ ] **Step 2: Crear Client Component — tipos y estado**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INTERESTS = [
  'Análisis Técnico', 'Macroeconomía', 'Cripto',
  'Acciones y Bolsa', 'Opciones y Derivados', 'Economía Argentina',
]

interface Props {
  userName: string
  userPlan: string
}

export default function OnboardingWizard({ userName, userPlan }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [completing, setCompleting] = useState(false)

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  async function complete(destination: 'cursos' | 'precios') {
    setCompleting(true)
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: selectedInterests, destination }),
    })
    router.push(destination === 'cursos' ? '/cursos' : '/precios')
  }
```

- [ ] **Step 3: Crear estructura de layout y paso 1 (Bienvenida)**

Continuar en el mismo archivo OnboardingWizard.tsx, agregando el return con el layout:

```tsx
  // Shared styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'var(--en-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(24px, 5vw, 64px)',
    fontFamily: 'var(--font-body)',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '520px',
    background: 'var(--en-white)',
    border: '1.5px solid var(--en-border)',
    borderRadius: '24px',
    padding: 'clamp(32px, 5vw, 48px)',
    boxShadow: 'var(--en-shadow-sm)',
  }

  // Progress dots
  const dots = (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '32px' }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === step ? '20px' : '6px', height: '6px', borderRadius: '100px',
          background: n <= step ? 'var(--en-green)' : 'var(--en-border)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )

  // PASO 1 — Bienvenida
  if (step === 1) return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {dots}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--en-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--en-white)', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px' }}>
            EN
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 5vw, 36px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
            Hola, {userName} 👋
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--en-text-soft)', lineHeight: 1.6 }}>
            Bienvenido a Estudio Norte. Acá vas a aprender finanzas de verdad.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {[
            { icon: '📄', title: 'Guías PDF descargables', desc: 'Material didáctico de cada lección para estudiar a tu ritmo' },
            { icon: '🤖', title: 'Tutor IA en cada lección', desc: 'Preguntale lo que quieras sobre el contenido del curso' },
            { icon: '👥', title: 'Comunidad activa', desc: 'Discutí ideas, hacé preguntas y conectá con otros estudiantes' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--en-green) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--en-green) 12%, transparent)' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--en-text)', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(2)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'var(--en-green)', color: 'var(--en-white)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px' }}
        >
          Empezar →
        </button>
      </div>
    </div>
  )
```

- [ ] **Step 4: Agregar paso 2 (Intereses)**

```tsx
  // PASO 2 — Intereses
  if (step === 2) return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {dots}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px' }}>
            ¿Qué querés aprender?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--en-text-soft)' }}>
            Elegí los temas que más te interesan. Podés seleccionar varios.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          {INTERESTS.map(interest => {
            const selected = selectedInterests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: selected ? 700 : 400,
                  background: selected ? 'color-mix(in srgb, var(--en-green) 12%, transparent)' : 'var(--en-white)',
                  border: `1.5px solid ${selected ? 'var(--en-green)' : 'var(--en-border)'}`,
                  color: selected ? 'var(--en-green)' : 'var(--en-text)',
                  transition: 'all 0.15s ease',
                }}
              >
                {interest}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setStep(1)}
            style={{ padding: '14px 20px', borderRadius: '12px', border: '1.5px solid var(--en-border)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text-soft)' }}
          >
            ← Volver
          </button>
          <button
            onClick={() => setStep(3)}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'var(--en-green)', color: 'var(--en-white)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px' }}
          >
            {selectedInterests.length > 0 ? `Continuar (${selectedInterests.length} elegidos)` : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 5: Agregar paso 3 (Tu plan) y cerrar el componente**

```tsx
  // PASO 3 — Tu plan
  const PLANS = [
    {
      name: 'FREE', color: 'var(--en-text-soft)', price: '$0',
      features: ['1 lección por curso', 'Catálogo de cursos', 'Comunidad lectura'],
      current: userPlan === 'free',
    },
    {
      name: 'NORTE', color: 'var(--en-green)', price: 'U$D 7/mes',
      features: ['Todas las guías PDF', 'Tutor IA', 'XP + Badges'],
      current: userPlan === 'norte',
    },
    {
      name: 'NORTE PRO', color: 'var(--en-coral)', price: 'U$D 15/mes',
      features: ['Todo NORTE', 'Certificados', 'Peer review'],
      current: userPlan === 'norte_pro',
    },
  ]

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {dots}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px' }}>
            Tu plan
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--en-text-soft)' }}>
            {userPlan === 'free'
              ? 'Estás en el plan gratuito. Podés actualizar cuando quieras.'
              : `Estás suscripto al plan ${userPlan === 'norte' ? 'Norte' : 'Norte Pro'}. ¡Todo desbloqueado!`}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              padding: '14px 16px', borderRadius: '12px',
              background: plan.current ? 'color-mix(in srgb, var(--en-green) 6%, transparent)' : 'var(--en-white)',
              border: `1.5px solid ${plan.current ? 'var(--en-green)' : 'var(--en-border)'}`,
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', letterSpacing: '1px', color: plan.color }}>{plan.name}</span>
                  {plan.current && <span style={{ fontSize: '10px', background: 'var(--en-green)', color: 'var(--en-white)', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>TU PLAN</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '15px', color: 'var(--en-text)', marginBottom: '4px' }}>{plan.price}</div>
                <div style={{ fontSize: '12px', color: 'var(--en-text-soft)' }}>{plan.features.join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => complete('cursos')}
            disabled={completing}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: completing ? 'wait' : 'pointer', background: 'var(--en-green)', color: 'var(--en-white)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', opacity: completing ? 0.7 : 1 }}
          >
            {completing ? 'Un momento...' : 'Ver cursos →'}
          </button>
          {userPlan === 'free' && (
            <button
              onClick={() => complete('precios')}
              disabled={completing}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: completing ? 'wait' : 'pointer', background: 'transparent', border: '1.5px solid var(--en-border)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text-soft)', opacity: completing ? 0.7 : 1 }}
            >
              Elegir un plan
            </button>
          )}
          <button
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', padding: '4px' }}
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verificar en browser**

1. Crear un usuario nuevo (o usar uno existente con `onboarding_completed = false` en DB).
2. Hacer login → debe redirigir a `/onboarding` en lugar del dashboard.
3. Avanzar los 3 pasos: bienvenida → elegir intereses → plan.
4. Click en "Ver cursos" → debe redirigir a `/cursos` y en DB `onboarding_completed = true`, `interests = [...]`.
5. Hacer login de nuevo → debe ir directo al dashboard (no a onboarding).
6. Verificar que los puntos de progreso se muestran correctamente en cada paso.

- [ ] **Step 7: Commit**

```bash
git add app/onboarding/
git commit -m "feat: onboarding wizard — 3-step welcome, interests, plan"
```
