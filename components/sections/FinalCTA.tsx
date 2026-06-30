'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function FinalCTA() {
  return (
    <section style={{
      backgroundColor: 'var(--color-bg-section)', padding: '160px 24px',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Horizontal scan lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: i * 0.08 }}
          viewport={{ once: true }}
          style={{
            position: 'absolute', top: `${15 + i * 14}%`, left: 0, right: 0,
            height: '1px', background: `rgba(78,205,196,${0.03 - i * 0.003})`,
            transformOrigin: 'center',
          }}
        />
      ))}

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(78,205,196,0.04), transparent)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}
        >
          <div style={{ width: '48px', height: '1px', background: 'rgba(78,205,196,0.4)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)' }}>
            Empezá hoy
          </span>
          <div style={{ width: '48px', height: '1px', background: 'rgba(78,205,196,0.4)' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(44px, 8vw, 88px)', fontStyle: 'italic',
            letterSpacing: '-4px', lineHeight: 0.95, marginBottom: '48px',
            background: 'linear-gradient(160deg, var(--color-text) 30%, var(--color-teal) 70%, var(--color-coral) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          Más allá de lo<br />que creías posible
        </motion.h2>

        {/* Two main CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}
        >
          <Button href="/cursos" variant="primary">Ver todos los cursos →</Button>
          <Button href="/login" variant="ghost">Acceder a mi cuenta</Button>
        </motion.div>

        {/* Bundle teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-teal)', boxShadow: '0 0 8px rgba(78,205,196,0.5)' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.35)', letterSpacing: '0.5px' }}>
              Bundle de cursos · próximamente
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-coral)', boxShadow: '0 0 8px rgba(255,107,107,0.4)' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.35)', letterSpacing: '0.5px' }}>
              Nuevos cursos en camino
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
