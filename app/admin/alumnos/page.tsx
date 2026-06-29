import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminAlumnosPage() {
  const supabase = createAdminClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      user_id,
      courses ( title, slug )
    `)
    .order('enrolled_at', { ascending: false })
    .limit(50)

  // Get user emails from auth
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const userMap = new Map((usersData?.users || []).map(u => [u.id, u.email]))

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--color-text)', marginBottom: '32px' }}>
        Alumnos
      </h1>

      <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Email', 'Curso', 'Inscripto'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(enrollments || []).map(e => {
              const course = e.courses as unknown as { title: string; slug: string } | null
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text)' }}>
                    {userMap.get(e.user_id) || e.user_id}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {course?.title || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-faint)' }}>
                    {new Date(e.enrolled_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              )
            })}
            {(!enrollments || enrollments.length === 0) && (
              <tr>
                <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '14px' }}>
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
