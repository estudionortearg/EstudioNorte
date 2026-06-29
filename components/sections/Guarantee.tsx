'use client'

import Card from '@/components/ui/Card'

export default function Guarantee() {
  return (
    <section style={{ backgroundColor: 'var(--color-bg-section)', padding: '96px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Card>
          <div style={{ borderLeft: '3px solid var(--color-teal)', paddingLeft: '24px' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--color-teal)',
                marginBottom: '12px',
              }}
            >
              Garantía
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '24px',
                color: 'var(--color-text)',
                lineHeight: 1.5,
              }}
            >
              Si en 7 días no aprendiste algo que podés aplicar mañana, te devuelvo el dinero.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
