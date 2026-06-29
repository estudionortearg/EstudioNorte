'use client'

import { Button } from '@/components/ui'

export default function SobreJuanoPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', padding: '80px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px' }}>
          El instructor
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-2px', fontStyle: 'italic', color: 'var(--color-text)', marginBottom: '32px', lineHeight: 1.1 }}>
          Juan Gallino
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(247,247,242,0.7)', lineHeight: 1.75, marginBottom: '24px' }}>
          Soy Juan Gallino, community manager en Rafaela, Santa Fe. Manejo cuentas reales, resuelvo problemas reales, y uso IA todos los días en mi trabajo.
        </p>
        <p style={{ fontSize: '18px', color: 'rgba(247,247,242,0.7)', lineHeight: 1.75, marginBottom: '24px' }}>
          Lo que enseño acá no lo saqué de un libro — lo saqué de haberlo hecho.
        </p>
        <p style={{ fontSize: '18px', color: 'rgba(247,247,242,0.7)', lineHeight: 1.75, marginBottom: '48px' }}>
          Estudio Norte es mi forma de compartir lo que sé con quienes quieren trabajar distinto, sin humo y sin teoría vacía.
        </p>
        <Button href="/cursos" variant="primary">Ver cursos</Button>
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid rgba(78,205,196,0.08)' }}>
          <p style={{ color: 'rgba(247,247,242,0.3)', fontSize: '13px' }}>
            Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina
          </p>
        </div>
      </div>
    </div>
  )
}
