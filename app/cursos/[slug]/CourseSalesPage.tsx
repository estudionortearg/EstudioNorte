'use client'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CourseData } from './page'

const curriculum = [
  {
    module: 'Módulo 1 — Fundamentos de IA para CM',
    lessons: ['Qué es la IA y por qué cambia tu trabajo', 'Las mejores herramientas (2024)', 'Tu flujo de trabajo nuevo'],
  },
  {
    module: 'Módulo 2 — Generación de contenido',
    lessons: ['Prompt engineering para redes sociales', 'Calendarios de contenido automáticos', 'Adaptación por plataforma: IG, TikTok, LinkedIn'],
  },
  {
    module: 'Módulo 3 — Tu voz + IA',
    lessons: ['Cómo entrenar a la IA con tu estilo', 'Revisar y pulir sin perder autenticidad', 'Casos reales con clientes'],
  },
  {
    module: 'Módulo 4 — Automatizaciones',
    lessons: ['Automatizar sin código: Zapier y Make', 'Reportes automáticos para clientes', 'Flujos que liberan 5+ horas semanales'],
  },
  {
    module: 'Módulo 5 — Escalar y vender',
    lessons: ['Presentar IA a tus clientes', 'Subir tus tarifas con IA como argumento', 'Tu propuesta de valor diferencial'],
  },
]

function CurriculumModule({ module, lessons, index }: { module: string; lessons: string[]; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: index === 0 ? '12px 12px 0 0' : index === curriculum.length - 1 ? '0 0 12px 12px' : '0',
      overflow: 'hidden',
      background: open ? 'rgba(78,205,196,0.03)' : 'rgba(255,255,255,0.015)',
      transition: 'background 0.3s',
      marginTop: index > 0 ? '-1px' : '0',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
            color: 'var(--color-teal)', letterSpacing: '1px',
            background: 'rgba(78,205,196,0.1)', borderRadius: '4px',
            padding: '3px 8px', flexShrink: 0,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px',
            color: open ? 'var(--color-text)' : 'rgba(247,247,242,0.65)',
            textAlign: 'left', lineHeight: 1.4,
          }}>{module}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'rgba(247,247,242,0.3)' }}>{lessons.length} lecciones</span>
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ color: 'rgba(247,247,242,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {lessons.map((lesson, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 0',
                  borderBottom: i < lessons.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6" stroke="rgba(78,205,196,0.3)" strokeWidth="1"/>
                    <path d="M5.5 7L10 5V9L5.5 7Z" fill="rgba(78,205,196,0.5)"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.5)', lineHeight: 1.5 }}>
                    {lesson}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CourseSalesPage({ course }: { course: CourseData }) {
  const [loading, setLoading] = useState(false)
  const [loadingUsd, setLoadingUsd] = useState(false)

  const handleBuyArs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, courseTitle: course.title, priceArs: course.priceArs }),
      })
      const data = await res.json()
      if (data.init_point) window.location.href = data.init_point
      else alert('Error al iniciar el pago. Intentá de nuevo.')
    } catch { alert('Error al iniciar el pago. Intentá de nuevo.') }
    setLoading(false)
  }

  const handleBuyUsd = async () => {
    setLoadingUsd(true)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, courseTitle: course.title, priceUsd: course.priceUsd }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error al iniciar el pago. Intentá de nuevo.')
    } catch { alert('Error al iniciar el pago. Intentá de nuevo.') }
    setLoadingUsd(false)
  }

  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', paddingTop: '80px' }}>

      {/* Course hero banner */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(78,205,196,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '64px 24px 56px',
        marginBottom: '0',
      }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <Badge>{course.badge}</Badge>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-2px',
            color: 'var(--color-text)', lineHeight: 1.1,
            maxWidth: '800px', marginBottom: '20px',
          }}>
            {course.title}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(247,247,242,0.5)', lineHeight: 1.7, maxWidth: '680px', marginBottom: '32px' }}>
            {course.subtitle}
          </p>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              [`${curriculum.length} módulos`, 'Módulos'],
              [`${totalLessons} lecciones`, 'Lecciones'],
              ['Acceso de por vida', ''],
              ['Certificado incluido', ''],
            ].map(([val], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.5)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'start' }}>

          {/* Left: Details */}
          <div>
            {/* What you'll learn */}
            <div style={{ marginBottom: '56px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px',
                color: 'var(--color-text)', marginBottom: '24px', letterSpacing: '-0.5px',
              }}>
                Qué vas a aprender
              </h2>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px', padding: '24px',
                background: 'rgba(78,205,196,0.03)',
                border: '1px solid rgba(78,205,196,0.1)',
                borderRadius: '16px',
              }}>
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M2 8L6 12L14 4" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(247,247,242,0.6)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div style={{ marginBottom: '56px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px',
                  color: 'var(--color-text)', letterSpacing: '-0.5px',
                }}>
                  Contenido del curso
                </h2>
                <span style={{ fontSize: '13px', color: 'rgba(247,247,242,0.3)' }}>
                  {curriculum.length} módulos · {totalLessons} lecciones
                </span>
              </div>
              <div>
                {curriculum.map((item, i) => (
                  <CurriculumModule key={i} index={i} {...item} />
                ))}
              </div>
            </div>

            {/* For who */}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px',
                color: 'var(--color-text)', marginBottom: '20px', letterSpacing: '-0.5px',
              }}>
                Para quién es
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {course.forWho.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    padding: '16px 20px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: 'var(--color-coral)', fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>→</span>
                    <span style={{ color: 'rgba(247,247,242,0.6)', fontSize: '14px', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky price card */}
          <div style={{ position: 'sticky', top: '96px' }}>
            <div style={{
              borderRadius: '20px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
            }}>
              {/* Preview thumbnail */}
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #0A0A14 0%, #0D1520 50%, #0A0A14 100%)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Grid bg */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="200" stroke="white" strokeWidth="1"/>
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 44} x2="400" y2={i * 44} stroke="white" strokeWidth="1"/>
                  ))}
                </svg>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(78,205,196,0.15)',
                  border: '1px solid rgba(78,205,196,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M8 5L17 11L8 17V5Z" fill="var(--color-teal)"/>
                  </svg>
                </div>
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '4px 10px', borderRadius: '20px',
                  background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)',
                  fontSize: '11px', fontWeight: 600, color: 'var(--color-coral)', letterSpacing: '0.5px',
                }}>
                  PREVIEW
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '28px 28px 24px' }}>
                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: '44px', color: 'var(--color-coral)',
                    letterSpacing: '-2px', lineHeight: 1,
                    marginBottom: '4px',
                  }}>
                    ${course.priceArs.toLocaleString('es-AR')}
                    <span style={{ fontSize: '18px', letterSpacing: '-0.5px', color: 'rgba(255,107,107,0.7)', fontWeight: 700 }}> ARS</span>
                  </p>
                  <p style={{ color: 'rgba(247,247,242,0.3)', fontSize: '13px' }}>
                    o USD {course.priceUsd} para pagos internacionales
                  </p>
                </div>

                {/* Buy buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <Button variant="primary" onClick={handleBuyArs} disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Redirigiendo...' : 'Comprar ahora (ARS)'}
                  </Button>
                  <Button variant="secondary" onClick={handleBuyUsd} disabled={loadingUsd} style={{ width: '100%' }}>
                    {loadingUsd ? 'Redirecting...' : 'Pay in USD'}
                  </Button>
                </div>

                {/* Includes list */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  {[
                    `${curriculum.length} módulos · ${totalLessons} lecciones`,
                    'Acceso de por vida + actualizaciones',
                    'Certificado verificable en PDF',
                    'Garantía de 7 días sin preguntas',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: 'rgba(247,247,242,0.5)' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <p style={{
                  fontSize: '12px', color: 'rgba(247,247,242,0.2)',
                  textAlign: 'center', marginTop: '16px', lineHeight: 1.6,
                }}>
                  Pago seguro · Si no aprendés algo aplicable en 7 días, te devolvemos el dinero.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
