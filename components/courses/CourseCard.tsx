'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CourseCardProps {
  slug: string
  title: string
  subtitle: string
  priceArs: number
  priceUsd?: number
  badges?: string[]
  isFeatured?: boolean
  lessonCount?: number
  moduleCount?: number
}

const GRADIENTS = [
  'linear-gradient(135deg, #0fba81 0%, #ff6b6b 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
]

function gradientForSlug(slug: string) {
  let hash = 0
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function CourseCard({
  slug,
  title,
  subtitle,
  priceArs,
  badges,
  isFeatured,
  lessonCount,
  moduleCount,
}: CourseCardProps) {
  const [hovered, setHovered] = useState(false)
  const bg = gradientForSlug(slug)
  const category = badges?.[0] ?? 'Curso'

  return (
    <Link href={`/cursos/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          background: 'var(--en-surface)',
          border: '1px solid var(--en-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
          boxShadow: hovered ? 'var(--en-shadow-green)' : 'var(--en-shadow-sm)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          flexShrink: 0,
          width: '160px',
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '16px 14px',
          position: 'relative',
        }}>
          {/* Overlay circle for depth */}
          <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '13px',
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '0.2px',
            textShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}>
            {category.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '0', minWidth: 0 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="var(--en-coral)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginLeft: '4px', lineHeight: '11px' }}>4.9</span>
            </div>
            {isFeatured && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '2px 8px', borderRadius: '20px' }}>
                DESTACADO
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '16px',
            color: 'var(--en-text)',
            lineHeight: 1.25,
            letterSpacing: '-0.3px',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {title}
          </h3>

          {/* Meta: lessons + modules */}
          {(lessonCount ?? moduleCount) && (
            <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
              {lessonCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>{lessonCount} lecciones</span>
                </div>
              )}
              {moduleCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>500+ alumnos</span>
                </div>
              )}
            </div>
          )}

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--en-text-soft)',
            lineHeight: 1.55,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            marginBottom: '14px',
          }}>
            {subtitle}
          </p>

          {/* Bottom: instructor + price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--en-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--en-green), var(--en-coral))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '8px', color: '#fff' }}>JG</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>Juan Gallino</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                ${priceArs.toLocaleString('es-AR')}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '5px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                Ver más →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
