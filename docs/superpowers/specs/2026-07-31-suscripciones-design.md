# Estudio Norte — Suscripciones, Pagos y Seguridad
**Fecha:** 2026-07-31
**Estado:** Aprobado

---

## Sección 1 — Base de Datos

### Migración `supabase/migrations/005_subscriptions.sql`

```sql
-- Columna plan en profiles
ALTER TABLE profiles
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'norte', 'norte_pro'));

-- Tabla de suscripciones (historial y lifecycle MP)
CREATE TABLE subscriptions (
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
CREATE POLICY "subscriptions_owner_read"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE para usuarios — solo service role (admin client)
```

**`profiles.plan`** es la fuente de verdad para gating — se actualiza desde el webhook.
**`subscriptions`** guarda el lifecycle completo para gestión futura (pausar, cancelar, historial).

---

## Sección 2 — Flujo MP Preapproval

### `app/api/checkout/subscription/route.ts` (nuevo)

POST, requiere auth. Body: `{ plan: 'norte' | 'norte_pro' }`.

```typescript
// Validar sesión
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Crear preapproval en MP
const res = await fetch('https://api.mercadopago.com/preapproval', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reason: plan === 'norte' ? 'Estudio Norte — Plan Norte' : 'Estudio Norte — Plan Norte Pro',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: plan === 'norte' ? 7000 : 15000, // ARS
      currency_id: 'ARS',
    },
    back_url: `${process.env.NEXT_PUBLIC_URL}/gracias?plan=${plan}`,
    payer_email: user.email,
    external_reference: `${user.id}|${plan}`,
  }),
})
const data = await res.json()
return NextResponse.json({ init_point: data.init_point })
```

### `app/gracias/page.tsx` (nuevo)

Página pública post-aprobación MP. Muestra:
- "Tu suscripción está siendo procesada" (NO asumir activación — webhook es async)
- Spinner o badge "Procesando..."
- Link "Ir al dashboard →"
- Nota: "Recibirás un email cuando tu plan esté activo"

### `app/api/webhooks/mercadopago/route.ts` (modificar)

**Agregar verificación de firma HMAC-SHA256 al inicio (para todos los eventos):**

```typescript
const xSignature = req.headers.get('x-signature') // "ts=...,v1=..."
const xRequestId = req.headers.get('x-request-id')
const url = new URL(req.url)
const dataId = url.searchParams.get('data.id') ?? body?.data?.id

// Parsear ts y v1 desde x-signature
const ts = xSignature?.match(/ts=([^,]+)/)?.[1]
const v1 = xSignature?.match(/v1=([^,]+)/)?.[1]

// Template: id:[dataId];request-id:[xRequestId];ts:[ts];
const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
const hmac = createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
  .update(template).digest('hex')

if (hmac !== v1) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
```

**Agregar manejo de evento `preapproval`:**

```typescript
if (topic === 'preapproval') {
  const preapprovalRes = await fetch(
    `https://api.mercadopago.com/preapproval/${id}`,
    { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
  )
  const preapproval = await preapprovalRes.json()
  
  const [userId, plan] = (preapproval.external_reference as string).split('|')
  const admin = createAdminClient()

  if (preapproval.status === 'authorized') {
    // Activar plan
    await admin.from('subscriptions').upsert({
      user_id: userId,
      plan,
      mp_preapproval_id: preapproval.id,
      status: 'active',
      current_period_end: new Date(preapproval.next_payment_date),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'mp_preapproval_id' })

    await admin.from('profiles')
      .update({ plan })
      .eq('id', userId)

  } else if (['paused', 'cancelled'].includes(preapproval.status)) {
    // Degradar a free
    await admin.from('subscriptions')
      .update({ status: preapproval.status, updated_at: new Date().toISOString() })
      .eq('mp_preapproval_id', preapproval.id)

    await admin.from('profiles')
      .update({ plan: 'free' })
      .eq('id', userId)
  }
}
```

---

## Sección 3 — Gating y Seguridad

### `middleware.ts` (modificar)

Responsabilidad única: verificar **auth** para rutas protegidas + **rol admin**.
No hace verificaciones de plan ni de lección — eso es del Server Component.

```typescript
// /aprender/* — solo auth
if (pathname.startsWith('/aprender') && !user) {
  redirect('/login')
}

// /admin/* — auth + is_admin (RE-HABILITAR)
if (pathname.startsWith('/admin')) {
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')
}
```

### `app/aprender/[slug]/[lessonId]/page.tsx` (modificar)

Gate definitivo y único para acceso a contenido. Agregar al inicio del Server Component:

```typescript
// 1. Obtener usuario (ya hay auth check en middleware, pero doble verificación)
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// 2. Obtener plan del usuario
const { data: profile } = await supabase
  .from('profiles').select('plan').eq('id', user.id).single()

// 3. Obtener si la lección es free preview
const { data: lesson } = await supabase
  .from('lessons').select('is_free_preview, ...')
  .eq('id', lessonId).single()
if (!lesson) notFound()

// 4. Gate: si plan free y lección no es preview → redirect
if (profile?.plan === 'free' && !lesson.is_free_preview) {
  redirect(`/precios?ref=paywall&course=${slug}`)
}
```

### `app/api/progress/route.ts` (modificar)

Agregar plan check antes del upsert:

```typescript
const { data: profile } = await supabase
  .from('profiles').select('plan').eq('id', user.id).single()

// Verificar que el usuario tenga acceso a esta lección
const { data: lesson } = await supabase
  .from('lessons').select('is_free_preview').eq('id', lessonId).single()

if (profile?.plan === 'free' && !lesson?.is_free_preview) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
// ... upsert progress
```

### Capas de seguridad completas

| Capa | Responsabilidad | Cuándo falla → |
|------|----------------|----------------|
| Middleware | Auth present para rutas protegidas; is_admin para /admin | redirect /login o / |
| Server Component aprender | Plan + is_free_preview (fuente de verdad) | redirect /precios |
| /api/progress | Mismo check — no registrar progreso sin acceso | 403 Forbidden |
| Webhook HMAC | Rechazar webhooks no firmados por MP | 401 Unauthorized |
| RLS Supabase | Última línea — users ven solo sus datos | query retorna vacío |

---

## Sección 4 — UI

### `app/precios/page.tsx` (modificar)

Los botones de plan actualmente no hacen nada. Wiring real:

- **Plan FREE** → botón "Empezar gratis" → link a `/registro`
- **Plan Norte** → botón "Suscribirse" → `fetch('/api/checkout/subscription', { body: { plan: 'norte' } })` → redirect a `init_point`
- **Plan Norte Pro** → ídem con `plan: 'norte_pro'`
- Si el usuario ya tiene ese plan → botón deshabilitado "Tu plan actual"

### Dashboard (modificar `app/dashboard/page.tsx` o componente existente)

Agregar badge de plan junto al nombre:
- FREE: sin badge (o badge gris "Free")
- NORTE: badge verde `--en-green` "Norte"
- NORTE PRO: badge coral `--en-coral` "Norte Pro"

---

## Sección 5 — Variables de Entorno Nuevas

```env
MP_WEBHOOK_SECRET=     # Secret para verificar firma HMAC de webhooks MP
NEXT_PUBLIC_URL=       # URL base (https://estudionorte.ar o la de Vercel)
```

`MP_ACCESS_TOKEN` ya existe. `MP_WEBHOOK_SECRET` se obtiene en el panel de MP al configurar la URL del webhook.

---

## Sección 6 — Archivos

### Nuevos
```
supabase/migrations/005_subscriptions.sql
app/api/checkout/subscription/route.ts
app/gracias/page.tsx
```

### Modificados
```
app/api/webhooks/mercadopago/route.ts   — HMAC + manejo preapproval
middleware.ts                           — simplificar + re-habilitar admin
app/aprender/[slug]/[lessonId]/page.tsx — gate plan + is_free_preview
app/api/progress/route.ts               — plan check antes de upsert
app/precios/page.tsx                    — CTAs reales
app/dashboard/page.tsx                  — badge de plan
```

---

## Global Constraints

- Cero colores hardcodeados — solo `var(--en-*)` en componentes React
- Server Components en todas las rutas nuevas excepto interacciones de cliente
- `createAdminClient()` para todas las escrituras desde webhook (bypasea RLS)
- `createClient()` (server) para lecturas autenticadas
- Verificación HMAC obligatoria en webhook antes de cualquier lógica de negocio
- `profiles.plan` es la única fuente de verdad para gating — nunca leer de `subscriptions` en el gate
- La página `/gracias` NO debe mostrar el plan como activo — el webhook es async
- El middleware NO verifica plan ni lección — solo auth y rol admin
