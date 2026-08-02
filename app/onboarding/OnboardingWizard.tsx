'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INTERESTS = [
  'Diseño de marca', 'Logo con IA', 'Canva avanzado',
  'Contenido para redes', 'Conseguir clientes', 'Herramientas IA',
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
  const [completeError, setCompleteError] = useState('')

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  async function complete(destination: 'cursos' | 'precios') {
    setCompleting(true)
    setCompleteError('')
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selectedInterests }),
      })
      if (!res.ok) {
        // Mark as best-effort — still navigate so the user isn't stuck
        console.error('onboarding complete failed:', await res.text())
      }
      // Always redirect to dashboard — middleware will let them through once
      // onboarding_completed = true is persisted
      router.push(destination === 'precios' ? '/precios' : '/dashboard')
    } catch (err) {
      setCompleteError('Hubo un error. Intentá de nuevo.')
      console.error(err)
    } finally {
      setCompleting(false)
    }
  }

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
            Bienvenido a Estudio Norte. Acá vas a aprender a diseñar marcas con IA y a conseguir tus primeros clientes.
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

  // PASO 3 — Tu plan
  const PLANS = [
    {
      name: 'FREE', color: 'var(--en-text-soft)', price: '$0',
      features: ['1 lección por curso', 'Catálogo de cursos', 'Comunidad lectura'],
      current: userPlan === 'free',
    },
    {
      name: 'NORTE', color: 'var(--en-green)', price: 'U$D 12/mes',
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
          {completeError && (
            <p style={{ fontSize: '13px', color: '#C0392B', textAlign: 'center', margin: 0 }}>{completeError}</p>
          )}
          <button
            onClick={() => complete('cursos')}
            disabled={completing}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: completing ? 'wait' : 'pointer', background: 'var(--en-green)', color: 'var(--en-white)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', opacity: completing ? 0.7 : 1 }}
          >
            {completing ? 'Un momento...' : 'Ingresar al dashboard →'}
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
          <a
            href="/dashboard"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)', padding: '4px', textAlign: 'center', display: 'block', textDecoration: 'none' }}
          >
            — Volver
          </a>
        </div>
      </div>
    </div>
  )
}
