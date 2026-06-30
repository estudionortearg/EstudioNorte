'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1600
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(ease * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, to])

  return <span ref={ref}>{val.toLocaleString('es-AR')}{suffix}</span>
}

const stats = [
  { to: 1200, suffix: '+', label: 'Alumnos activos' },
  { to: 40, suffix: '+', label: 'Horas de contenido' },
  { to: 98, suffix: '%', label: 'Tasa de satisfacción' },
  { to: 7, suffix: 'd', label: 'Días de garantía' },
]

export default function StatsBar() {
  return (
    <section style={{
      backgroundColor: 'var(--color-bg-section)',
      borderTop: 'none',
      borderBottom: 'none',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0',
        }}>
          {stats.map(({ to, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4vw, 52px)',
                fontWeight: 900,
                letterSpacing: '-2px',
                color: 'var(--color-teal)',
                lineHeight: 1,
                marginBottom: '8px',
              }}>
                <CountUp to={to} suffix={suffix} />
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'rgba(247,247,242,0.35)',
              }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
