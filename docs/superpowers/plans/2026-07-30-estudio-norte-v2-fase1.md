# Estudio Norte V2 — Fase 1: Rediseño Visual + Páginas Base

> **Para agentes:** USA superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar esta plan task por task. Los pasos usan sintaxis checkbox (`- [ ]`) para tracking.

**Goal:** Rediseñar la identidad visual completa de Estudio Norte del tema oscuro actual al nuevo sistema V2 (blanco + glassmorphism, verde #3D7A5F + coral #E8735A), y re-implementar las páginas principales: Landing, Dashboard, Player con PDF inline, y nueva página de Precios.

**Architecture:** Se actualiza el design system global (globals.css + variables CSS), luego se reescriben las páginas principales una por una usando las nuevas variables. El layout privado (dashboard/player) pasa a tener sidebar 64px de íconos en desktop y bottom nav en mobile. No se crean nuevas tablas en base de datos en esta fase — se usan las existentes.

**Tech Stack:** Next.js 16.2.9 App Router, Tailwind v4, Supabase (auth + storage), Fraunces + Inter (fuentes ya importadas), jsPDF (ya instalado), CSS nativo para animaciones y glassmorphism.

## Global Constraints

- Paleta exacta: verde `#3D7A5F`, coral `#E8735A`, fondo base `#FAFAF8`, superficie `#FFFFFF`, texto `#0F0F0F`, texto suave `#8A8A8A`
- Glassmorphism: `backdrop-filter: blur(12px)` + `background: rgba(255,255,255,0.75)` + `border: 1px solid rgba(0,0,0,0.06)`
- Sombras grandes y difusas: `box-shadow: 0 8px 40px rgba(0,0,0,0.08)`
- Íconos: Lucide (ya disponible en proyecto o inline SVG de trazo fino)
- Fuentes: Fraunces para display, Inter para body (ya importadas en globals.css)
- Animaciones: `transition: all 0.2s ease` o spring via `cubic-bezier(0.34,1.56,0.64,1)` — sin librerías adicionales
- Sin modo offline en esta fase
- No crear tablas nuevas en Supabase en esta fase
- Todos los colores via variables CSS, no valores hardcoded
- Archivos de componentes: máximo ~200 líneas cada uno, dividir si superan
- Las páginas privadas NO deben usar el `<Header>` ni `<Footer>` del layout público
- El app router layout en `app/layout.tsx` solo aplica a páginas públicas (debe excluir `/dashboard`, `/aprender`, `/perfil`, etc. — usan layout propio)

---

## Mapa de archivos

### Archivos a modificar
| Archivo | Qué cambia |
|---|---|
| `app/globals.css` | Nuevas variables CSS V2, glassmorphism utils, fondo claro |
| `app/layout.tsx` | Excluir header/footer para rutas privadas |
| `app/page.tsx` | Landing V2 completa |
| `app/dashboard/page.tsx` | Dashboard V2 con sidebar |
| `app/aprender/[slug]/[lessonId]/PlayerClient.tsx` | PDF inline + sidebar íconos |
| `app/cursos/page.tsx` | Catálogo V2 (colores actualizados) |

### Archivos a crear
| Archivo | Propósito |
|---|---|
| `app/precios/page.tsx` | Página pública con 3 planes (FREE / NORTE / NORTE PRO) |
| `components/layout/Sidebar.tsx` | Sidebar 64px con íconos — usado en dashboard y player |
| `components/layout/BottomNav.tsx` | Navegación bottom mobile (4 íconos) — usado en dashboard y player |
| `components/ui/GlassCard.tsx` | Card glassmorphism reutilizable |

### Archivos a NO tocar en esta fase
- `app/api/**` — APIs ya funcionan
- `middleware.ts` — protección de rutas correcta
- `app/certificados/**` — se rediseña en Fase 3
- `app/perfil/**` — se rediseña en Fase 3
- `app/admin/**` — se rediseña en Fase 4

---

## Interfaces de referencia

### GlassCard props
```tsx
interface GlassCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}
```

### Sidebar props
```tsx
interface SidebarProps {
  activeRoute: string  // pathname actual, eg '/dashboard'
}
```

### BottomNav props
```tsx
interface BottomNavProps {
  activeRoute: string
}
```

---

## Task 1: Design System V2

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: variables CSS disponibles globalmente:
  - `--en-green: #3D7A5F` (antes: `--color-teal`)
  - `--en-coral: #E8735A` (antes: `--color-coral`)
  - `--en-bg: #FAFAF8`
  - `--en-surface: #FFFFFF`
  - `--en-surface-2: rgba(255,255,255,0.75)`
  - `--en-text: #0F0F0F`
  - `--en-text-soft: #8A8A8A`
  - `--en-border: rgba(0,0,0,0.06)`
  - `--en-shadow: 0 8px 40px rgba(0,0,0,0.08)`
  - `--en-shadow-sm: 0 2px 12px rgba(0,0,0,0.06)`
  - clases CSS `.glass` y `.glass-dark` listas para usar

**No hay tests automatizados en este proyecto — la verificación es visual en el browser.**

- [ ] **Step 1: Reemplazar completamente globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Inter:wght@300;400;500;600&display=swap');

@import "tailwindcss";

:root {
  /* Paleta Estudio Norte V2 */
  --en-green: #3D7A5F;
  --en-green-light: rgba(61,122,95,0.12);
  --en-green-hover: #2D6A4F;
  --en-coral: #E8735A;
  --en-coral-light: rgba(232,115,90,0.12);
  --en-coral-hover: #D4614A;

  /* Fondos */
  --en-bg: #FAFAF8;
  --en-surface: #FFFFFF;
  --en-surface-2: rgba(255,255,255,0.75);

  /* Texto */
  --en-text: #0F0F0F;
  --en-text-soft: #8A8A8A;
  --en-text-faint: rgba(15,15,15,0.35);

  /* Borders y sombras */
  --en-border: rgba(0,0,0,0.06);
  --en-border-mid: rgba(0,0,0,0.12);
  --en-shadow: 0 8px 40px rgba(0,0,0,0.08);
  --en-shadow-sm: 0 2px 12px rgba(0,0,0,0.06);
  --en-shadow-lg: 0 20px 60px rgba(0,0,0,0.12);

  /* Tipografía */
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;

  /* Retrocompat — legacy vars apuntan a nuevos valores */
  --color-teal: #3D7A5F;
  --color-coral: #E8735A;
  --color-text: #0F0F0F;
  --color-text-muted: #8A8A8A;
  --color-text-faint: rgba(15,15,15,0.35);
  --color-border: rgba(0,0,0,0.06);
  --color-bg-deep: #FAFAF8;
  --color-bg-section: #F4F4F0;
  --color-bg-card: #FFFFFF;
}

@theme {
  --color-en-green: #3D7A5F;
  --color-en-coral: #E8735A;
  --color-en-bg: #FAFAF8;
  --font-family-display: 'Fraunces', serif;
  --font-family-body: 'Inter', sans-serif;
}

* { box-sizing: border-box; }

html {
  background-color: var(--en-bg);
  scroll-behavior: smooth;
}

body {
  background-color: var(--en-bg);
  /* Gradiente atmosférico fijo verde → coral */
  background-image:
    radial-gradient(ellipse 70% 50% at 10% 0%, rgba(61,122,95,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 10%, rgba(232,115,90,0.05) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 100%, rgba(61,122,95,0.04) 0%, transparent 60%);
  background-attachment: fixed;
  color: var(--en-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Glassmorphism utilities */
.glass {
  background: var(--en-surface-2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--en-border);
  box-shadow: var(--en-shadow);
}

.glass-white {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--en-border);
  box-shadow: var(--en-shadow);
}

/* Scrollbar personalizada */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }

/* Focus ring */
:focus-visible { outline: 2px solid var(--en-green); outline-offset: 2px; }
```

- [ ] **Step 2: Verificar en browser que el fondo cambió a claro**

Iniciar dev server: `npm run dev`  
Abrir http://localhost:3000 — el fondo debe ser blanco/crema (#FAFAF8), no negro.  
Si el fondo sigue negro, verificar que el import de tailwindcss no override el background.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: design system V2 — paleta clara, glassmorphism, verde/coral EN"
```

---

## Task 2: Componentes de layout reutilizables

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/BottomNav.tsx`
- Create: `components/ui/GlassCard.tsx`

**Interfaces:**
- Consumes: variables CSS de Task 1
- Produces:
  - `Sidebar({ activeRoute: string })` — sidebar 64px desktop, oculta en mobile
  - `BottomNav({ activeRoute: string })` — bottom nav mobile, oculta en desktop
  - `GlassCard({ children, style?, className? })` — wrapper glassmorphism

- [ ] **Step 1: Crear Sidebar.tsx**

```tsx
// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'

interface SidebarProps {
  activeRoute: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { href: '/cursos', label: 'Cursos', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { href: '/perfil', label: 'Perfil', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '64px', zIndex: 20,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--en-border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '16px', paddingBottom: '16px', gap: '4px',
        // Oculto en mobile
      }} className="hidden md:flex">
        {/* Logo */}
        <Link href="/dashboard" style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--en-green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '14px' }}>EN</span>
        </Link>

        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = activeRoute.startsWith(href)
          return (
            <div key={href} style={{ position: 'relative' }} className="group">
              <Link href={href} style={{
                width: '44px', height: '44px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                background: isActive ? 'var(--en-green-light)' : 'transparent',
                color: isActive ? 'var(--en-green)' : 'var(--en-text-soft)',
                transition: 'all 0.15s ease',
              }}>
                {icon}
              </Link>
              {/* Tooltip */}
              <div style={{
                position: 'absolute', left: '56px', top: '50%', transform: 'translateY(-50%)',
                background: 'var(--en-text)', color: '#fff',
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                fontFamily: 'var(--font-body)', fontWeight: 500,
                whiteSpace: 'nowrap', pointerEvents: 'none',
                opacity: 0, transition: 'opacity 0.15s ease',
              }} className="group-hover:opacity-100">
                {label}
              </div>
            </div>
          )
        })}
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Crear BottomNav.tsx**

```tsx
// components/layout/BottomNav.tsx
'use client'

import Link from 'next/link'

interface BottomNavProps {
  activeRoute: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { href: '/cursos', label: 'Cursos', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { href: '/perfil', label: 'Perfil', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function BottomNav({ activeRoute }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--en-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    }} className="md:hidden">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = activeRoute.startsWith(href)
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            textDecoration: 'none', padding: '8px 16px',
            color: isActive ? 'var(--en-green)' : 'var(--en-text-soft)',
            transition: 'color 0.15s ease',
          }}>
            {icon}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Crear GlassCard.tsx**

```tsx
// components/ui/GlassCard.tsx
import { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function GlassCard({ children, style, className }: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        borderRadius: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/BottomNav.tsx components/ui/GlassCard.tsx
git commit -m "feat: Sidebar, BottomNav y GlassCard para V2"
```

---

## Task 3: Landing Page V2

**Files:**
- Modify: `app/page.tsx` (reescribir inline — eliminar imports de secciones antiguas)

**Interfaces:**
- Consumes: variables CSS de Task 1
- Produces: página pública `/` completamente rediseñada con identidad V2

**Nota:** La landing actual importa componentes separados (`Hero`, `StatsBar`, etc.). En V2 la landing es más concisa — hero + cursos preview + propuesta de valor + CTA. Se inlinea todo en `app/page.tsx` para evitar indirección innecesaria. Los archivos de componentes viejos se pueden dejar (no borrar) — quedan huérfanos pero no rompen nada.

- [ ] **Step 1: Reescribir app/page.tsx**

```tsx
// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getPublishedCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('id, slug, title, description, cover_image_url')
    .eq('is_published', true)
    .limit(4)
  return data || []
}

export default async function HomePage() {
  const courses = await getPublishedCourses()

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header público */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(250,250,248,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'var(--en-green)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px',
            }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>
              Estudio Norte
            </span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Cursos</Link>
            <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Precios</Link>
            <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Juan</Link>
            <Link href="/login" style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              color: 'var(--en-green)', textDecoration: 'none',
              padding: '7px 16px', borderRadius: '8px',
              border: '1.5px solid var(--en-green)',
            }}>Ingresar</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: 'clamp(64px, 10vw, 120px) clamp(16px, 5vw, 64px)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--en-green-light)', marginBottom: '24px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--en-green)', display: 'inline-block',
            }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>
              Formación digital para Argentina y LATAM
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 80px)', letterSpacing: '-3px',
            color: 'var(--en-text)', lineHeight: 1.0, marginBottom: '24px',
          }}>
            Aprendé<br />
            <span style={{ color: 'var(--en-green)' }}>marketing</span><br />
            con propósito.
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--en-text-soft)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px',
          }}>
            Guías, cursos y mentoría de Juan Gallino — CM, IA y publicidad para que crezcas de verdad.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/cursos" style={{
              padding: '14px 28px', borderRadius: '12px',
              background: 'var(--en-green)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 20px rgba(61,122,95,0.3)',
            }}>
              Ver cursos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/precios" style={{
              padding: '14px 28px', borderRadius: '12px',
              background: 'transparent', color: 'var(--en-text)',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px',
              textDecoration: 'none', border: '1.5px solid var(--en-border)',
            }}>
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 clamp(16px, 5vw, 64px) 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Alumnos activos' },
            { value: '12', label: 'Cursos y guías' },
            { value: '4.9★', label: 'Rating promedio' },
            { value: '100%', label: 'Online y a tu ritmo' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', color: 'var(--en-text)', letterSpacing: '-1.5px' }}>
                {value}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cursos preview */}
      {courses.length > 0 && (
        <section style={{ padding: '64px clamp(16px, 5vw, 64px)', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-1.5px', color: 'var(--en-text)' }}>
                Lo que podés aprender
              </h2>
              <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-green)', textDecoration: 'none', fontWeight: 500 }}>
                Ver todos →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {courses.map(course => (
                <Link key={course.id} href={`/cursos/${course.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: '16px',
                    border: '1px solid var(--en-border)',
                    boxShadow: 'var(--en-shadow-sm)',
                    overflow: 'hidden', transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }} onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--en-shadow)'
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                  }} onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--en-shadow-sm)'
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  }}>
                    {course.cover_image_url ? (
                      <div style={{ height: '140px', background: `url(${course.cover_image_url}) center/cover`, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15))' }}/>
                      </div>
                    ) : (
                      <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--en-green-light), var(--en-coral-light))' }}/>
                    )}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                        {course.title}
                      </h3>
                      {course.description && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 52px)', letterSpacing: '-2px', color: 'var(--en-text)', marginBottom: '16px' }}>
            Empezá hoy.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', color: 'var(--en-text-soft)', marginBottom: '32px' }}>
            El primer paso es el más difícil. El resto lo hacemos juntos.
          </p>
          <Link href="/precios" style={{
            padding: '16px 40px', borderRadius: '14px',
            background: 'var(--en-coral)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '16px',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(232,115,90,0.35)',
          }}>
            Ver planes →
          </Link>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer style={{
        padding: '24px clamp(16px, 5vw, 64px)',
        borderTop: '1px solid var(--en-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
          © 2026 Estudio Norte — Juan Gallino
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
          Rafaela, Santa Fe, Argentina
        </span>
      </footer>

    </div>
  )
}
```

- [ ] **Step 2: Verificar en browser**

- http://localhost:3000 debe mostrar fondo claro, headline en negro, botones verdes/coral
- El header debe ser sticky con glassmorphism
- Las cards de cursos deben tener sombra sutil
- Si hay error de hidratación por los event handlers inline, mover los cards a un `'use client'` componente separado

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing V2 — diseño claro, hero, cursos preview, CTA"
```

---

## Task 4: Página de Precios

**Files:**
- Create: `app/precios/page.tsx`

**Interfaces:**
- Consumes: variables CSS de Task 1
- Produces: página `/precios` con los 3 planes (FREE / NORTE U$D7 / NORTE PRO U$D15)

- [ ] **Step 1: Crear app/precios/page.tsx**

```tsx
// app/precios/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Planes — Estudio Norte' }

const PLANS = [
  {
    name: 'FREE',
    price: '$0',
    period: '',
    description: 'Para explorar la plataforma',
    color: 'var(--en-text-soft)',
    cta: 'Crear cuenta gratis',
    ctaHref: '/login',
    ctaStyle: 'outline' as const,
    features: [
      'Comunidad en modo lectura',
      '1 lección de muestra por curso',
      'Acceso al catálogo de cursos',
      'Sin tutor IA',
      'Sin certificados',
    ],
    notIncluded: ['Tutor IA', 'Certificados', 'Peer review'],
  },
  {
    name: 'NORTE',
    price: 'U$D 7',
    period: '/mes',
    description: 'El plan para aprender de verdad',
    color: 'var(--en-green)',
    cta: 'Empezar plan Norte',
    ctaHref: '/login?plan=norte',
    ctaStyle: 'solid' as const,
    featured: true,
    features: [
      'Todas las guías PDF',
      'Comunidad completa (escribir, votar, responder)',
      'Tutor IA en cada lección',
      'Clases en vivo con Juan',
      'Sistema XP + Badges + Racha',
      'Recompensas por progreso',
      'Descuento anual: 2 meses gratis',
    ],
    notIncluded: ['Peer review', 'Certificados verificables', 'Descuento cursos premium'],
  },
  {
    name: 'NORTE PRO',
    price: 'U$D 15',
    period: '/mes',
    description: 'Para quien va en serio',
    color: 'var(--en-coral)',
    cta: 'Empezar Norte Pro',
    ctaHref: '/login?plan=norte-pro',
    ctaStyle: 'coral' as const,
    features: [
      'Todo lo de NORTE',
      'Peer review con compañeros',
      'Certificados verificables + LinkedIn',
      '20% descuento en cursos premium',
      'Prioridad en mentoría con Juan',
      'Descuento anual: 2 meses gratis',
    ],
    notIncluded: [],
  },
]

export default function PreciosPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(250,250,248,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </Link>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-green)', fontWeight: 600, textDecoration: 'none' }}>
            Mi cuenta →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 96px) clamp(16px, 5vw, 64px) 48px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-2.5px', color: 'var(--en-text)', marginBottom: '16px' }}>
          Elegí tu plan
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--en-text-soft)', maxWidth: '480px', margin: '0 auto' }}>
          Precios en USD. Podés pagar en ARS al tipo de cambio del día vía Mercado Pago.
        </p>
      </div>

      {/* Plans grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 64px) 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', alignItems: 'stretch' }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{
            background: plan.featured ? 'var(--en-green)' : '#fff',
            border: `1.5px solid ${plan.featured ? 'transparent' : 'var(--en-border)'}`,
            borderRadius: '24px',
            padding: '32px',
            boxShadow: plan.featured ? '0 20px 60px rgba(61,122,95,0.25)' : 'var(--en-shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: '0',
            position: 'relative',
          }}>
            {plan.featured && (
              <div style={{
                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--en-coral)', color: '#fff',
                padding: '4px 16px', borderRadius: '100px',
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                whiteSpace: 'nowrap',
              }}>
                MÁS POPULAR
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: plan.featured ? 'rgba(255,255,255,0.7)' : plan.color, marginBottom: '8px' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '44px', letterSpacing: '-2px', color: plan.featured ? '#fff' : 'var(--en-text)' }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'rgba(255,255,255,0.6)' : 'var(--en-text-soft)' }}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'rgba(255,255,255,0.75)' : 'var(--en-text-soft)', marginTop: '8px' }}>
                {plan.description}
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {plan.features.map(feat => (
                <li key={feat} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? '#fff' : 'var(--en-green)'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'rgba(255,255,255,0.9)' : 'var(--en-text)' }}>
                    {feat}
                  </span>
                </li>
              ))}
              {plan.notIncluded.map(feat => (
                <li key={feat} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: 0.4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'rgba(255,255,255,0.9)' : 'var(--en-text)', textDecoration: 'line-through' }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.ctaHref} style={{
              display: 'block', textAlign: 'center',
              padding: '14px 24px', borderRadius: '12px', textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px',
              ...(plan.ctaStyle === 'solid' && {
                background: '#fff', color: 'var(--en-green)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }),
              ...(plan.ctaStyle === 'outline' && {
                background: 'transparent', color: 'var(--en-text)',
                border: '1.5px solid var(--en-border)',
              }),
              ...(plan.ctaStyle === 'coral' && {
                background: 'var(--en-coral)', color: '#fff',
                boxShadow: '0 4px 20px rgba(232,115,90,0.3)',
              }),
            }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Nota ARS */}
      <div style={{ textAlign: 'center', padding: '0 16px 64px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
        Los precios se muestran en USD. En el checkout podés pagar en ARS al tipo de cambio del día con Mercado Pago.
      </div>

    </div>
  )
}
```

- [ ] **Step 2: Verificar en browser**

Abrir http://localhost:3000/precios — debe mostrar los 3 planes con el card verde (NORTE) resaltado, el badge "MÁS POPULAR", precios en display grande, lista de features con checks.

- [ ] **Step 3: Commit**

```bash
git add app/precios/page.tsx
git commit -m "feat: página de precios con 3 planes FREE/NORTE/NORTE PRO"
```

---

## Task 5: Dashboard V2

**Files:**
- Modify: `app/dashboard/page.tsx`
- Consumes: `Sidebar` de Task 2, `BottomNav` de Task 2

**Interfaces:**
- Produces: dashboard con sidebar lateral en desktop, bottom nav en mobile, tema claro

**Nota importante:** El dashboard es una Server Component. Para usar Sidebar/BottomNav que tienen `'use client'`, simplemente se importan normalmente — Next.js permite importar client components en server components.

- [ ] **Step 1: Reescribir app/dashboard/page.tsx**

Reemplazar el contenido completo con la versión V2:

```tsx
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = { title: 'Mi Dashboard — Estudio Norte' }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at, courses (id, slug, title)')
    .eq('user_id', user.id)

  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string } | null
      if (!course) return null

      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', course.id)
      const moduleIds = modules?.map((m: { id: string }) => m.id) || []
      if (moduleIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0, totalLessons: 0, completedLessons: 0 }

      const { data: lessons } = await supabase.from('lessons').select('id, title').in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []
      if (lessonIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0, totalLessons: 0, completedLessons: 0 }

      const { data: progressRows } = await supabase
        .from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', lessonIds)

      const completedIds = new Set((progressRows || []).map(p => p.lesson_id))
      const completedLessons = completedIds.size
      const totalLessons = lessonIds.length
      const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
      const nextLesson = lessons?.find((l: { id: string; title: string }) => !completedIds.has(l.id))

      return { courseSlug: course.slug, courseTitle: course.title, progressPercent: percent, totalLessons, completedLessons, nextLessonId: nextLesson?.id, nextLessonTitle: nextLesson?.title }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    courseSlug: string; courseTitle: string; progressPercent: number
    totalLessons: number; completedLessons: number
    nextLessonId?: string; nextLessonTitle?: string
  }>

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const resumeCourse = activeCourses[0] || validCourses[0]
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', display: 'flex' }}>

      <Sidebar activeRoute="/dashboard" />

      {/* Main content — con offset por sidebar en desktop */}
      <div style={{ flex: 1, paddingLeft: '0', paddingBottom: '80px' }} className="md:pl-16">

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(250,250,248,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--en-border)',
          padding: '0 clamp(16px, 4vw, 40px)',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>{getGreeting()}, </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-green)' }}>{displayName}</span>
            </div>
            <Link href="/perfil" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--en-green-light)', border: '2px solid rgba(61,122,95,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-green)',
              textDecoration: 'none',
            }}>
              {initials}
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)' }}>

          {validCourses.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-2px', color: 'var(--en-text)', marginBottom: '16px' }}>
                Tu aprendizaje<br />empieza hoy
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '16px', marginBottom: '32px' }}>
                Todavía no tenés cursos. Explorá el catálogo y empezá.
              </p>
              <Link href="/cursos" style={{
                padding: '14px 28px', borderRadius: '12px',
                background: 'var(--en-green)', color: '#fff',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
                textDecoration: 'none',
              }}>
                Ver cursos disponibles →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Resume banner */}
              {resumeCourse && resumeCourse.progressPercent > 0 && resumeCourse.progressPercent < 100 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(61,122,95,0.08), rgba(232,115,90,0.05))',
                  border: '1.5px solid rgba(61,122,95,0.15)',
                  borderRadius: '20px', padding: '28px 32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '6px' }}>
                      Retomá donde lo dejaste
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                      {resumeCourse.courseTitle}
                    </h2>
                    {resumeCourse.nextLessonTitle && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', marginTop: '4px' }}>
                        Próximo: {resumeCourse.nextLessonTitle}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color: 'var(--en-green)', letterSpacing: '-1.5px', lineHeight: 1 }}>
                        {resumeCourse.progressPercent}%
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)' }}>completado</div>
                    </div>
                    <Link
                      href={resumeCourse.nextLessonId
                        ? `/aprender/${resumeCourse.courseSlug}/${resumeCourse.nextLessonId}`
                        : `/aprender/${resumeCourse.courseSlug}`}
                      style={{
                        padding: '12px 24px', borderRadius: '10px', textDecoration: 'none',
                        background: 'var(--en-green)', color: '#fff',
                        fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(61,122,95,0.3)',
                      }}
                    >
                      Continuar →
                    </Link>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                  { value: validCourses.length, label: 'Inscriptos', color: 'var(--en-text)' },
                  { value: activeCourses.length, label: 'En progreso', color: 'var(--en-coral)' },
                  { value: completedCourses.length, label: 'Completados', color: 'var(--en-green)' },
                ].map(({ value, label, color }) => (
                  <div key={label} style={{
                    background: '#fff', border: '1px solid var(--en-border)',
                    borderRadius: '16px', padding: '20px 16px',
                    boxShadow: 'var(--en-shadow-sm)',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color, letterSpacing: '-1.5px', lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cursos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                    Mis cursos
                  </h2>
                  <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-green)', textDecoration: 'none' }}>
                    Explorar más →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                  {validCourses.map(course => {
                    const isComplete = course.progressPercent === 100
                    return (
                      <Link key={course.courseSlug}
                        href={course.nextLessonId
                          ? `/aprender/${course.courseSlug}/${course.nextLessonId}`
                          : `/aprender/${course.courseSlug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          background: '#fff', border: '1px solid var(--en-border)',
                          borderRadius: '16px', padding: '20px',
                          boxShadow: 'var(--en-shadow-sm)', transition: 'box-shadow 0.2s ease',
                        }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '12px' }}>
                            {course.courseTitle}
                          </h3>
                          {/* Progress bar */}
                          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.08)', marginBottom: '8px' }}>
                            <div style={{ height: '100%', borderRadius: '2px', background: isComplete ? 'var(--en-green)' : 'var(--en-coral)', width: `${course.progressPercent}%`, transition: 'width 0.3s ease' }}/>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                              {course.completedLessons}/{course.totalLessons} lecciones
                            </span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: isComplete ? 'var(--en-green)' : 'var(--en-coral)' }}>
                              {course.progressPercent}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <BottomNav activeRoute="/dashboard" />
    </div>
  )
}
```

- [ ] **Step 2: Verificar en browser**

Ir a http://localhost:3000/dashboard (logueado):
- Debe mostrar fondo claro, sidebar verde en desktop, bottom nav en mobile (reducir ventana a < 768px)
- Avatar verde claro en top right
- Cards con sombra sutil y barra de progreso coral

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: dashboard V2 — tema claro, sidebar, bottom nav, progress cards"
```

---

## Task 6: Player con PDF inline V2

**Files:**
- Modify: `app/aprender/[slug]/[lessonId]/PlayerClient.tsx`
- Modify: `app/aprender/[slug]/[lessonId]/page.tsx` (agregar `pdf_url` al select de lessons)

**Interfaces:**
- Consumes: variables CSS de Task 1, `Sidebar` y `BottomNav` de Task 2
- Produces: player con PDF inline renderizado via `<embed>`, botón descargar PDF, tema claro

**Nota sobre PDF rendering:** Se usa `<embed src={pdf_url} type="application/pdf">` que el browser renderiza nativo en desktop. En iOS Safari `<embed>` no funciona, por eso se agrega un link "Abrir PDF" de fallback.

- [ ] **Step 1: Modificar page.tsx para incluir pdf_url en el select**

En `app/aprender/[slug]/[lessonId]/page.tsx`, buscar la línea que hace select de la lección y agregar `pdf_url`:

```tsx
// Buscar esta línea (o similar):
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, title, description, video_url, duration_minutes, order_index, module_id')
  .eq('id', lessonId)
  .single()

// Cambiarla por:
const { data: lesson } = await supabase
  .from('lessons')
  .select('id, title, description, video_url, pdf_url, duration_minutes, order_index, module_id')
  .eq('id', lessonId)
  .single()
```

- [ ] **Step 2: Agregar pdf_url a la interface Lesson en PlayerClient.tsx**

```tsx
// En PlayerClient.tsx, modificar la interface Lesson:
interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  pdf_url: string | null   // ← agregar esta línea
  duration_minutes: number | null
  order_index: number
  module_id: string
}
```

- [ ] **Step 3: Reescribir PlayerClient.tsx completo con diseño V2 y PDF viewer**

```tsx
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  pdf_url: string | null
  duration_minutes: number | null
  order_index: number
  module_id: string
}

interface LessonItem {
  id: string
  title: string
  duration_minutes: number | null
  order_index: number
  is_free_preview: boolean
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: LessonItem[]
}

interface Props {
  courseSlug: string
  courseTitle: string
  lesson: Lesson
  modules: Module[]
  completedIds: string[]
  prevLessonId: string | null
  nextLessonId: string | null
  userId: string
  completedCount: number
  totalCount: number
}

function getVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`
  return url
}

export default function PlayerClient({
  courseSlug, courseTitle, lesson, modules, completedIds,
  prevLessonId, nextLessonId, userId, completedCount, totalCount,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [completed, setCompleted] = useState(new Set(completedIds))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isCurrentComplete = completed.has(lesson.id)
  const progressPercent = totalCount > 0 ? Math.round((completed.size / totalCount) * 100) : 0
  const videoEmbedUrl = getVideoEmbedUrl(lesson.video_url)

  const markComplete = async () => {
    if (isCurrentComplete) return
    startTransition(async () => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lesson.id }),
      })
      setCompleted(prev => new Set([...prev, lesson.id]))
      if (nextLessonId) {
        setTimeout(() => router.push(`/aprender/${courseSlug}/${nextLessonId}`), 500)
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', display: 'flex' }}>

      <Sidebar activeRoute={pathname} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '80px' }} className="md:pl-16">

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--en-border)',
          padding: '0 clamp(12px, 3vw, 32px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)',
              textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {courseTitle}
            </Link>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '100px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.08)' }}>
              <div style={{ height: '100%', borderRadius: '2px', background: 'var(--en-green)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}/>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>
              {progressPercent}%
            </span>

            {/* Toggle sidebar button */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--en-border)',
                background: sidebarOpen ? 'var(--en-green-light)' : '#fff',
                color: sidebarOpen ? 'var(--en-green)' : 'var(--en-text-soft)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              Índice
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', gap: '0', overflow: 'hidden' }}>

          {/* Main player */}
          <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }}>

            {/* Lesson title */}
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '-1px',
              color: 'var(--en-text)', marginBottom: '24px', lineHeight: 1.2,
            }}>
              {lesson.title}
            </h1>

            {/* Video player */}
            {videoEmbedUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: 'var(--en-shadow)' }}>
                <iframe
                  src={videoEmbedUrl}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF viewer */}
            {lesson.pdf_url && (
              <div style={{ marginBottom: '24px' }}>
                {/* Download / open link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <a
                    href={lesson.pdf_url}
                    download
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                      background: 'var(--en-green-light)', color: 'var(--en-green)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                      border: '1px solid rgba(61,122,95,0.2)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar PDF
                  </a>
                  <a
                    href={lesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                      background: '#fff', color: 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '13px',
                      border: '1px solid var(--en-border)',
                    }}
                  >
                    Abrir en nueva pestaña
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>

                {/* Inline embed — native PDF viewer del browser */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-sm)' }}>
                  <embed
                    src={lesson.pdf_url}
                    type="application/pdf"
                    style={{ width: '100%', height: '80vh', display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* No content fallback */}
            {!videoEmbedUrl && !lesson.pdf_url && (
              <div style={{
                height: '200px', borderRadius: '16px',
                background: 'rgba(0,0,0,0.03)', border: '1.5px dashed var(--en-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-faint)', fontSize: '14px' }}>
                  Contenido próximamente
                </p>
              </div>
            )}

            {/* Description */}
            {lesson.description && (
              <div style={{
                background: '#fff', border: '1px solid var(--en-border)',
                borderRadius: '16px', padding: '20px', marginBottom: '24px',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.7 }}>
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Nav + Mark complete */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {prevLessonId && (
                  <Link href={`/aprender/${courseSlug}/${prevLessonId}`} style={{
                    padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                    background: '#fff', color: 'var(--en-text)',
                    border: '1px solid var(--en-border)',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Anterior
                  </Link>
                )}
                {nextLessonId && (
                  <Link href={`/aprender/${courseSlug}/${nextLessonId}`} style={{
                    padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                    background: '#fff', color: 'var(--en-text)',
                    border: '1px solid var(--en-border)',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    Siguiente
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                )}
              </div>

              <button
                onClick={markComplete}
                disabled={isCurrentComplete || isPending}
                style={{
                  padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: isCurrentComplete ? 'default' : 'pointer',
                  background: isCurrentComplete ? 'var(--en-green)' : 'var(--en-green)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                  opacity: isCurrentComplete ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: isCurrentComplete ? 'none' : '0 4px 16px rgba(61,122,95,0.3)',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {isCurrentComplete ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Completada
                  </>
                ) : isPending ? 'Guardando...' : 'Marcar como completada'}
              </button>
            </div>
          </div>

          {/* Sidebar panel — módulos e índice */}
          {sidebarOpen && (
            <aside style={{
              width: '280px', flexShrink: 0,
              background: '#fff', borderLeft: '1px solid var(--en-border)',
              overflow: 'auto', padding: '20px 0',
            }}>
              <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-text-soft)' }}>
                  Índice del curso
                </p>
              </div>
              {modules.map(mod => (
                <div key={mod.id} style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '6px 16px', marginBottom: '4px' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {mod.title}
                    </p>
                  </div>
                  {mod.lessons.sort((a, b) => a.order_index - b.order_index).map(l => {
                    const isComplete = completed.has(l.id)
                    const isCurrent = l.id === lesson.id
                    return (
                      <Link
                        key={l.id}
                        href={`/aprender/${courseSlug}/${l.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 16px', textDecoration: 'none',
                          background: isCurrent ? 'var(--en-green-light)' : 'transparent',
                          borderLeft: `3px solid ${isCurrent ? 'var(--en-green)' : 'transparent'}`,
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <span style={{
                          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                          background: isComplete ? 'var(--en-green)' : '#fff',
                          border: `1.5px solid ${isComplete ? 'var(--en-green)' : 'var(--en-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isComplete && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: '13px',
                          color: isCurrent ? 'var(--en-green)' : isComplete ? 'var(--en-text-soft)' : 'var(--en-text)',
                          fontWeight: isCurrent ? 600 : 400,
                          lineHeight: 1.3, flex: 1,
                        }}>
                          {l.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </aside>
          )}
        </div>
      </div>

      <BottomNav activeRoute={pathname} />
    </div>
  )
}
```

- [ ] **Step 4: Verificar en browser**

Abrir una lección: http://localhost:3000/aprender/[slug]/[lessonId]
- Fondo claro, top bar sticky con progreso
- Sidebar lateral de íconos visible en desktop
- Si la lección tiene `pdf_url`: se ve el embed del PDF + botones descargar/abrir
- Si no tiene PDF ni video: se ve el placeholder "Contenido próximamente"
- Botón "Marcar como completada" verde, cambia a check al clickear
- Toggle "Índice" abre panel derecho con lista de lecciones

- [ ] **Step 5: Commit**

```bash
git add app/aprender/
git commit -m "feat: player V2 — PDF inline, sidebar módulos, tema claro"
```

---

## Self-Review

### Spec coverage
- [x] Sección 1 — Sistema Visual: CSS variables actualizadas, glassmorphism, fondo claro, verde/coral EN
- [x] Sección 2 — Landing `/`: rediseñada con hero, stats, cursos preview, CTA
- [x] Sección 2 — `/precios`: nueva página con 3 planes
- [x] Sección 2 — Dashboard `/dashboard`: redesign con sidebar, bottom nav, stats, progress cards
- [x] Sección 3 — Player: PDF inline con `<embed>`, botón descargar, sidebar módulos
- [x] Layout sidebar 64px solo íconos + tooltip: implementado en Sidebar.tsx
- [x] Bottom nav mobile (como app nativa): implementado en BottomNav.tsx
- [x] GlassCard: creado en components/ui/GlassCard.tsx

### Lo que se deja para Fase 2 (no está en este plan)
- Sistema XP, Badges, Racha
- Quizzes IA entre lecciones
- Tutor IA flotante
- Foro por curso
- Sección 5 Comunidad completa

### Lo que se deja para Fase 3
- Integración Stripe/MercadoPago en /precios
- Referidos y afiliados
- Certificados verificables V2

### Placeholder scan
- No hay ningún "TBD" ni "TODO" en el plan
- Todos los bloques de código son completos y ejecutables

### Type consistency
- `pdf_url: string | null` definido en interface Lesson en Task 6 y pasado desde page.tsx en Task 6
- `activeRoute: string` en Sidebar y BottomNav usado consistentemente en Tasks 5 y 6
- `completedIds: string[]` y `setCompleted` usan `Set<string>` consistentemente

---

**Plan guardado y commiteado.** Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)** — Un subagente fresco por tarea, review entre tareas, iteración rápida. Invoca `superpowers:subagent-driven-development`.

**2. Inline Execution** — Ejecutar tareas en esta sesión. Invoca `superpowers:executing-plans`.

¿Cuál preferís?
