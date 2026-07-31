// app/precios/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PreciosCTA from './PreciosCTA'

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

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--en-white)', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
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
            background: plan.featured ? 'var(--en-green)' : 'var(--en-white)',
            border: `1.5px solid ${plan.featured ? 'transparent' : 'var(--en-border)'}`,
            borderRadius: '24px',
            padding: '32px',
            boxShadow: plan.featured ? 'var(--en-shadow-green)' : 'var(--en-shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: '0',
            position: 'relative',
          }}>
            {plan.featured && (
              <div style={{
                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--en-coral)', color: 'var(--en-white)',
                padding: '4px 16px', borderRadius: '100px',
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                whiteSpace: 'nowrap',
              }}>
                MÁS POPULAR
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: plan.featured ? 'var(--en-white-70)' : plan.color, marginBottom: '8px' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '44px', letterSpacing: '-2px', color: plan.featured ? 'var(--en-white)' : 'var(--en-text)' }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'var(--en-white-60)' : 'var(--en-text-soft)' }}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'var(--en-white-75)' : 'var(--en-text-soft)', marginTop: '8px' }}>
                {plan.description}
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {plan.features.map(feat => (
                <li key={feat} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? 'var(--en-white)' : 'var(--en-green)'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'var(--en-white-90)' : 'var(--en-text)' }}>
                    {feat}
                  </span>
                </li>
              ))}
              {plan.notIncluded.map(feat => (
                <li key={feat} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: 0.4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: plan.featured ? 'var(--en-white-90)' : 'var(--en-text)', textDecoration: 'line-through' }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

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
