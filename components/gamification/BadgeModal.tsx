'use client'

import { useState, useEffect } from 'react'

interface BadgeInfo {
  slug: string
  name: string
  emoji: string
  description: string
}

interface BadgeModalProps {
  badges: BadgeInfo[]
  xpEarned: number
  onClose: () => void
}

export default function BadgeModal({ badges, xpEarned, onClose }: BadgeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (badges.length === 0) return null

  const current = badges[currentIndex]
  const hasMore = currentIndex < badges.length - 1

  const handleNext = () => {
    if (hasMore) setCurrentIndex(i => i + 1)
    else onClose()
  }

  return (
    <div style={{
      position: 'fixed' as const, inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--en-surface)',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center' as const,
        boxShadow: 'var(--en-shadow-lg)',
        border: '1px solid var(--en-border)',
      }} onClick={e => e.stopPropagation()}>

        {badges.length > 1 && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {currentIndex + 1} de {badges.length}
          </div>
        )}

        <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '20px' }}>
          {current.emoji}
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '8px' }}>
          ¡Nuevo badge!
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: 'var(--en-text)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          {current.name}
        </h2>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.5, marginBottom: '24px' }}>
          {current.description}
        </p>

        {xpEarned > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--en-green-light)', marginBottom: '24px',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color: 'var(--en-green)' }}>
              +{xpEarned} XP
            </span>
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: 'var(--en-green)',
            color: 'var(--en-white)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {hasMore ? `Ver siguiente →` : '¡Genial!'}
        </button>
      </div>
    </div>
  )
}
