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
