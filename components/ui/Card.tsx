'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyle: React.CSSProperties = {
    backgroundColor: '#0F0F1A',
    border: '1px solid rgba(78,205,196,0.15)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    transition: hover ? 'transform 200ms ease, box-shadow 200ms ease' : undefined,
  }

  return (
    <div
      style={baseStyle}
      className={className}
      onMouseEnter={
        hover
          ? (e) => {
              const el = e.currentTarget
              el.style.transform = 'translateY(-4px)'
              el.style.boxShadow = '0 20px 40px rgba(255,107,107,0.15)'
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              const el = e.currentTarget
              el.style.transform = ''
              el.style.boxShadow = ''
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
