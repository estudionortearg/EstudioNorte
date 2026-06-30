'use client'

import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  children: ReactNode
  className?: string
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#FF6B6B',
    color: '#ffffff',
    fontWeight: 500,
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: '#4ECDC4',
    border: '1px solid #4ECDC4',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'rgba(247,247,242,0.5)',
    border: 'none',
  },
}

const baseClass =
  'inline-flex items-center justify-center rounded-lg font-[Inter] cursor-pointer transition-all duration-200 ease-in-out select-none'

function ButtonInner({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  style,
  ...props
}: Omit<ButtonProps, 'href'>) {
  const varStyle = variantStyles[variant]
  return (
    <button
      style={{ ...varStyle, ...style }}
      className={`${baseClass} ${sizeStyles[size]} ${className}`}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        if (variant === 'primary') {
          el.style.transform = 'scale(1.02)'
          el.style.boxShadow = '0 8px 24px rgba(255,107,107,0.35)'
        } else if (variant === 'secondary') {
          el.style.backgroundColor = 'rgba(78,205,196,0.08)'
        } else if (variant === 'ghost') {
          el.style.color = '#F7F7F2'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = ''
        if (variant === 'primary') {
          // reset handled by inline style
        } else if (variant === 'secondary') {
          el.style.backgroundColor = 'transparent'
        } else if (variant === 'ghost') {
          el.style.color = 'rgba(247,247,242,0.5)'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default function Button({ href, ...props }: ButtonProps) {
  if (href) {
    const { variant = 'primary', size = 'md', className = '', children, style } = props
    const varStyle = variantStyles[variant]
    return (
      <Link
        href={href}
        style={{ ...varStyle, ...style }}
        className={`${baseClass} ${sizeStyles[size]} ${className}`}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement
          if (variant === 'primary') {
            el.style.transform = 'scale(1.02)'
            el.style.boxShadow = '0 8px 24px rgba(255,107,107,0.35)'
          } else if (variant === 'secondary') {
            el.style.backgroundColor = 'rgba(78,205,196,0.08)'
          } else if (variant === 'ghost') {
            el.style.color = '#F7F7F2'
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.transform = ''
          el.style.boxShadow = ''
          if (variant === 'secondary') {
            el.style.backgroundColor = 'transparent'
          } else if (variant === 'ghost') {
            el.style.color = 'rgba(247,247,242,0.5)'
          }
        }}
      >
        {children}
      </Link>
    )
  }
  return <ButtonInner {...props} />
}
