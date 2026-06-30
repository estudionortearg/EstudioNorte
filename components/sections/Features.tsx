'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 14L14 4L24 14L14 24L4 14Z" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="3" fill="currentColor"/>
      </svg>
    ),
    title: 'Contenido aplicable',
    desc: 'Cada lección resuelve un problema real que enfrentás en tu trabajo. Nada de teoría vacía.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="16" y="4" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="4" y="16" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="16" y="16" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Ritmo a tu medida',
    desc: 'Avanzás cuando y como querés. Acceso de por vida al contenido desde cualquier dispositivo.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L17.5 10.5L25 11.5L19.5 17L21 24.5L14 21L7 24.5L8.5 17L3 11.5L10.5 10.5L14 4Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Certificado verificable',
    desc: 'Al completar el curso recibís un certificado PDF descargable para compartir en LinkedIn.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 8V14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Actualización continua',
    desc: 'El mundo de la IA cambia rápido. El contenido se actualiza para que no te quedes atrás.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20L10 14L14 18L20 10L24 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="20" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="14" r="1.5" fill="currentColor"/>
      </svg>
    ),
    title: 'Resultados medibles',
    desc: 'Herramientas y flujos de trabajo concretos que podés implementar desde el primer día.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C8.48 4 4 8.48 4 14C4 19.52 8.48 24 14 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 4C19.52 4 24 8.48 24 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
        <path d="M20 18L24 22M24 18L20 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Garantía 7 días',
    desc: 'Si no te sirve, te devolvemos el dinero. Sin preguntas, sin formularios largos.',
  },
]

export default function Features() {
  return (
    <section style={{
      backgroundColor: 'var(--color-bg-section)',
      padding: '130px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.15), transparent)',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px',
            textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px',
          }}>Por qué Estudio Norte</p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(34px, 5vw, 54px)', letterSpacing: '-2px',
            color: 'var(--color-text)', lineHeight: 1.05,
          }}>
            Todo lo que necesitás<br />
            <span style={{ color: 'var(--color-teal)' }}>en un solo lugar</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2px',
        }}>
          {features.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ backgroundColor: 'rgba(78,205,196,0.04)' }}
              style={{
                padding: '36px 32px',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: i === 0 ? '16px 0 0 0' : i === 2 ? '0 16px 0 0' : i === 3 ? '0 0 0 16px' : i === 5 ? '0 0 16px 0' : '0',
                transition: 'background 0.3s ease',
              }}
            >
              <div style={{ color: 'var(--color-teal)', marginBottom: '20px' }}>{icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px',
                color: 'var(--color-text)', marginBottom: '10px', letterSpacing: '-0.3px',
              }}>{title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'rgba(247,247,242,0.45)', lineHeight: 1.75,
              }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
