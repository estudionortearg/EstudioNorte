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
          backgroundColor: 'var(--en-surface)',
          border: '1px solid var(--en-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? 'var(--en-shadow-green)' : 'var(--en-shadow-sm)',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          {/* White overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.08)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 200ms ease'
          }} />
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
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--en-text)',
            lineHeight: 1.3,
            marginBottom: '8px',
            letterSpacing: '-0.3px',
          }}>{title}</h3>

          <p style={{
            fontSize: '14px',
            color: 'var(--en-text-soft)',
            lineHeight: 1.6,
            marginBottom: '20px'
          }}>{subtitle}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '22px',
              color: 'var(--en-text)',
              letterSpacing: '-0.5px',
            }}>
              ${priceArs.toLocaleString('es-AR')} ARS
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--en-green)',
              background: 'var(--en-green-light)',
              padding: '6px 14px',
              borderRadius: '20px',
            }}>
              Ver curso →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
