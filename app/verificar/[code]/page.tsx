// app/verificar/[code]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Verificar Certificado — Estudio Norte' }
}

export default async function VerificarPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('issued_at, verification_code, user_id, courses(title)')
    .eq('verification_code', code)
    .single()

  if (!cert) notFound()

  const courseTitle = Array.isArray((cert as any).courses)
    ? ((cert as any).courses[0]?.title ?? '')
    : ((cert as any).courses as { title: string } | null)?.title ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', cert.user_id)
    .single()

  const displayName = profile?.full_name || 'Alumno'

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--en-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'var(--font-body)',
    }}>
      {/* Badge de autenticidad */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'var(--en-green-light)', border: '1px solid var(--en-green)',
        borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
      }}>
        <span style={{ color: 'var(--en-green)', fontSize: '13px', fontWeight: 600 }}>
          ✓ Certificado auténtico
        </span>
      </div>

      {/* Certificado */}
      <div style={{
        width: '100%', maxWidth: '680px',
        background: 'var(--en-surface)', borderRadius: '20px',
        border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow)',
        borderTop: '3px solid var(--en-coral)',
        padding: 'clamp(40px, 6vw, 64px)',
        textAlign: 'center', marginBottom: '32px',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '3px', color: 'var(--en-green)',
          marginBottom: '20px', textTransform: 'uppercase', fontWeight: 700,
        }}>
          ESTUDIO NORTE
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 900,
          letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px',
        }}>
          Certificado de Finalización
        </h1>
        <div style={{
          width: '60px', height: '2px',
          background: 'var(--en-coral)', margin: '0 auto 28px',
        }} />
        <p style={{ fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
          Se certifica que
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900,
          letterSpacing: '-1.5px', color: 'var(--en-text)',
          marginBottom: '16px', lineHeight: 1.1,
        }}>
          {displayName}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '12px' }}>
          completó satisfactoriamente el curso
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(15px, 3vw, 20px)', fontWeight: 700,
          color: 'var(--en-coral)', marginBottom: '32px',
        }}>
          {courseTitle}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '40px' }}>
          {issuedDate}
        </p>
        <div style={{ display: 'inline-block' }}>
          <div style={{
            width: '140px', height: '1px',
            background: 'var(--en-border-mid)', margin: '0 auto 8px',
          }} />
          <p style={{ fontSize: '12px', color: 'var(--en-text-soft)' }}>Juan Gallino</p>
          <p style={{ fontSize: '10px', color: 'var(--en-text-faint)' }}>Director - Estudio Norte</p>
        </div>
      </div>

      {/* Footer */}
      <Link
        href="/"
        style={{
          fontSize: '14px', color: 'var(--en-green)',
          fontWeight: 600, textDecoration: 'none',
        }}
      >
        Conocé Estudio Norte →
      </Link>
    </div>
  )
}
