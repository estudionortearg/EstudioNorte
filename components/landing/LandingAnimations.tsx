'use client'

import { useEffect, useRef, useState } from 'react'

export function LandingAnimations() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            style={{
              background: 'var(--en-surface)',
              border: `1.5px solid ${isOpen ? 'var(--en-green)' : 'var(--en-border)'}`,
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
                color: 'var(--en-text)', letterSpacing: '-0.2px',
              }}
            >
              <span>{item.q}</span>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={isOpen ? 'var(--en-green)' : 'var(--en-text-soft)'} strokeWidth="2.2"
                style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease, stroke 0.2s ease' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div style={{
              maxHeight: isOpen ? '400px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(.22,.68,0,1.2)',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.7,
                color: 'var(--en-text-soft)', padding: '0 24px 20px',
              }}>
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
