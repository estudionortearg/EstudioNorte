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
  thumbnailUrl?: string | null
}

// DS V3-compliant gradients using only var(--en-*) tokens
const GRADIENTS = [
  'linear-gradient(135deg, var(--en-green) 0%, color-mix(in srgb, var(--en-green) 45%, var(--en-coral)) 100%)',
  'linear-gradient(135deg, var(--en-coral) 0%, color-mix(in srgb, var(--en-coral) 50%, var(--en-green)) 100%)',
  'linear-gradient(135deg, color-mix(in srgb, var(--en-green) 70%, var(--en-coral)) 0%, var(--en-green) 100%)',
  'linear-gradient(160deg, var(--en-coral) 0%, color-mix(in srgb, var(--en-green) 60%, var(--en-coral)) 100%)',
  'linear-gradient(135deg, color-mix(in srgb, var(--en-coral) 65%, var(--en-green)) 0%, var(--en-coral) 100%)',
]

function gradientForSlug(slug: string) {
  let hash = 0
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

// Course icon in the thumbnail — brand mark
function CourseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
      <line x1="9" y1="15" x2="12" y2="15"/>
    </svg>
  )
}

export default function CourseCard({
  slug,
  title,
  subtitle,
  priceArs,
  badges,
  isFeatured,
  lessonCount,
  thumbnailUrl,
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
          background: 'var(--en-surface)',
          border: '1px solid var(--en-border)',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
          boxShadow: hovered ? 'var(--en-shadow-green)' : 'var(--en-shadow-sm)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          height: '100%',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          background: thumbnailUrl ? 'var(--en-border)' : bg,
          height: '188px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {thumbnailUrl ? (
            /* Actual course image */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            /* Gradient fallback with decorative elements */
            <>
              <div style={{ position: 'absolute', top: '-32px', right: '-32px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>
              <div style={{
                width: '72px', height: '72px', borderRadius: '18px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CourseIcon />
              </div>
            </>
          )}

          {/* Category badge — bottom left */}
          <div style={{
            position: 'absolute', bottom: '14px', left: '14px',
            background: thumbnailUrl ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(6px)',
            border: thumbnailUrl ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
            color: '#fff', letterSpacing: '0.3px',
          }}>
            {category}
          </div>

          {/* Featured badge — top right */}
          {isFeatured && (
            <div style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '20px', padding: '3px 10px',
              fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
              color: 'var(--en-green)', letterSpacing: '0.4px',
            }}>
              DESTACADO
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Rating row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="var(--en-coral)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginLeft: '5px' }}>
                4.9 <span style={{ color: 'var(--en-text-faint)' }}>(15 reseñas)</span>
              </span>
            </div>
            {/* Bookmark icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="1.8">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '16px',
            color: 'var(--en-text)',
            lineHeight: 1.3,
            letterSpacing: '-0.3px',
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {title}
          </h3>

          {/* Meta: lessons + students */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>
                {lessonCount ? `${lessonCount} lecciones` : '12 Lecciones'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>500+ Alumnos</span>
            </div>
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--en-text-soft)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            flex: 1,
          }}>
            {subtitle}
          </p>

          {/* Instructor row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--en-border)' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--en-green), color-mix(in srgb, var(--en-green) 50%, var(--en-coral)))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '9px', color: '#fff' }}>JG</span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
              Por <strong style={{ color: 'var(--en-text)', fontWeight: 600 }}>Juan Gallino</strong>{' '}
              en <span style={{ color: 'var(--en-green)', fontWeight: 600 }}>{badges?.[0] ?? 'Diseño'}</span>
            </span>
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                ${priceArs.toLocaleString('es-AR')}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
              color: 'var(--en-green)',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              Ver más <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
