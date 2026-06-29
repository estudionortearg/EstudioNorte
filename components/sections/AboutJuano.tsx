'use client'

import { motion } from 'framer-motion'

export default function AboutJuano() {
  return (
    <section style={{ backgroundColor: 'var(--color-bg-deep)', padding: '96px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <motion.p
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--color-teal)',
            marginBottom: '24px',
          }}
        >
          Sobre el instructor
        </motion.p>

        <motion.h2
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '36px',
            letterSpacing: '-1px',
            color: 'var(--color-text)',
            marginBottom: '32px',
          }}
        >
          Juan Gallino
        </motion.h2>

        <motion.p
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            lineHeight: 1.75,
            color: 'rgba(247,247,242,0.7)',
          }}
        >
          Soy Juan Gallino, community manager en Rafaela, Santa Fe. Manejo cuentas reales, resuelvo problemas reales, y uso IA todos los días en mi trabajo. Lo que enseño acá no lo saqué de un libro — lo saqué de haberlo hecho.
        </motion.p>
      </div>
    </section>
  )
}
