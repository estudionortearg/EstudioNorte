'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function InstructorCTA() {
  return (
    <section style={{
      backgroundColor: 'var(--color-bg-deep)',
      padding: '0 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            borderRadius: '28px',
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(78,205,196,0.06) 0%, rgba(255,107,107,0.04) 50%, rgba(10,10,20,0.9) 100%)',
            border: '1px solid rgba(78,205,196,0.12)',
          }}
        >
          {/* Grid bg */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} viewBox="0 0 1100 400" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 38 }).map((_, i) => <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="400" stroke="white" strokeWidth="1"/>)}
            {Array.from({ length: 14 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 30} x2="1100" y2={i * 30} stroke="white" strokeWidth="1"/>)}
          </svg>

          {/* Glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%,-50%)',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}/>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0',
            position: 'relative', zIndex: 1,
          }}>
            {/* Left: Quote + autor */}
            <div style={{ padding: '72px 64px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '80px', lineHeight: 0.7,
                color: 'rgba(78,205,196,0.2)', marginBottom: '24px',
              }}>"</div>
              <blockquote style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-1px',
                color: 'var(--color-text)', lineHeight: 1.25,
                margin: '0 0 32px',
                fontStyle: 'italic',
              }}>
                Empecé a usar IA porque no tenía opción. Ahora es mi ventaja competitiva real.
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(255,107,107,0.1))',
                  border: '1px solid rgba(78,205,196,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
                  color: 'var(--color-teal)',
                }}>JG</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>Juan Gallino</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.35)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>Instructor · Estudio Norte</div>
                </div>
              </div>
            </div>

            {/* Right: Course CTA */}
            <div style={{ padding: '72px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '100px', marginBottom: '24px',
                background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
                width: 'fit-content',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-coral)', boxShadow: '0 0 8px rgba(255,107,107,0.6)' }}/>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-coral)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Disponible ahora
                </span>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(20px, 2.5vw, 28px)', letterSpacing: '-1px',
                color: 'var(--color-text)', lineHeight: 1.2, marginBottom: '16px',
              }}>
                IA para Community Managers que quieren trabajar distinto
              </h3>

              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'rgba(247,247,242,0.4)', lineHeight: 1.7, marginBottom: '32px',
              }}>
                5 módulos · 15 lecciones · Acceso de por vida · Certificado verificable
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color: 'var(--color-coral)', letterSpacing: '-1.5px', lineHeight: 1 }}>
                    $25.000
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', letterSpacing: '1px', marginTop: '2px' }}>
                    ARS · o USD 25 internacional
                  </div>
                </div>
                <Button href="/cursos/ia-para-community-managers" variant="primary">
                  Empezar ahora →
                </Button>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="rgba(78,205,196,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)' }}>
                  Garantía de 7 días. Si no aprendés algo aplicable, te devolvemos el dinero.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
