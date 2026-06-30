'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

const stats = [
  { value: '4+', label: 'años en\nel rubro' },
  { value: '50+', label: 'clientes\ngestionados' },
  { value: '100%', label: 'contenido\naplicable' },
]

function InstructorCard() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Main card */}
      <div style={{
        borderRadius: '24px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(135deg, #0D0D1A 0%, #0A0E1A 100%)',
        position: 'relative',
      }}>
        {/* Visual area */}
        <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
          {/* Grid bg */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }} viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 18 }).map((_, i) => <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="280" stroke="white" strokeWidth="1"/>)}
            {Array.from({ length: 10 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 30} x2="500" y2={i * 30} stroke="white" strokeWidth="1"/>)}
          </svg>

          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(78,205,196,0.09) 0%, transparent 65%)',
          }}/>

          {/* Rotating rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '200px', height: '200px', borderRadius: '50%',
              border: '1px solid rgba(78,205,196,0.1)',
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '140px', height: '140px', borderRadius: '50%',
              border: '1px dashed rgba(255,107,107,0.08)',
            }}
          />

          {/* Avatar */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(255,107,107,0.1))',
            border: '1px solid rgba(78,205,196,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="15" r="8" stroke="rgba(78,205,196,0.7)" strokeWidth="1.5"/>
              <path d="M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="rgba(78,205,196,0.5)" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Gradient bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, #0D0D1A, transparent)' }}/>
        </div>

        {/* Bottom info */}
        <div style={{ padding: '20px 24px 28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
            Juan Gallino
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>
            Community Manager · Rafaela, SF
          </div>
        </div>
      </div>

      {/* Floating quote card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        viewport={{ once: true }}
        style={{
          position: 'absolute', bottom: '-24px', right: '-24px',
          maxWidth: '220px', padding: '16px 20px',
          borderRadius: '14px',
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(78,205,196,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: 'rgba(78,205,196,0.3)', lineHeight: 0.8, marginBottom: '8px' }}>"</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.6)', lineHeight: 1.7 }}>
          Lo que enseño no lo saqué de un libro. Lo saqué de haberlo hecho.
        </p>
        <div style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-teal)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          — Juan Gallino
        </div>
      </motion.div>
    </div>
  )
}

export default function AboutJuano() {
  return (
    <section style={{
      backgroundColor: 'var(--color-bg-section)', padding: '130px 24px 160px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.15), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.08), transparent)' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '100px', alignItems: 'center' }}>

        {/* Left - instructor card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ display: 'flex', justifyContent: 'center', paddingBottom: '24px' }}
        >
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <InstructorCard />
          </div>
        </motion.div>

        {/* Right - text + stats + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          viewport={{ once: true }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '20px' }}>
            Sobre el instructor
          </p>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(44px, 5.5vw, 68px)', letterSpacing: '-3px',
            color: 'var(--color-text)', lineHeight: 0.95, marginBottom: '32px', fontStyle: 'italic',
          }}>
            Juan<br />Gallino
          </h2>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.85, color: 'rgba(247,247,242,0.55)', marginBottom: '20px', maxWidth: '420px' }}>
            Community manager en Rafaela, Santa Fe. Manejo cuentas reales, resuelvo problemas reales, y uso IA todos los días.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.85, color: 'rgba(247,247,242,0.55)', maxWidth: '420px', marginBottom: '40px' }}>
            Lo que enseño acá <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>no lo saqué de un libro</span> — lo saqué de haberlo hecho.
          </p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginBottom: '40px' }}>
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '20px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: i === 0 ? '12px 0 0 12px' : i === 2 ? '0 12px 12px 0' : '0',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, color: 'var(--color-teal)', letterSpacing: '-1px' }}>{value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', lineHeight: 1.4, marginTop: '4px', whiteSpace: 'pre-line', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button href="/cursos/ia-para-community-managers" variant="primary">Ver el curso →</Button>
            <Button href="/sobre-juano" variant="ghost">Conocé más sobre Juano</Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
