'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CourseData } from './page'

const curriculum = [
  {
    module: 'Módulo 1 — Por qué la IA cambia todo para un CM',
    lessons: ['Qué hace la IA que vos no podés hacer solo', 'Las 5 herramientas que uso todos los días', 'Tu nuevo flujo de trabajo con IA'],
  },
  {
    module: 'Módulo 2 — Generación de contenido con IA',
    lessons: ['Prompt engineering para redes sociales', 'Un mes de contenido en una tarde', 'Adaptar para IG, TikTok y LinkedIn sin esfuerzo'],
  },
  {
    module: 'Módulo 3 — Tu voz + IA',
    lessons: ['Cómo la IA suena como vos (no como un robot)', 'Revisar y pulir sin perder autenticidad', 'Casos reales con clientes míos'],
  },
  {
    module: 'Módulo 4 — Automatizaciones sin código',
    lessons: ['Zapier y Make para CMs', 'Reportes automáticos para clientes', 'Flujos que te liberan 5+ horas semanales'],
  },
  {
    module: 'Módulo 5 — Subir tus tarifas con IA como argumento',
    lessons: ['Cómo presentar IA a tus clientes', 'Tu propuesta de valor diferencial', 'Cobrar más por hacer mejor trabajo'],
  },
]

function CurriculumModule({ module, lessons, index }: { module: string; lessons: string[]; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div style={{
      border: '1px solid var(--en-border)',
      borderRadius: index === 0 ? '12px 12px 0 0' : index === curriculum.length - 1 ? '0 0 12px 12px' : '0',
      background: open ? 'color-mix(in srgb, var(--en-green) 4%, var(--en-surface))' : 'var(--en-surface)',
      marginTop: index > 0 ? '-1px' : '0',
      overflow: 'hidden',
      transition: 'background 0.2s',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', gap: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', color: open ? 'var(--en-green)' : 'var(--en-text-soft)', background: open ? 'var(--en-green-light)' : 'var(--en-border)', borderRadius: '4px', padding: '3px 8px', flexShrink: 0, letterSpacing: '0.5px' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: open ? 'var(--en-text)' : 'var(--en-text-soft)', textAlign: 'left', lineHeight: 1.4 }}>
            {module}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--en-text-faint)' }}>{lessons.length} lecciones</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--en-text-faint)' }}>
            <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--en-border)' }}>
          {lessons.map((lesson, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < lessons.length - 1 ? '1px solid var(--en-border)' : 'none' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="var(--en-green)" strokeWidth="1" opacity="0.4"/>
                <path d="M5.5 7L10 5V9L5.5 7Z" fill="var(--en-green)" opacity="0.7"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5 }}>{lesson}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CourseSalesPage({ course }: { course: CourseData }) {
  const [loadingArs, setLoadingArs] = useState(false)
  const [loadingUsd, setLoadingUsd] = useState(false)
  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0)

  const handleBuyArs = async () => {
    setLoadingArs(true)
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
    setLoadingArs(false)
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)' }}>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--en-border)', padding: '0 clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>← Todos los cursos</Link>
            <Link href="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', textDecoration: 'none', padding: '7px 16px', borderRadius: '8px', border: '1.5px solid var(--en-green)' }}>
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', padding: 'clamp(48px, 7vw, 80px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#fff', letterSpacing: '0.5px' }}>Por Juan Gallino</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4.5vw, 56px)', letterSpacing: '-2px', color: '#fff', lineHeight: 1.05, maxWidth: '800px', marginBottom: '16px' }}>
            {course.title}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '32px' }}>
            {course.subtitle}
          </p>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              `${curriculum.length} módulos`,
              `${totalLessons} lecciones`,
              'Acceso de por vida',
              'Certificado incluido',
            ].map((val, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '56px', alignItems: 'start' }}>

          {/* LEFT */}
          <div>

            {/* Qué vas a lograr */}
            <section style={{ marginBottom: '52px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 28px)', color: 'var(--en-text)', marginBottom: '20px', letterSpacing: '-0.8px' }}>
                Qué vas a lograr
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', padding: '24px', background: 'color-mix(in srgb, var(--en-green) 5%, var(--en-surface))', border: '1.5px solid color-mix(in srgb, var(--en-green) 15%, transparent)', borderRadius: '16px' }}>
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M2 8L6 12L14 4" stroke="var(--en-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Contenido del curso */}
            <section style={{ marginBottom: '52px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 28px)', color: 'var(--en-text)', letterSpacing: '-0.8px' }}>
                  Contenido del curso
                </h2>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
                  {curriculum.length} módulos · {totalLessons} lecciones
                </span>
              </div>
              <div>
                {curriculum.map((item, i) => (
                  <CurriculumModule key={i} index={i} {...item} />
                ))}
              </div>
            </section>

            {/* Para quién es */}
            <section style={{ marginBottom: '52px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 28px)', color: 'var(--en-text)', marginBottom: '20px', letterSpacing: '-0.8px' }}>
                Para quién es
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {course.forWho.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 20px', borderRadius: '12px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                    <span style={{ color: 'var(--en-coral)', fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>→</span>
                    <span style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '14px', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Sobre Juan */}
            <section style={{ padding: '28px', background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--en-green), var(--en-coral))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color: '#fff', fontStyle: 'italic' }}>JG</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--en-text-faint)', marginBottom: '4px' }}>EL INSTRUCTOR</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '8px' }}>Juan Gallino</div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.65 }}>
                    Diseñador de marcas con IA, basado en Rafaela, Santa Fe. Lo que enseño acá es el proceso exacto que uso con mis clientes reales — no teoría de libro.
                  </p>
                  <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>
                    Conocer más →
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Sticky price card */}
          <div style={{ position: 'sticky', top: '76px' }}>
            <div style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--en-shadow-lg)' }}>

              {/* Thumbnail */}
              <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>VISTA PREVIA</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '28px' }}>
                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '44px', color: 'var(--en-text)', letterSpacing: '-2px', lineHeight: 1, marginBottom: '4px' }}>
                    ${course.priceArs.toLocaleString('es-AR')}
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--en-text-soft)', letterSpacing: '-0.5px' }}> ARS</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
                    o USD {course.priceUsd} para pagos internacionales
                  </div>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <button
                    onClick={handleBuyArs}
                    disabled={loadingArs}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loadingArs ? 'wait' : 'pointer', background: 'var(--en-green)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', opacity: loadingArs ? 0.7 : 1, boxShadow: 'var(--en-shadow-green)' }}
                  >
                    {loadingArs ? 'Redirigiendo...' : 'Comprar ahora (ARS) →'}
                  </button>
                  <button
                    onClick={handleBuyUsd}
                    disabled={loadingUsd}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: loadingUsd ? 'wait' : 'pointer', background: 'transparent', border: '1.5px solid var(--en-border)', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', opacity: loadingUsd ? 0.7 : 1 }}
                  >
                    {loadingUsd ? 'Redirecting...' : 'Pay in USD'}
                  </button>
                </div>

                {/* Includes */}
                <div style={{ borderTop: '1px solid var(--en-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    `${curriculum.length} módulos · ${totalLessons} lecciones`,
                    'Acceso de por vida + actualizaciones',
                    'Certificado verificable en PDF',
                    'Garantía de 7 días sin preguntas',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="var(--en-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
                  Pago seguro · Si no aprendés algo útil en 7 días, te devolvemos el dinero.
                </p>
              </div>
            </div>

            {/* Plan upsell */}
            <div style={{ marginTop: '16px', padding: '20px', background: 'color-mix(in srgb, var(--en-coral) 6%, var(--en-surface))', border: '1.5px solid color-mix(in srgb, var(--en-coral) 15%, transparent)', borderRadius: '16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-coral)', marginBottom: '6px' }}>
                ¿Querés acceso a todos los cursos?
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5, marginBottom: '12px' }}>
                El plan Norte incluye este curso + todos los que se agreguen. Desde U$D 7/mes.
              </p>
              <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', color: 'var(--en-coral)', textDecoration: 'none' }}>
                Ver planes →
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
