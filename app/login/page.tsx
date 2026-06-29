'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Logo } from '@/components/ui'

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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Logo size="md" />
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '16px' }}>✉️</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', color: 'var(--color-text)', marginBottom: '12px' }}>
              Revisá tu email
            </h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Te mandamos un link de acceso a <strong style={{ color: 'var(--color-text)' }}>{email}</strong>. Hacé click en el link para entrar.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--color-text)', marginBottom: '12px', textAlign: 'center' }}>
              Accedé a tus cursos
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', textAlign: 'center', lineHeight: 1.6 }}>
              Ingresá tu email y te mandamos un link de acceso.
            </p>

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
              <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Enviando...' : 'Enviame el link'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
