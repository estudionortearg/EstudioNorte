'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

const categories = ['Todos', 'IA', 'Marketing', 'Próximamente']

const courses = [
  {
    slug: 'ia-para-community-managers',
    category: 'IA',
    tag: 'Nuevo',
    tagColor: 'var(--color-coral)',
    title: 'IA para Community Managers',
    desc: 'Inteligencia artificial aplicada a tu trabajo diario como CM. Sin relleno.',
    modules: 5,
    lessons: 15,
    price: '$25.000',
    available: true,
  },
  {
    slug: null,
    category: 'Marketing',
    tag: 'Próximamente',
    tagColor: 'rgba(247,247,242,0.3)',
    title: 'Marketing de contenidos sin presupuesto',
    desc: 'Estrategia, producción y distribución de contenido para marcas pequeñas.',
    modules: null,
    lessons: null,
    price: null,
    available: false,
  },
  {
    slug: null,
    category: 'IA',
    tag: 'Próximamente',
    tagColor: 'rgba(247,247,242,0.3)',
    title: 'Automatizaciones para freelancers',
    desc: 'Flujos que liberan 10+ horas semanales sin saber programar.',
    modules: null,
    lessons: null,
    price: null,
    available: false,
  },
]

function CourseCard({ course, index }: { course: typeof courses[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '20px', overflow: 'hidden',
        border: `1px solid ${hovered && course.available ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.06)'}`,
        background: course.available ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: hovered && course.available ? '0 20px 60px rgba(0,0,0,0.4)' : 'none',
        display: 'flex', flexDirection: 'column',
        opacity: course.available ? 1 : 0.55,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: '160px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A0A14 0%, #0D1520 100%)',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }).map((_, i) => <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="160" stroke="white" strokeWidth="1"/>)}
          {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="white" strokeWidth="1"/>)}
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '160px', height: '160px', borderRadius: '50%',
          background: `radial-gradient(circle, ${course.category === 'IA' ? 'rgba(78,205,196,0.12)' : 'rgba(255,107,107,0.08)'} 0%, transparent 70%)`,
        }}/>
        {/* Category + tag badges */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '100px', fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
            color: course.category === 'IA' ? 'var(--color-teal)' : 'rgba(247,247,242,0.5)',
          }}>
            {course.category}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: '100px', fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
            background: 'rgba(0,0,0,0.5)', border: `1px solid ${course.tagColor}33`,
            color: course.tagColor,
          }}>
            {course.tag}
          </span>
        </div>
        {/* Gradient line bottom */}
        {course.available && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--color-teal), var(--color-coral))' }}/>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px',
          color: 'var(--color-text)', lineHeight: 1.3, letterSpacing: '-0.3px',
          marginBottom: '10px',
        }}>
          {course.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          color: 'rgba(247,247,242,0.4)', lineHeight: 1.7, marginBottom: '20px', flex: 1,
        }}>
          {course.desc}
        </p>

        {course.available ? (
          <>
            <div style={{
              display: 'flex', gap: '0', marginBottom: '20px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '12px 0',
            }}>
              {[[`${course.modules}`, 'Módulos'], [`${course.lessons}+`, 'Lecciones'], ['7d', 'Garantía']].map(([v, l], i) => (
                <div key={l} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.5px' }}>{v}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'rgba(247,247,242,0.25)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', color: 'var(--color-coral)', letterSpacing: '-1px' }}>
                {course.price} <span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,107,107,0.5)' }}>ARS</span>
              </span>
              <Button href={`/cursos/${course.slug}`} variant="primary" size="sm">Ver curso →</Button>
            </div>
          </>
        ) : (
          <div style={{
            marginTop: 'auto', padding: '12px 16px', borderRadius: '10px',
            border: '1px dashed rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(247,247,242,0.2)', flexShrink: 0 }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', letterSpacing: '0.5px' }}>
              Disponible próximamente
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function CoursesPreview() {
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = activeCategory === 'Todos'
    ? courses
    : activeCategory === 'Próximamente'
      ? courses.filter(c => !c.available)
      : courses.filter(c => c.category === activeCategory)

  return (
    <section style={{ backgroundColor: 'var(--color-bg-deep)', padding: '130px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.2), transparent)' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ marginBottom: '56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px' }}>
              Catálogo de cursos
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-2px',
              color: 'var(--color-text)', lineHeight: 1.0,
            }}>
              Elegí tu<br />
              <span style={{ color: 'var(--color-teal)' }}>próximo nivel</span>
            </h2>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 18px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.5px',
                  background: activeCategory === cat ? 'var(--color-teal)' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat ? '#0A0A14' : 'rgba(247,247,242,0.4)',
                  fontWeight: activeCategory === cat ? 700 : 400,
                  transition: 'all 0.2s ease',
                  outline: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '48px',
            }}
          >
            {filtered.map((course, i) => (
              <CourseCard key={course.title} course={course} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.015)',
            flexWrap: 'wrap', gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-teal)', boxShadow: '0 0 10px rgba(78,205,196,0.5)' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)' }}>
              Nuevos cursos en camino — suscribite para ser el primero en enterarte
            </span>
          </div>
          <Button href="/cursos" variant="secondary" size="sm">Ver catálogo completo →</Button>
        </motion.div>
      </div>
    </section>
  )
}
