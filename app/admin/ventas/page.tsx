import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminVentasPage() {
  const supabase = createAdminClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, currency, status, provider, provider_payment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalArs = (payments || []).filter(p => p.currency === 'ARS' && p.status === 'approved').reduce((s, p) => s + p.amount, 0)
  const totalUsd = (payments || []).filter(p => p.currency === 'USD' && p.status === 'approved').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--color-text)', marginBottom: '16px' }}>
        Ventas
      </h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total ARS</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--color-coral)' }}>${totalArs.toLocaleString('es-AR')}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total USD</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--color-teal)' }}>${totalUsd.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Proveedor', 'ID Pago', 'Monto', 'Moneda', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(payments || []).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text)' }}>{p.provider}</td>
                <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.provider_payment_id}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-coral)', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{p.currency}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: p.status === 'approved' ? 'var(--color-teal)' : 'var(--color-text-faint)' }}>{p.status}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-faint)' }}>{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '14px' }}>
                  Sin ventas aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
