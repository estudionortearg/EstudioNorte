'use client'

import Link from 'next/link'

interface Props {
  label: string
  sublabel?: string
  value: number        // 0–100
  href?: string
  isComplete?: boolean
  height?: number      // px, default 5
}

export default function ProgressBar({ label, sublabel, value, href, isComplete, height = 5 }: Props) {
  const barColor = isComplete || value === 100
    ? 'var(--en-green)'
    : value > 0
    ? 'var(--en-coral)'
    : 'var(--en-border)'

  const pct = Math.min(100, Math.max(0, value))
  const label$ = value === 100 ? 'var(--en-green)' : 'var(--en-text-soft)'

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: value > 0 ? 600 : 400,
            color: 'var(--en-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'block',
          }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '1px', display: 'block' }}>
              {sublabel}
            </span>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
          color: label$, flexShrink: 0,
        }}>
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div style={{ height: `${height}px`, borderRadius: `${height}px`, background: 'var(--en-track-bg)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: `${height}px`,
          background: barColor,
          width: `${pct}%`,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    )
  }
  return inner
}
