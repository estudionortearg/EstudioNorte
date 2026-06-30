'use client'

import { motion } from 'framer-motion'

export default function Guarantee() {
  return (
    <section style={{ backgroundColor: 'var(--color-bg-deep)', padding: '100px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{
            position: 'relative', padding: '56px 64px', borderRadius: '24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(78,205,196,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Corner accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '120px', height: '120px',
            background: 'radial-gradient(circle at 0% 0%, rgba(78,205,196,0.1), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '120px', height: '120px',
            background: 'radial-gradient(circle at 100% 100%, rgba(255,107,107,0.07), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Line accent */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--color-teal)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)' }}>
                Garantía sin letra chica
              </span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(22px, 3.5vw, 34px)', color: 'var(--color-text)',
              lineHeight: 1.45, letterSpacing: '-0.5px',
            }}>
              Si en <span style={{ color: 'var(--color-teal)', fontStyle: 'italic' }}>7 días</span> no aprendiste algo que<br />
              podés aplicar <span style={{ color: 'var(--color-coral)', fontStyle: 'italic' }}>mañana mismo</span>,<br />
              te devuelvo el dinero.
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
