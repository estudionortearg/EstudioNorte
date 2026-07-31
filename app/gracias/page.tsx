import Link from 'next/link'

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string; plan?: string; pending?: string }>
}) {
  const { curso, plan, pending } = await searchParams
  const isPending = pending === 'true'
  const isSubscription = !!plan

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--en-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'var(--en-green)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--en-white)', fontFamily: 'var(--font-display)',
          fontWeight: 900, fontSize: '18px', marginBottom: '32px',
        }}>
          EN
        </div>

        {isSubscription ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⏳</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 36px)', letterSpacing: '-1.5px',
              color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Tu suscripción está siendo procesada
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '8px',
            }}>
              Mercado Pago está confirmando tu pago. Esto puede tomar unos minutos.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '14px',
              color: 'var(--en-text-faint)', lineHeight: 1.6, marginBottom: '32px',
            }}>
              Te avisaremos por email cuando tu plan esté activo.
            </p>
          </>
        ) : isPending ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⏳</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 36px)', letterSpacing: '-1.5px',
              color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Pago en proceso
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '32px',
            }}>
              Tu pago está siendo procesado. Te avisaremos por email cuando esté confirmado.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌟</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-1.5px',
              fontStyle: 'italic', color: 'var(--en-text)', marginBottom: '16px',
            }}>
              Ya sos parte de Estudio Norte
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '32px',
            }}>
              Tu acceso está activado. Revisá tu email — te mandamos los detalles.
            </p>
            {curso && (
              <a
                href={`/aprender/${curso}`}
                style={{
                  display: 'inline-block',
                  padding: '14px 32px', borderRadius: '12px',
                  background: 'var(--en-green)', color: 'var(--en-white)',
                  fontFamily: 'var(--font-body)', fontWeight: 700,
                  fontSize: '14px', textDecoration: 'none',
                  boxShadow: 'var(--en-shadow-green)',
                }}
              >
                Empezar ahora
              </a>
            )}
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link href="/dashboard" style={{
            fontFamily: 'var(--font-body)', color: 'var(--en-green)',
            fontSize: '14px', textDecoration: 'none', fontWeight: 600,
          }}>
            Ir a mi dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
