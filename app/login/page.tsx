'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'

function MailSentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 20px', display: 'block' }}>
      <rect x="4" y="10" width="40" height="28" rx="4" stroke="var(--en-green)" strokeWidth="1.5"/>
      <path d="M4 14L24 26L44 14" stroke="var(--en-green)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 32L38 38M38 32L32 38" stroke="var(--en-coral)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34 35H42" stroke="var(--en-coral)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BrandPanel() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '64px 48px', gap: '0',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}/>

      {/* Logo */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: '#fff',
        }}>EN</div>
      </div>

      <div style={{ textAlign: 'center', position: 'relative' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '16px',
        }}>
          Estudio Norte
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-1.5px',
          color: '#fff', lineHeight: 1.1, marginBottom: '20px',
        }}>
          Diseñá tu marca<br />con IA y propósito
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px',
          color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto',
        }}>
          Cursos prácticos para crear identidades de marca y conseguir tus primeros clientes.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'flex', gap: '32px', marginTop: '48px',
        padding: '20px 32px',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
      }}>
        {[['500+', 'Alumnos'], ['4.9★', 'Rating'], ['100%', 'Online']].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: '#fff', letterSpacing: '-1px' }}>{val}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{lbl}</div>
          </div>
        ))}
      </div>
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
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
      {/* Left: Brand panel */}
      <BrandPanel />

      {/* Right: Form */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '64px 48px', background: 'var(--en-surface)',
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
                color: 'var(--en-text)', marginBottom: '12px', letterSpacing: '-0.5px',
              }}>
                Revisá tu email
              </h1>
              <p style={{ color: 'var(--en-text-soft)', lineHeight: 1.7, fontSize: '15px' }}>
                Te mandamos un link de acceso a{' '}
                <strong style={{ color: 'var(--en-text)' }}>{email}</strong>.
                <br />Hacé click en el link para entrar.
              </p>
              <div style={{
                marginTop: '32px', padding: '16px', borderRadius: '10px',
                background: 'var(--en-green-08)', border: '1px solid var(--en-green-15)',
                fontSize: '13px', color: 'var(--en-text-soft)',
              }}>
                Si no lo ves en bandeja de entrada, revisá spam.
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
                  </Link>
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-1.5px',
                  color: 'var(--en-text)', marginBottom: '10px',
                }}>
                  Accedé a tus cursos
                </h1>
                <p style={{ color: 'var(--en-text-soft)', fontSize: '15px', lineHeight: 1.6 }}>
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
                marginTop: '32px', fontSize: '13px', color: 'var(--en-text-faint)',
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
