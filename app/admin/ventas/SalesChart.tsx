'use client'

interface MonthData {
  month: string
  ars: number
  usd: number
}

export default function SalesChart({ data }: { data: MonthData[] }) {
  if (!data.length) return null

  const maxArs = Math.max(...data.map(d => d.ars), 1)
  const BAR_HEIGHT = 120

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px', marginBottom: '20px' }}>
        Ingresos por mes
      </h2>
      <div style={{
        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)', padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {data.map((d, i) => {
            const arsH = Math.round((d.ars / maxArs) * BAR_HEIGHT)
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '56px', flex: 1 }}>
                {/* Tooltip value */}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: 'var(--color-coral)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  {d.ars > 0 ? `$${d.ars >= 1000 ? (d.ars / 1000).toFixed(0) + 'k' : d.ars}` : ''}
                </span>
                {/* Bar */}
                <div style={{ width: '100%', height: `${BAR_HEIGHT}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{
                    width: '100%', height: `${Math.max(arsH, 4)}px`,
                    borderRadius: '6px 6px 3px 3px',
                    background: d.ars > 0
                      ? 'linear-gradient(to top, rgba(255,107,107,0.6), rgba(255,107,107,0.2))'
                      : 'rgba(255,255,255,0.04)',
                    border: d.ars > 0 ? '1px solid rgba(255,107,107,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'height 0.3s ease',
                  }} />
                </div>
                {/* Month label */}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {d.month}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(255,107,107,0.5)' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)' }}>Ingresos ARS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
