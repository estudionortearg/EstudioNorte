'use client'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Logo from '@/components/ui/Logo'
import { useState } from 'react'
import { CourseData } from './page'

export default function CourseSalesPage({ course }: { course: CourseData }) {
  const [loading, setLoading] = useState(false)
  const [loadingUsd, setLoadingUsd] = useState(false)

  const handleBuyArs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          courseTitle: course.title,
          priceArs: course.priceArs,
        }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert('Error al iniciar el pago. Intentá de nuevo.')
      }
    } catch {
      alert('Error al iniciar el pago. Intentá de nuevo.')
    }
    setLoading(false)
  }
  const handleBuyUsd = async () => {
    setLoadingUsd(true)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          courseTitle: course.title,
          priceUsd: course.priceUsd,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al iniciar el pago. Intentá de nuevo.')
      }
    } catch {
      alert('Error al iniciar el pago. Intentá de nuevo.')
    }
    setLoadingUsd(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'start' }}>

        {/* Left: Course details */}
        <div>
          {/* Badge */}
          <div style={{ marginBottom: '20px' }}>
            <Badge>{course.badge}</Badge>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1px', color: 'var(--color-text)', lineHeight: 1.2, marginBottom: '20px' }}>
            {course.title}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: '48px' }}>
            {course.subtitle}
          </p>

          {/* What you'll learn */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--color-text)', marginBottom: '24px' }}>
              Qué vas a aprender
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {course.whatYouLearn.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-teal)', fontSize: '18px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                  <span style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For who */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--color-text)', marginBottom: '24px' }}>
              Para quién es
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {course.forWho.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-coral)', fontSize: '18px', marginTop: '2px', flexShrink: 0 }}>→</span>
                  <span style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Sticky price card */}
        <div style={{ position: 'sticky', top: '96px' }}>
          <Card>
            {/* Thumbnail */}
            <div style={{ height: '160px', background: 'linear-gradient(135deg, #1A1A2E 0%, #0A0A14 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Logo size="lg" />
            </div>

            {/* Price */}
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '40px', color: 'var(--color-coral)', marginBottom: '4px' }}>
              ${course.priceArs.toLocaleString('es-AR')} ARS
            </p>
            <p style={{ color: 'var(--color-text-faint)', fontSize: '13px', marginBottom: '24px' }}>
              o USD {course.priceUsd} para pagos internacionales
            </p>

            {/* Buy buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button variant="primary" onClick={handleBuyArs} disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Redirigiendo...' : 'Comprar ahora (ARS)'}
              </Button>
              <Button variant="secondary" onClick={handleBuyUsd} disabled={loadingUsd} style={{ width: '100%' }}>
                {loadingUsd ? 'Redirecting...' : 'Pay in USD ($25)'}
              </Button>
            </div>

            {/* Guarantee note */}
            <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
              Garantía de 7 días. Si no aprendés algo aplicable, te devolvemos el dinero.
            </p>
          </Card>
        </div>

      </div>
    </div>
  )
}
