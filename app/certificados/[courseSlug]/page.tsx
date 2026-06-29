import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button, Logo } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Tu Certificado — Estudio Norte',
}

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('slug', courseSlug)
    .single()

  if (!course) redirect('/dashboard')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{ marginBottom: '32px' }}>
          <Logo size="lg" />
        </div>

        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '36px',
          fontStyle: 'italic',
          color: 'var(--color-text)',
          marginBottom: '16px'
        }}>
          ¡Lo lograste!
        </h1>

        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '16px',
          lineHeight: 1.75,
          marginBottom: '8px'
        }}>
          Completaste el curso
        </p>

        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '20px',
          color: 'var(--color-text)',
          marginBottom: '32px',
          lineHeight: 1.3
        }}>
          {course.title}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Button
            href={`/api/certificados/${courseSlug}`}
            variant="primary"
          >
            Descargar certificado PDF
          </Button>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=https://estudionorte.ar/certificados/${courseSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--color-teal)',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            Compartir en LinkedIn →
          </a>
        </div>

        <div style={{ marginTop: '24px' }}>
          <a
            href="/dashboard"
            style={{ color: 'var(--color-text-faint)', fontSize: '13px', textDecoration: 'none' }}
          >
            Volver al dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
