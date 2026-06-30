import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminAlumnosPage() {
  const supabase = createAdminClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, user_id, courses ( title, slug )')
    .order('enrolled_at', { ascending: false })
    .limit(50)

  const { data: usersData } = await supabase.auth.admin.listUsers()
  const userMap = new Map((usersData?.users || []).map(u => [u.id, u.email]))

  const uniqueUsers = new Set((enrollments || []).map(e => e.user_id)).size

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Gestión
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Alumnos
        </h1>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Alumnos únicos', value: uniqueUsers, color: 'var(--color-teal)' },
          { label: 'Inscripciones', value: enrollments?.length || 0, color: 'var(--color-coral)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color, letterSpacing: '-1px' }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Alumno', 'Curso', 'Inscripto el'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', fontFamily: 'var(--font-body)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(enrollments || []).map((e, i) => {
              const course = e.courses as unknown as { title: string; slug: string } | null
              const email = userMap.get(e.user_id) || e.user_id
              const initials = (email as string).slice(0, 2).toUpperCase()
              return (
                <tr key={e.id} style={{ borderBottom: i < (enrollments?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(255,107,107,0.08))',
                        border: '1px solid rgba(78,205,196,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--color-teal)',
                      }}>
                        {initials}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)' }}>
                        {email as string}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.5)' }}>
                      {course?.title || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.25)' }}>
                      {new Date(e.enrolled_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                </tr>
              )
            })}
            {(!enrollments || enrollments.length === 0) && (
              <tr>
                <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                  Sin alumnos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
