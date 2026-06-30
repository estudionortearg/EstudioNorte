'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'

function MailSentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 20px', display: 'block' }}>
      <rect x="4" y="10" width="40" height="28" rx="4" stroke="var(--color-teal)" strokeWidth="1.5"/>
      <path d="M4 14L24 26L44 14" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 32L38 38M38 32L32 38" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34 35H42" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BrandPanel() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0A0A14 0%, #0D1117 60%, #0A0E1A 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '64px 48px', gap: '0',
    }}>
      {/* Grid lines decoration */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="600" stroke="white" strokeWidth="1"/>
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 44} x2="400" y2={i * 44} stroke="white" strokeWidth="1"/>
        ))}
      </svg>

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(78,205,196,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Animated rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'relative', marginBottom: '48px' }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" stroke="rgba(78,205,196,0.12)" strokeWidth="1" fill="none"/>
          <circle cx="80" cy="80" r="52" stroke="rgba(78,205,196,0.18)" strokeWidth="1" fill="none" strokeDasharray="6 8"/>
          <circle cx="80" cy="80" r="34" stroke="rgba(255,107,107,0.15)" strokeWidth="1" fill="none"/>
          <circle cx="80" cy="80" r="8" fill="rgba(78,205,196,0.6)"/>
          <circle cx="80" cy="10" r="4" fill="rgba(255,107,107,0.8)"/>
          <circle cx="150" cy="80" r="3" fill="rgba(78,205,196,0.5)"/>
          <circle cx="80" cy="150" r="3.5" fill="rgba(255,107,107,0.5)"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ textAlign: 'center', position: 'relative' }}
      >
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px',
        }}>
          Estudio Norte
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-1.5px',
          color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '20px',
        }}>
          Tu próximo nivel<br />empieza acá
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '14px',
          color: 'rgba(247,247,242,0.4)', lineHeight: 1.8, maxWidth: '280px', margin: '0 auto',
        }}>
          Cursos de IA y marketing digital para profesionales del contenido.
        </p>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          display: 'flex', gap: '32px', marginTop: '56px',
          padding: '20px 32px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        }}
      >
        {[['1200+', 'Alumnos'], ['98%', 'Satisfacción'], ['7d', 'Garantía']].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: 'var(--color-teal)', letterSpacing: '-1px' }}>{val}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.3)', marginTop: '2px' }}>{lbl}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
      {/* Left: Brand panel */}
      <BrandPanel />

      {/* Right: Form */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '64px 48px', backgroundColor: 'var(--color-bg-deep)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '380px' }}
        >
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <MailSentIcon />
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px',
                color: 'var(--color-text)', marginBottom: '12px', letterSpacing: '-0.5px',
              }}>
                Revisá tu email
              </h1>
              <p style={{ color: 'rgba(247,247,242,0.45)', lineHeight: 1.7, fontSize: '15px' }}>
                Te mandamos un link de acceso a{' '}
                <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
                <br />Hacé click en el link para entrar.
              </p>
              <div style={{
                marginTop: '32px', padding: '16px', borderRadius: '10px',
                background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.15)',
                fontSize: '13px', color: 'rgba(247,247,242,0.5)',
              }}>
                Si no lo ves en bandeja de entrada, revisá spam.
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-1.5px',
                  color: 'var(--color-text)', marginBottom: '10px',
                }}>
                  Accedé a tus cursos
                </h1>
                <p style={{ color: 'rgba(247,247,242,0.4)', fontSize: '15px', lineHeight: 1.6 }}>
                  Ingresá tu email y te mandamos un link de acceso. Sin contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  error={error}
                />
                <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                  {loading ? 'Enviando...' : 'Enviame el link de acceso'}
                </Button>
              </form>

              <p style={{
                marginTop: '32px', fontSize: '13px', color: 'rgba(247,247,242,0.25)',
                textAlign: 'center', lineHeight: 1.6,
              }}>
                Al continuar aceptás los términos de uso de Estudio Norte.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
