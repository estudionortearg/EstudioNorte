'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    initials: 'MG',
    name: 'María González',
    role: 'Community Manager · Rosario',
    quote: 'Empecé a usar IA en mi trabajo a la semana de arrancar el curso. Ahora hago en 2 horas lo que antes me llevaba un día entero.',
  },
  {
    initials: 'LP',
    name: 'Lucas Pérez',
    role: 'Freelancer · Córdoba',
    quote: 'Lo que más me sorprendió es que el contenido es 100% aplicable. Nada de teoría aburrida. Juano muestra exactamente cómo lo usa él.',
  },
  {
    initials: 'SR',
    name: 'Sofía Rodríguez',
    role: 'Social Media Manager · Buenos Aires',
    quote: 'Tenía miedo de que la IA me reemplazara. Después del curso entendí que es una herramienta que multiplica lo que ya sé hacer.',
  },
  {
    initials: 'AF',
    name: 'Agustín Ferreyra',
    role: 'Creador de contenido · Santa Fe',
    quote: 'La garantía me convenció de probarlo. Obvio que no la usé — el curso valió cada peso desde la primera lección.',
  },
]

function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(255,107,107,0.1))',
      border: '1px solid rgba(78,205,196,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
      color: 'var(--color-teal)',
    }}>
      {initials}
    </div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section style={{
      backgroundColor: 'var(--color-bg-deep)', padding: '130px 24px', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '72px' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px' }}>
            Lo que dicen los alumnos
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px',
            color: 'var(--color-text)', lineHeight: 1.05,
          }}>
            Resultados reales,<br />
            <span style={{ color: 'var(--color-coral)' }}>personas reales</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {testimonials.map(({ initials, name, role, quote }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setActive(i)}
              whileHover={{ y: -4 }}
              style={{
                padding: '28px 24px', borderRadius: '16px', cursor: 'pointer',
                background: active === i ? 'rgba(78,205,196,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active === i ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.05)'}`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Quote mark */}
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '48px', lineHeight: '0.8',
                color: active === i ? 'rgba(78,205,196,0.3)' : 'rgba(255,255,255,0.06)',
                marginBottom: '16px', transition: 'color 0.3s',
              }}>"</div>

              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8,
                color: active === i ? 'rgba(247,247,242,0.75)' : 'rgba(247,247,242,0.4)',
                marginBottom: '24px', transition: 'color 0.3s',
              }}>
                {quote}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar initials={initials} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', marginTop: '2px' }}>{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? '24px' : '8px', height: '8px',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: i === active ? 'var(--color-teal)' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
