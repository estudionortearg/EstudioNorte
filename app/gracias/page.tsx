import Link from 'next/link'
import { Logo } from '@/components/ui'
import { Button } from '@/components/ui'

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string; pending?: string }>
}) {
  const { curso, pending } = await searchParams
  const isPending = pending === 'true'

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

        {isPending ? (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '36px', color: 'var(--color-text)', marginBottom: '16px' }}>
              Pago en proceso
            </h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: '32px' }}>
              Tu pago está siendo procesado. Te avisaremos por email cuando esté confirmado.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌟</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '40px', fontStyle: 'italic', color: 'var(--color-text)', marginBottom: '16px' }}>
              Ya sos parte de Estudio Norte
            </h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: '32px' }}>
              Tu acceso está activado. Revisá tu email — te mandamos los detalles de acceso.
            </p>
            {curso && (
              <Button href={`/aprender/${curso}`} variant="primary">
                Empezar ahora
              </Button>
            )}
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-teal)', fontSize: '14px', textDecoration: 'none' }}>
            Ir a mi dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
