'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function MailSentIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 24px', display: 'block' }}>
      <circle cx="28" cy="28" r="28" fill="var(--en-green-light)"/>
      <rect x="12" y="18" width="32" height="20" rx="3" stroke="var(--en-green)" strokeWidth="1.5"/>
      <path d="M12 22L28 30L44 22" stroke="var(--en-green)" strokeWidth="1.5" strokeLinecap="round"/>
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
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  // If user already has a valid session, send them to the dashboard
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
    // Read error message from URL (set by /auth/callback on failure)
    const params = new URLSearchParams(window.location.search)
    const errParam = params.get('error')
    if (errParam) setUrlError(decodeURIComponent(errParam))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUrlError('')

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
      {/* Left: Brand panel — unchanged */}
      <BrandPanel />

      {/* Right: Form */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '64px 48px', background: 'var(--en-surface)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: '380px' }}
        >
          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <MailSentIcon />
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '30px',
                color: 'var(--en-text)', marginBottom: '12px', letterSpacing: '-0.5px',
              }}>
                Revisá tu email
              </h1>
              <p style={{ color: 'var(--en-text-soft)', lineHeight: 1.7, fontSize: '15px' }}>
                Te mandamos un link de acceso a{' '}
                <strong style={{ color: 'var(--en-text)' }}>{email}</strong>.
                <br />Hacé click en el link desde el <strong>mismo navegador</strong> para entrar.
              </p>
              <div style={{
                marginTop: '28px', padding: '14px 16px', borderRadius: '10px',
                background: '#F0FBF9', border: '1px solid #C0EDE8',
                fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.6,
              }}>
                Si no lo ves en bandeja de entrada, revisá la carpeta de spam.
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{
                  marginTop: '20px', fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--en-green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Usar otro email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Logo link */}
              <div style={{ marginBottom: '40px' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '36px' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '12px' }}>EN</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
                </Link>

                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: '34px', letterSpacing: '-1.5px',
                  color: '#192335', marginBottom: '8px', lineHeight: 1.1,
                }}>
                  Ingresá a tu cuenta
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', color: '#7A8599', fontSize: '14px', lineHeight: 1.6 }}>
                  Acceso sin contraseña — te mandamos un link al instante.
                </p>
              </div>

              {/* URL error banner (from failed magic link) */}
              {urlError && (
                <div style={{
                  marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
                  background: '#FFF5F5', border: '1px solid #FFCACA',
                  fontSize: '13px', color: '#C0392B', lineHeight: 1.6,
                }}>
                  {urlError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Email field — underline style like HiStudy */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
                    color: '#7A8599', letterSpacing: '0.5px', textTransform: 'uppercase',
                    display: 'block', marginBottom: '10px',
                  }}>
                    Tu email
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    required
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${inputFocused ? '#4ECDC4' : '#E0E4ED'}`,
                      padding: '10px 0',
                      fontSize: '16px',
                      color: '#192335',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 200ms',
                    }}
                  />
                  {error && (
                    <span style={{ fontSize: '12px', color: '#C0392B', marginTop: '6px', display: 'block' }}>
                      {error}
                    </span>
                  )}
                </div>

                {/* CTA button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px 24px',
                    background: loading ? '#8BC8C5' : 'linear-gradient(135deg, #4ECDC4 0%, #2BAE9E 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '15px',
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '-0.2px',
                    transition: 'opacity 150ms, transform 100ms',
                    transform: 'translateY(0)',
                    boxShadow: '0 4px 16px rgba(78, 205, 196, 0.35)',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  {loading ? 'Enviando...' : 'Recibir link de acceso'}
                </button>
              </form>

              <p style={{
                marginTop: '28px', fontSize: '12px', color: '#A0A9B8',
                textAlign: 'center', lineHeight: 1.6,
              }}>
                Al continuar aceptás los{' '}
                <Link href="/terminos" style={{ color: 'var(--en-green)', textDecoration: 'none', fontWeight: 600 }}>términos de uso</Link>{' '}
                de Estudio Norte.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
