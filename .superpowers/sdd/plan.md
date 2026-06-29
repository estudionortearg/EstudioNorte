# Estudio Norte — Build Plan

## Project
Plataforma de cursos online premium. Next.js 15 App Router, Supabase, Mercado Pago, Stripe, Resend, Vercel.
Working directory: D:\CLAUDECORE\ESTUDIO NORTE\estudio-norte-web
Branch: build/estudio-norte-v1

## Global Constraints
- Colors: --color-bg-deep:#0A0A14, --color-bg-section:#1A1A2E, --color-bg-card:#0F0F1A, --color-teal:#4ECDC4, --color-coral:#FF6B6B, --color-text:#F7F7F2
- Fonts: Fraunces (display) + Inter (body) from Google Fonts ONLY
- No white backgrounds, no placeholder copy, no Lorem Ipsum
- Coral ONLY for CTAs, prices, Polaris dot — never decorative
- All borders with opacity (never solid color borders)
- Mobile-first
- TypeScript strict
- No extra features beyond spec

## Task 1: Setup brand tokens + CSS variables + fonts

**Goal:** Configure Tailwind + CSS custom properties for the entire design system.

**Files to create/edit:**
- `app/globals.css` — add CSS variables, Google Fonts import, base typography
- `tailwind.config.ts` — extend with brand colors, fonts, spacing
- `next.config.ts` — nothing needed yet

**CSS variables (exact values, copy verbatim):**
```css
:root {
  --color-bg-deep: #0A0A14;
  --color-bg-section: #1A1A2E;
  --color-bg-card: #0F0F1A;
  --color-teal: #4ECDC4;
  --color-teal-muted: rgba(78,205,196,0.12);
  --color-coral: #FF6B6B;
  --color-coral-dark: #E05555;
  --color-text: #F7F7F2;
  --color-text-muted: rgba(247,247,242,0.5);
  --color-text-faint: rgba(247,247,242,0.25);
  --color-border: rgba(78,205,196,0.08);
  --color-border-mid: rgba(78,205,196,0.15);
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
}
```

**Google Fonts import (add to globals.css top):**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Inter:wght@300;400;500;600&display=swap');
```

**Tailwind config — extend colors with brand tokens, extend fontFamily:**
- `brand-bg-deep`, `brand-bg-section`, `brand-bg-card`
- `brand-teal`, `brand-coral`, `brand-coral-dark`
- `brand-text`, `brand-text-muted`
- fontFamily: display: ['Fraunces', 'serif'], body: ['Inter', 'sans-serif']

**base html/body styles in globals.css:**
- background: var(--color-bg-deep)
- color: var(--color-text)
- font-family: var(--font-body)

**Commit:** `chore: add brand design tokens, CSS variables, Tailwind config`

---

## Task 2: Supabase schema — SQL migration files

**Goal:** Create SQL migration files for all tables + RLS. No actual Supabase connection needed.

**Files to create:**
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

**Schema (exact SQL — copy verbatim from spec):**
```sql
-- profiles, courses, modules, lessons, enrollments, progress, payments
-- (full tables as in the master prompt)
```

**RLS rules:**
- profiles: users read/write own row only
- courses: SELECT public (is_published = true), all for service role
- lessons: SELECT if free_preview OR user has active enrollment
- enrollments: users see their own
- progress: users see their own
- payments: users see their own

**Commit:** `feat: add Supabase migration files — schema + RLS`

---

## Task 3: Base components — Logo, Button, Badge, Card, Input

**Goal:** Build the 5 base UI components all other features rely on.

**Files to create:**
- `components/ui/Logo.tsx` — renders the SVG isotipo from spec; accepts `className`
- `public/logo.svg` — save the SVG from spec verbatim
- `components/ui/Button.tsx` — variants: primary (coral bg), secondary (teal outline), ghost
- `components/ui/Badge.tsx` — teal outline badge, uppercase Inter 10px letter-spacing 2px
- `components/ui/Card.tsx` — dark card bg-card, border-mid, hover coral shadow
- `components/ui/Input.tsx` — dark input, teal focus border

**Logo SVG (exact — copy verbatim from master prompt's SVG block)**

**Button primary:** bg coral #FF6B6B, text white, hover scale(1.02) + coral shadow, Inter 500
**Button secondary:** border teal, text teal, transparent bg
**Button ghost:** transparent, text-muted, hover text-text

**Card hover:** `box-shadow: 0 20px 40px rgba(255,107,107,0.15)`, elevate translate-y-1

**Commit:** `feat: add base UI components — Logo, Button, Badge, Card, Input`

---

## Task 4: Layout — Header + Footer

**Goal:** App-wide layout with nav and auth state.

**Files to create/edit:**
- `components/layout/Header.tsx` — Logo left, nav links center/right, "Ya soy alumno" CTA
- `components/layout/Footer.tsx` — "Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina"
- `app/layout.tsx` — wrap with Header + Footer, apply globals

**Header nav links:** Cursos, Sobre Juano
**Header right:** "Ya soy alumno" ghost button → /login
**Header bg:** bg-deep with border-bottom border (rgba teal)
**Footer:** centered, text-muted, small Inter, include isotipo

**No auth logic yet** — header just renders static; auth state added in Task 8.

**Commit:** `feat: add Header and Footer layout components`

---

## Task 5: Landing page

**Goal:** Full landing page at `/` with hero, courses section, about, guarantee, CTA.

**Files to edit:** `app/page.tsx`
**Files to create:** `components/sections/Hero.tsx`, `components/sections/CoursesPreview.tsx`, `components/sections/AboutJuano.tsx`, `components/sections/Guarantee.tsx`, `components/sections/FinalCTA.tsx`

**Install:** `framer-motion` (npm install framer-motion)

**Hero:**
- Full-viewport, bg-deep
- Animated star particles (CSS or simple canvas — 30-50 dots, low opacity teal, subtle drift)
- Large isotipo watermark (background, 40% opacity, centered behind text)
- Title: Fraunces 900 italic, "Aprendé lo que yo uso\ncon clientes reales, hoy"
- Subtitle: Inter 400, "Cursos de IA y marketing digital para profesionales que quieren resultados, no teoría."
- Two CTAs: primary "Ver cursos" → /cursos, secondary ghost "Ya soy alumno" → /login
- Framer Motion entrance: stagger logo → title → subtitle → CTAs (duration 0.6, ease easeOut, y: 40→0)

**Courses Preview:** 
- Section title "Lo que podés aprender" (Fraunces 700)
- Static card for the IA course (slug: ia-para-community-managers)
- Badge "IA Práctica" + "Nuevo"
- Price $25.000 ARS in coral Fraunces
- "Ver curso" button

**About Juano:**
- bg-section
- Copy verbatim: "Soy Juan Gallino, community manager en Rafaela, Santa Fe. Manejo cuentas reales, resuelvo problemas reales, y uso IA todos los días en mi trabajo. Lo que enseño acá no lo saqué de un libro — lo saqué de haberlo hecho."

**Guarantee:**
- bg-card, teal left-border accent
- "Si en 7 días no aprendiste algo que podés aplicar mañana, te devuelvo el dinero."

**FinalCTA:**
- bg-deep, coral CTA button "Ver cursos"

**Scroll animations:** `sectionVariants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }` + `useInView` or `whileInView`

**Commit:** `feat: landing page — hero animado, secciones, copy real`

---

## Task 6: Catálogo de cursos /cursos

**Goal:** Course catalog page with grid of course cards.

**Files to create:**
- `app/cursos/page.tsx`
- `components/courses/CourseCard.tsx`

**CourseCard:**
- Dark thumbnail area (if no image: gradient from bg-section to bg-deep)
- Small isotipo (Logo) top-right corner of thumbnail
- Title in Fraunces 400 28px
- Price in Fraunces coral (the most visually prominent element)
- Badges (IA Práctica, Nuevo, Más vendido)
- "Ver curso" → /cursos/[slug]
- Hover: translate-y-1, coral box-shadow

**Page:**
- bg-deep
- Title "Lo que podés aprender" Fraunces 700
- Responsive grid (1 col mobile, 2 col md, 3 col lg)
- Static data for now (the IA course)
- Framer Motion stagger on cards

**Commit:** `feat: catálogo de cursos /cursos con CourseCard`

---

## Task 7: Página de venta /cursos/[slug]

**Goal:** Full sales page for each course.

**Files to create:**
- `app/cursos/[slug]/page.tsx`
- `app/cursos/[slug]/CourseHero.tsx` (or keep in page)

**Content (use real copy from spec for ia-para-community-managers):**
- Title: "IA para Community Managers que quieren trabajar distinto"
- Subtitle: "Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía."
- Price: $25.000 ARS in coral Fraunces (prominent)
- Badge: "Acceso de por vida · Actualizaciones incluidas"
- "Para quién es" section (3 bullets from spec)
- "Qué vas a aprender" section (5 bullets from spec)
- Two buy buttons: "Comprar ahora (ARS)" (coral) + "Pay in USD" (teal outline)
- Both buttons disabled for now (onClick → console.log); wired in Tasks 9 & 10

**Layout:**
- Left column (prose): all the details
- Right column (sticky): price card with buy buttons
- Mobile: stacked, price card first

**Commit:** `feat: página de venta de curso /cursos/[slug]`

---

## Task 8: Supabase Auth — magic link + client setup

**Goal:** Auth flow: login with magic link, registration happens post-purchase automatically.

**Install:** `@supabase/supabase-js` `@supabase/ssr`

**Files to create:**
- `lib/supabase/client.ts` — createBrowserClient
- `lib/supabase/server.ts` — createServerClient (for Server Components)
- `lib/supabase/middleware.ts` — session refresh middleware
- `middleware.ts` — protect /dashboard, /aprender, /admin routes
- `app/login/page.tsx` — magic link form: email input + "Enviame el link" button
- `app/login/callback/route.ts` — exchange code for session
- `app/(auth)/layout.tsx` — simple centered layout for auth pages

**Env vars needed (create .env.local.example):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Middleware protection:**
- /dashboard/* → redirect to /login if no session
- /aprender/* → redirect to /login if no session  
- /admin/* → check ADMIN_EMAIL env var or role claim

**Login page copy:** "Accedé a tus cursos" title, "Ingresá tu email y te mandamos un link de acceso." subtitle

**Update Header:** show user email + "Salir" if session, "Ya soy alumno" if not

**Commit:** `feat: Supabase Auth — magic link login, session middleware`

---

## Task 9: Mercado Pago — checkout + webhook + enrollment

**Goal:** Complete ARS payment flow.

**Install:** `mercadopago` npm package

**Files to create:**
- `app/api/checkout/mercadopago/route.ts` — POST: create MP preference, return init_point URL
- `app/api/webhooks/mercadopago/route.ts` — POST: verify signature, handle payment.approved, create enrollment + payment record
- `app/gracias/page.tsx` — post-purchase confirmation page

**MP checkout flow:**
1. POST body: { courseSlug, userId, userEmail }
2. Create preference with item (course title, price_ars, quantity 1)
3. back_urls: success → /gracias?curso=[slug], failure → /cursos/[slug], pending → /gracias?curso=[slug]&pending=true
4. Return { init_point }

**Webhook:**
- Verify x-signature header with MERCADOPAGO_WEBHOOK_SECRET
- On payment.approved: look up payment by provider_payment_id, find user by email from MP data, create enrollment (expires_at: null = lifetime), create payment record (status: approved)
- Return 200 immediately, process async

**Gracias page:**
- bg-deep, big teal checkmark icon, "Ya sos parte de Estudio Norte"
- Course name from query param
- CTA "Empezar ahora" → /aprender/[slug]

**Env vars (add to .env.local.example):**
```
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
```

**Commit:** `feat: Mercado Pago checkout + webhook + página de gracias`

---

## Task 10: Stripe — checkout + webhook + enrollment (USD)

**Goal:** USD payment flow for international students.

**Install:** `stripe` `@stripe/stripe-js`

**Files to create:**
- `app/api/checkout/stripe/route.ts` — POST: create Stripe Checkout Session
- `app/api/webhooks/stripe/route.ts` — POST: verify Stripe signature, handle checkout.session.completed

**Stripe flow:**
1. Create checkout.session with price_data (USD, price_usd)
2. success_url: /gracias?curso=[slug]&provider=stripe
3. cancel_url: /cursos/[slug]
4. metadata: { courseSlug, userId }

**Webhook:**
- Verify stripe-signature with STRIPE_WEBHOOK_SECRET
- On checkout.session.completed: create enrollment + payment record

**Env vars (add to .env.local.example):**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

**Wire up buy buttons in /cursos/[slug]:**
- "Comprar ahora (ARS)" → POST /api/checkout/mercadopago → redirect to init_point
- "Pay in USD" → POST /api/checkout/stripe → redirect to Stripe hosted checkout

**Commit:** `feat: Stripe checkout + webhook + wire buy buttons`

---

## Task 11: Dashboard del alumno /dashboard

**Goal:** Authenticated student dashboard showing their courses and progress.

**Files to create:**
- `app/dashboard/page.tsx` — Server Component, reads enrollments from Supabase
- `components/dashboard/CourseProgressCard.tsx` — radial progress circle in teal
- `components/dashboard/WelcomeGreeting.tsx` — "Buen día/tarde/noche, [nombre]. Seguís donde lo dejaste."

**Dashboard content:**
- Greeting with time-of-day (Buenos días/tardes/noches)
- Grid of enrolled courses with radial progress (SVG circle, teal stroke)
- Each card: course name, "X% completado", last lesson accessed, "Continuar" CTA → /aprender/[slug]
- If progress = 100%: show "Descargar certificado" teal button
- If no courses: "Todavía no tenés cursos" + "Ver cursos" CTA

**Radial progress circle:**
- SVG circle, r=20, stroke teal, stroke-dasharray based on percentage
- Percentage text in center in Fraunces

**Commit:** `feat: dashboard del alumno con progreso radial`

---

## Task 12: Player de clases /aprender/[slug]/[leccion]

**Goal:** Two-panel lesson player with video embed and sidebar.

**Files to create:**
- `app/aprender/[slug]/[leccion]/page.tsx`
- `components/player/VideoPlayer.tsx` — iframe embed (YouTube/Vimeo)
- `components/player/LessonSidebar.tsx` — modules list, current lesson highlighted
- `components/player/LessonHeader.tsx` — course title, overall progress bar (teal)
- `app/api/progress/route.ts` — POST: mark lesson complete

**Layout:**
- Header: course title + overall teal progress bar
- Body: two panels — left 70% video, right 30% sidebar
- Diagonal divider: 1px coral line between panels (CSS clip-path or border)
- Mobile: stacked (video top, sidebar below as accordion)

**Sidebar:**
- Modules collapsible (accordion)
- Current lesson: coral text + coral left border
- Completed lessons: teal checkmark
- Click lesson → navigate to /aprender/[slug]/[leccion-id]

**Complete button:**
- "Marcar como completada" button below video
- On click: POST /api/progress, then Framer Motion checkmark micro-animation, Polaris dot flickers coral briefly
- If last lesson: trigger confetti or celebration animation

**VideoPlayer:**
- Accepts YouTube or Vimeo URL
- Parse URL to extract embed URL
- Render iframe with aspect-ratio: 16/9

**Commit:** `feat: player de clases dos paneles con sidebar y progreso`

---

## Task 13: Certificados PDF

**Goal:** Generate downloadable completion certificates.

**Install:** `@react-pdf/renderer` or use `canvas` + `jsPDF` — use `jsPDF` + `html2canvas` approach via API route (simpler)

**Files to create:**
- `app/api/certificados/[courseSlug]/route.ts` — GET: verify enrollment + 100% progress, generate PDF, return as blob
- `components/certificates/CertificateTemplate.tsx` — visual template (for preview, not PDF generation)

**Certificate content:**
- Estudio Norte logo/name
- "Certifica que [nombre del alumno]"
- "Completó exitosamente el curso"
- Course title in Fraunces
- Date of completion
- Juan Gallino signature line
- "Estudio Norte · estudionorte.ar"

**PDF generation via API:**
- Use `jsPDF` to build the PDF server-side
- Brand colors (dark bg or white bg for print — use white bg for certificate readability)
- Return as application/pdf response

**Commit:** `feat: generador de certificados PDF`

---

## Task 14: Admin panel /admin

**Goal:** Basic admin dashboard with metrics, course management, and student list.

**Files to create:**
- `app/admin/page.tsx` — metrics: total students, total revenue, courses published
- `app/admin/cursos/page.tsx` — list courses with edit links
- `app/admin/alumnos/page.tsx` — list enrollments with student emails
- `app/admin/ventas/page.tsx` — payments table
- `components/admin/AdminLayout.tsx` — sidebar nav for admin
- `components/admin/MetricCard.tsx` — stat card

**Protection:** middleware already protects /admin/* in Task 8. Admin checks ADMIN_EMAIL env var.

**Metrics page:** 
- Total enrolled students (count enrollments)
- Total revenue ARS (sum payments where status=approved, currency=ARS)
- Total revenue USD
- Courses published count
- Recent 10 payments table

**Course list:** title, slug, price, is_published toggle (static display), "Editar" link

**Students list:** email, course enrolled, enrolled_at, progress %

**All data via Supabase service role key (server components)**

**Commit:** `feat: admin panel — métricas, cursos, alumnos, ventas`

---

## Task 15: Resend emails

**Goal:** Transactional emails for welcome, progress reminder, and certificate.

**Install:** `resend`

**Files to create:**
- `lib/email/resend.ts` — Resend client + send functions
- `lib/email/templates/welcome.tsx` — React Email template
- `lib/email/templates/reminder.tsx` — React Email template  
- `lib/email/templates/certificate.tsx` — React Email template
- `app/api/emails/welcome/route.ts` — POST: send welcome email (called from webhooks)

**Install:** `resend` `@react-email/components`

**Welcome email:**
- Subject: "Ya sos parte de Estudio Norte 🌟"
- Estudio Norte branding (teal/coral)
- "Hola [nombre], bienvenido/a."
- Course name
- Coral CTA button "Empezar ahora" → /aprender/[slug]
- Firma: Juan Gallino, Estudio Norte

**Reminder email (called by a cron or manually):**
- Subject: "Te esperamos donde lo dejaste"
- Progress %, próxima lección
- CTA "Continuar"

**Certificate email:**
- Subject: "Tu certificado de Estudio Norte está listo"
- Felicitación
- CTA "Descargar certificado" + LinkedIn share prompt

**Wire welcome email:** call from MP webhook (Task 9) and Stripe webhook (Task 10) after successful enrollment.

**Env vars:**
```
RESEND_API_KEY=
RESEND_FROM_EMAIL=hola@estudionorte.ar
NEXT_PUBLIC_SITE_URL=https://estudionorte.ar
```

**Commit:** `feat: Resend emails — bienvenida, recordatorio, certificado`

---

## Task 16: Deploy config — Vercel + env vars docs

**Goal:** Vercel configuration files + full .env.local.example + README for deployment.

**Files to create/edit:**
- `vercel.json` — if needed (rewrites for webhook raw body, etc.)
- `.env.local.example` — complete list of all env vars with comments
- `README.md` — deployment instructions

**vercel.json:** 
- Add `"functions": { "app/api/webhooks/**": { "maxDuration": 30 } }` for webhook timeout

**.env.local.example (complete):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hola@estudionorte.ar

# App
NEXT_PUBLIC_SITE_URL=https://estudionorte.ar
ADMIN_EMAIL=jgallino1@gmail.com
```

**README.md:** 
- Project description
- Local dev setup (npm install, copy .env.local.example to .env.local, fill values)
- Supabase setup (run migrations)
- Vercel deploy steps
- Domain setup (estudionorte.ar)
- Webhook URLs for MP and Stripe

**Commit:** `feat: Vercel deploy config, .env.local.example, deployment README`

---

## Seed Data (optional Task 16b)
- `supabase/seed.sql` — INSERT the pilot course (ia-para-community-managers) with real data from spec
