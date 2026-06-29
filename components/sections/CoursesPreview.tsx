'use client'

import { motion } from 'framer-motion'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

export default function CoursesPreview() {
  return (
    <section style={{ backgroundColor: 'var(--color-bg-section)', padding: '96px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <motion.h2
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '40px',
            letterSpacing: '-1px',
            color: 'var(--color-text)',
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Lo que podés aprender
        </motion.h2>

        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          style={{ maxWidth: '400px', margin: '0 auto' }}
        >
          <Card hover>
            <div
              style={{
                position: 'relative',
                height: '200px',
                margin: '-24px -24px 24px',
                background: 'linear-gradient(135deg, #1A1A2E 0%, #0A0A14 100%)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Logo size="lg" />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <Badge>IA Práctica</Badge>
                <Badge variant="coral">Nuevo</Badge>
              </div>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '22px',
                color: 'var(--color-text)',
                marginBottom: '12px',
                lineHeight: 1.3,
              }}
            >
              IA para Community Managers que quieren trabajar distinto
            </h3>

            <p
              style={{
                color: 'rgba(247,247,242,0.5)',
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: 1.6,
              }}
            >
              Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '28px',
                  color: 'var(--color-coral)',
                }}
              >
                $25.000 ARS
              </span>
              <Button href="/cursos/ia-para-community-managers" variant="secondary" size="sm">
                Ver curso
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
