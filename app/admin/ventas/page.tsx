import { createAdminClient } from '@/lib/supabase/admin'
import SalesChart from './SalesChart'

export const dynamic = 'force-dynamic'

function CurrencyBadge({ currency }: { currency: string }) {
  const isARS = currency === 'ARS'
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
      fontFamily: 'var(--font-body)', letterSpacing: '0.5px',
      background: isARS ? 'rgba(78,205,196,0.08)' : 'rgba(167,139,250,0.08)',
      color: isARS ? 'var(--color-teal)' : '#A78BFA',
      border: `1px solid ${isARS ? 'rgba(78,205,196,0.15)' : 'rgba(167,139,250,0.15)'}`,
    }}>
      {currency}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const approved = status === 'approved'
  const pending = status === 'pending'
  const color = approved ? 'var(--color-teal)' : pending ? 'var(--color-coral)' : 'rgba(247,247,242,0.3)'
  const bg = approved ? 'rgba(78,205,196,0.08)' : pending ? 'rgba(255,107,107,0.08)' : 'rgba(255,255,255,0.04)'
  const border = approved ? 'rgba(78,205,196,0.15)' : pending ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.07)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      background: bg, color, border: `1px solid ${border}`, fontFamily: 'var(--font-body)',
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
      {approved ? 'aprobado' : pending ? 'pendiente' : status}
    </span>
  )
}

export default async function AdminVentasPage() {
  const supabase = createAdminClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, currency, status, provider, provider_payment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalArs = (payments || []).filter(p => p.currency === 'ARS' && p.status === 'approved').reduce((s, p) => s + p.amount, 0)
  const totalUsd = (payments || []).filter(p => p.currency === 'USD' && p.status === 'approved').reduce((s, p) => s + p.amount, 0)
  const approvedPayments = (payments || []).filter(p => p.status === 'approved').length
  const pendingPayments = (payments || []).filter(p => p.status === 'pending').length
  const totalPayments = payments?.length || 0

  // Build monthly chart data (last 6 months)
  const monthlyMap = new Map<string, number>()
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString('es-AR', { month: 'short' })
    monthlyMap.set(key, 0)
  }
  ;(payments || []).filter(p => p.status === 'approved' && p.currency === 'ARS').forEach(p => {
    const d = new Date(p.created_at)
    const key = d.toLocaleDateString('es-AR', { month: 'short' })
    if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amount)
  })
  const chartData = Array.from(monthlyMap.entries()).map(([month, ars]) => ({ month, ars, usd: 0 }))

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Finanzas
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Ventas
        </h1>
      </div>

      {/* Revenue cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total ARS', value: `$${totalArs.toLocaleString('es-AR')}`, color: 'var(--color-coral)', sub: `${approvedPayments} pagos aprobados` },
          { label: 'Total USD', value: `$${totalUsd.toLocaleString()}`, color: '#A78BFA', sub: 'pagos internacionales' },
          { label: 'Transacciones', value: totalPayments, color: 'rgba(247,247,242,0.6)', sub: `${pendingPayments} pendientes` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{
            padding: '20px 24px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at 100% 0%, ${color}15 0%, transparent 70%)`, pointerEvents: 'none' }}/>
            <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.3)', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 2.5vw, 32px)', letterSpacing: '-1px', color, lineHeight: 1 }}>{value}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', marginTop: '6px' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <SalesChart data={chartData} />

      {/* Payments table */}
      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              Historial de pagos
            </h2>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.2)' }}>últimos {totalPayments}</span>
          </div>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(
              ['Proveedor,ID,Monto,Moneda,Estado,Fecha',
                ...(payments || []).map(p =>
                  `${p.provider},${p.provider_payment_id || ''},${p.amount},${p.currency},${p.status},${new Date(p.created_at).toLocaleDateString('es-AR')}`
                )
              ].join('\n')
            )}`}
            download="ventas.csv"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              fontFamily: 'var(--font-body)', textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(247,247,242,0.5)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3.5 6l3 3 3-3M1 10v1.5A.5.5 0 001.5 12h10a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Exportar CSV
          </a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Proveedor', 'ID pago', 'Monto', 'Moneda', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', fontFamily: 'var(--font-body)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(payments || []).map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < (payments?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '7px', fontSize: '9px', fontWeight: 800,
                    background: p.provider === 'mercadopago' ? 'rgba(78,205,196,0.1)' : 'rgba(167,139,250,0.1)',
                    color: p.provider === 'mercadopago' ? 'var(--color-teal)' : '#A78BFA',
                    border: `1px solid ${p.provider === 'mercadopago' ? 'rgba(78,205,196,0.2)' : 'rgba(167,139,250,0.2)'}`,
                    fontFamily: 'var(--font-body)',
                  }}>
                    {p.provider === 'mercadopago' ? 'MP' : 'ST'}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', maxWidth: '160px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {p.provider_payment_id || '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: p.currency === 'ARS' ? 'var(--color-coral)' : '#A78BFA', letterSpacing: '-0.5px' }}>
                    ${p.amount.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}><CurrencyBadge currency={p.currency} /></td>
                <td style={{ padding: '14px 20px' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)' }}>
                    {new Date(p.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                  Sin transacciones aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
