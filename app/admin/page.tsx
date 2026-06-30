import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import MetricCard from '@/components/admin/MetricCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin — Estudio Norte' }

function StatusBadge({ status }: { status: string }) {
  const approved = status === 'approved'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
      background: approved ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.05)',
      color: approved ? 'var(--color-teal)' : 'rgba(247,247,242,0.3)',
      border: `1px solid ${approved ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
      {approved ? 'aprobado' : status}
    </span>
  )
}

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: totalStudents },
    { data: arsPayments },
    { data: usdPayments },
    { count: publishedCourses },
    { count: totalEnrollments },
    { data: recentPayments },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from('enrollments').select('user_id', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('currency', 'ARS').eq('status', 'approved'),
    supabase.from('payments').select('amount').eq('currency', 'USD').eq('status', 'approved'),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('id, amount, currency, status, created_at, provider').order('created_at', { ascending: false }).limit(8),
    supabase.from('enrollments').select('enrolled_at, courses(title)').order('enrolled_at', { ascending: false }).limit(5),
  ])

  const totalArs = (arsPayments || []).reduce((s, p) => s + p.amount, 0)
  const totalUsd = (usdPayments || []).reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Panel de control
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Dashboard
        </h1>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        <MetricCard
          label="Total alumnos"
          value={totalStudents || 0}
          sub={`${totalEnrollments || 0} inscripciones`}
          color="var(--color-teal)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 16c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
        />
        <MetricCard
          label="Ingresos ARS"
          value={`$${(totalArs || 0).toLocaleString('es-AR')}`}
          sub="pagos aprobados"
          color="var(--color-coral)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13L6.5 9L9.5 11.5L13 6.5L16 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <MetricCard
          label="Ingresos USD"
          value={`$${(totalUsd || 0).toLocaleString()}`}
          sub="pagos internacionales"
          color="#A78BFA"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5v8M7 7h3a1.5 1.5 0 010 3H7v-3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
        />
        <MetricCard
          label="Cursos publicados"
          value={publishedCourses || 0}
          sub="cursos activos"
          color="rgba(247,247,242,0.7)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 9h6M6 6h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
        />
      </div>

      {/* Two-col: recent payments + recent enrollments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* Recent payments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              Últimos pagos
            </h2>
            <Link href="/admin/ventas" style={{ fontSize: '12px', color: 'var(--color-teal)', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
            {(recentPayments || []).length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px' }}>Sin pagos aún</div>
            ) : (recentPayments || []).map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: i < (recentPayments?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: p.provider === 'mercadopago' ? 'rgba(78,205,196,0.1)' : 'rgba(167,139,250,0.1)',
                    border: `1px solid ${p.provider === 'mercadopago' ? 'rgba(78,205,196,0.15)' : 'rgba(167,139,250,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700,
                    color: p.provider === 'mercadopago' ? 'var(--color-teal)' : '#A78BFA',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {p.provider === 'mercadopago' ? 'MP' : 'ST'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)', fontWeight: 600 }}>
                      ${p.amount.toLocaleString()} {p.currency}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)' }}>
                      {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent enrollments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              Últimas inscripciones
            </h2>
            <Link href="/admin/alumnos" style={{ fontSize: '12px', color: 'var(--color-teal)', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
            {(recentEnrollments || []).length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px' }}>Sin inscripciones aún</div>
            ) : (recentEnrollments || []).map((e, i) => {
              const course = e.courses as unknown as { title: string } | null
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 20px',
                  borderBottom: i < (recentEnrollments?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', color: 'var(--color-teal)', fontWeight: 700, fontFamily: 'var(--font-display)',
                  }}>
                    {String.fromCharCode(65 + (i % 26))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {course?.title || 'Curso'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)' }}>
                      {new Date(e.enrolled_at).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '100px', fontSize: '10px',
                    background: 'rgba(78,205,196,0.08)', color: 'var(--color-teal)',
                    border: '1px solid rgba(78,205,196,0.15)', fontFamily: 'var(--font-body)',
                  }}>nuevo</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
