'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Badge from '@/components/ui/Badge'

interface CourseCardProps {
  slug: string
  title: string
  subtitle: string
  priceArs: number
  priceUsd?: number
  badges?: string[]
  isFeatured?: boolean
}

export default function CourseCard({
  slug,
  title,
  subtitle,
  priceArs,
  badges,
}: CourseCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/cursos/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-mid)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 40px rgba(255,107,107,0.15)' : 'none',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: '220px',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0A0A14 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Logo size="lg" />
          {/* Coral gradient overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, transparent 60%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 200ms ease'
          }} />
          {/* Small Logo isotipo top-right corner */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.4 }}>
            <Logo size="sm" />
          </div>
          {/* Badges top-left */}
          {badges && badges.length > 0 && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {badges.map(b => <Badge key={b}>{b}</Badge>)}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '22px',
            color: 'var(--color-text)',
            lineHeight: 1.3,
            marginBottom: '10px'
          }}>{title}</h3>

          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: '20px'
          }}>{subtitle}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '26px',
              color: 'var(--color-coral)'
            }}>
              ${priceArs.toLocaleString('es-AR')} ARS
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-teal)',
              border: '1px solid rgba(78,205,196,0.4)',
              padding: '6px 14px',
              borderRadius: '20px'
            }}>
              Ver curso →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
