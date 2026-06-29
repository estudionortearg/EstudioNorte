import { ReactNode } from 'react'

type BadgeVariant = 'teal' | 'coral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  teal: {
    border: '1px solid rgba(78,205,196,0.4)',
    color: '#4ECDC4',
    backgroundColor: 'rgba(78,205,196,0.08)',
  },
  coral: {
    border: '1px solid rgba(255,107,107,0.4)',
    color: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
}

export default function Badge({ children, variant = 'teal', className = '' }: BadgeProps) {
  return (
    <span
      style={variantStyles[variant]}
      className={`inline-flex items-center px-3 py-1 rounded-full font-[Inter] font-medium uppercase tracking-[2px] text-[10px] ${className}`}
    >
      {children}
    </span>
  )
}
