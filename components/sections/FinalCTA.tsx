'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function FinalCTA() {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-bg-deep)',
        padding: '120px 24px',
        textAlign: 'center',
      }}
    >
      <motion.h2
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '48px',
          fontStyle: 'italic',
          letterSpacing: '-1px',
          color: 'var(--color-text)',
          marginBottom: '32px',
        }}
      >
        Más allá de lo que creías posible
      </motion.h2>
      <Button href="/cursos" variant="primary">Ver cursos</Button>
    </section>
  )
}
