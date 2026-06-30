import { createAdminClient } from '@/lib/supabase/admin'
import AlumnosClient from './AlumnosClient'

export const dynamic = 'force-dynamic'

export default async function AdminAlumnosPage() {
  const supabase = createAdminClient()

  const [
    { data: enrollments },
    { data: usersData },
    { data: notesData },
  ] = await Promise.all([
    supabase.from('enrollments').select('id, enrolled_at, user_id, courses ( title, slug )').order('enrolled_at', { ascending: false }).limit(100),
    supabase.auth.admin.listUsers(),
    supabase.from('admin_notes').select('user_id, note'),
  ])

  const userMap = new Map((usersData?.users || []).map(u => [u.id, u.email ?? '']))
  const noteMap = new Map((notesData || []).map(n => [n.user_id, n.note]))

  const alumnos = (enrollments || []).map(e => {
    const course = e.courses as unknown as { title: string; slug: string } | null
    return {
      id: e.id,
      user_id: e.user_id,
      enrolled_at: e.enrolled_at,
      email: userMap.get(e.user_id) || e.user_id,
      courseTitle: course?.title || '—',
      courseSlug: course?.slug || '',
      note: noteMap.get(e.user_id) || '',
    }
  })

  const uniqueCourses = [...new Set(alumnos.map(a => a.courseTitle).filter(t => t !== '—'))]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Gestión
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Alumnos
        </h1>
      </div>

      <AlumnosClient alumnos={alumnos} courses={uniqueCourses} />
    </div>
  )
}
