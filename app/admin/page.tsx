import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import MetricCard from '@/components/admin/MetricCard'

export const metadata: Metadata = { title: 'Admin — Estudio Norte' }

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Total enrolled students (unique users)
  const { count: totalStudents } = await supabase
    .from('enrollments')
    .select('user_id', { count: 'exact', head: true })

  // Total revenue ARS
  const { data: arsPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('currency', 'ARS')
    .eq('status', 'approved')

  const totalArs = (arsPayments || []).reduce((sum, p) => sum + p.amount, 0)

  // Total revenue USD
  const { data: usdPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('currency', 'USD')
    .eq('status', 'approved')

  const totalUsd = (usdPayments || []).reduce((sum, p) => sum + p.amount, 0)

  // Published courses count
  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  // Recent 10 payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('id, amount, currency, status, created_at, provider')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--color-text)', marginBottom: '32px' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        <MetricCard label="Alumnos" value={totalStudents || 0} />
        <MetricCard label="Ingresos ARS" value={`$${(totalArs || 0).toLocaleString('es-AR')}`} />
        <MetricCard label="Ingresos USD" value={`$${(totalUsd || 0).toLocaleString()}`} />
        <MetricCard label="Cursos publicados" value={publishedCourses || 0} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text)', marginBottom: '16px' }}>
        Últimos pagos
      </h2>

      <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Proveedor', 'Monto', 'Moneda', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recentPayments || []).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text)' }}>{p.provider}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-coral)', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{p.currency}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: p.status === 'approved' ? 'var(--color-teal)' : 'var(--color-text-muted)' }}>{p.status}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-faint)' }}>{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
              </tr>
            ))}
            {(!recentPayments || recentPayments.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '14px' }}>
                  Sin pagos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
