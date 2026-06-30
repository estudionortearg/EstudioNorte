interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: React.ReactNode
}

export default function MetricCard({ label, value, sub, color = 'var(--color-teal)', icon }: MetricCardProps) {
  return (
    <div style={{
      padding: '24px 28px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        background: `radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          color: 'rgba(247,247,242,0.3)',
        }}>{label}</p>
        {icon && <div style={{ color, opacity: 0.6 }}>{icon}</div>}
      </div>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-1.5px',
        color, lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.25)', marginTop: '8px' }}>{sub}</p>
      )}
    </div>
  )
}
