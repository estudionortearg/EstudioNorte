import { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function GlassCard({ children, style, className }: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--en-surface-2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--en-border)',
        boxShadow: 'var(--en-shadow)',
        borderRadius: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
