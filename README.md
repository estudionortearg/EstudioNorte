# Estudio Norte

Plataforma de cursos online premium para emprendedores y profesionales digitales de Argentina y LATAM.

**Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina**

---

## Stack

- **Framework:** Next.js 15 App Router + TypeScript
- **Estilos:** Tailwind CSS v4 + CSS variables
- **Auth:** Supabase Auth (magic link)
- **Base de datos:** Supabase PostgreSQL
- **Pagos ARS:** Mercado Pago Checkout Pro
- **Pagos USD:** Stripe Checkout
- **Emails:** Resend + React Email
- **Deploy:** Vercel
- **Dominio:** estudionorte.ar

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd estudio-norte-web
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completá todos los valores en `.env.local`.

### 3. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Ejecutá las migraciones en el SQL Editor de Supabase:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
3. (Opcional) Ejecutá el seed: `supabase/seed.sql`

### 4. Dev server

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

### 1. Conectar repositorio

1. Pusheá el código a GitHub (repo público o privado)
2. Importá el proyecto en [vercel.com](https://vercel.com)
3. Framework: **Next.js** (detectado automáticamente)

### 2. Variables de entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agregá todas las variables de `.env.local.example`.

### 3. Dominio

En Vercel → Settings → Domains, agregá `estudionorte.ar` y configurá los DNS en tu registrador.

---

## Webhooks

Configurá estas URLs en los dashboards de cada proveedor:

| Proveedor | URL del webhook |
|-----------|----------------|
| Mercado Pago | `https://estudionorte.ar/api/webhooks/mercadopago` |
| Stripe | `https://estudionorte.ar/api/webhooks/stripe` |

---

## Rutas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing principal |
| `/cursos` | Catálogo de cursos |
| `/cursos/[slug]` | Página de venta |
| `/sobre-juano` | Página del instructor |
| `/login` | Acceso alumnos |
| `/gracias` | Confirmación de compra |

### Privadas (requieren autenticación)
| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel del alumno |
| `/aprender/[slug]/[leccion]` | Player de clases |
| `/certificados/[slug]` | Certificado del curso |

### Admin (requiere ADMIN_EMAIL)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Métricas generales |
| `/admin/cursos` | Gestión de cursos |
| `/admin/alumnos` | Lista de alumnos |
| `/admin/ventas` | Historial de pagos |

---

## Primer curso

El curso piloto `ia-para-community-managers` se carga ejecutando `supabase/seed.sql` en la base de datos.

---

*Generado con Claude Code · JuanoConecta · Junio 2026*
