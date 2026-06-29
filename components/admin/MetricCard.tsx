interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
}

export default function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border-mid)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '36px', color: 'var(--color-text)', marginBottom: sublabel ? '4px' : '0' }}>
        {value}
      </p>
      {sublabel && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-faint)' }}>{sublabel}</p>
      )}
    </div>
  )
}
