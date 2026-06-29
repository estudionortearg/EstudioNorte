import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import CourseProgressCard from '@/components/dashboard/CourseProgressCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Dashboard — Estudio Norte',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's enrollments with course data
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        id,
        slug,
        title
      )
    `)
    .eq('user_id', user.id)

  // For each course, compute progress
  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string } | null
      if (!course) return null

      // Get module IDs for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', course.id)
      const moduleIds = modules?.map((m: { id: string }) => m.id) || []

      if (moduleIds.length === 0) {
        return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0 }
      }

      // Get lesson IDs for these modules
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []

      if (lessonIds.length === 0) {
        return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0 }
      }

      // Count total lessons
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in('id', lessonIds)

      // Count completed lessons
      const { count: completedLessons } = await supabase
        .from('progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)

      const percent = totalLessons
        ? Math.round(((completedLessons || 0) / totalLessons) * 100)
        : 0

      return {
        courseSlug: course.slug,
        courseTitle: course.title,
        progressPercent: percent,
      }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    courseSlug: string
    courseTitle: string
    progressPercent: number
  }>

  const displayName = user.email?.split('@')[0] || 'estudiante'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--color-teal)',
            marginBottom: '8px',
          }}>
            {getGreeting()}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '40px',
            letterSpacing: '-1px',
            color: 'var(--color-text)',
            marginBottom: '8px',
          }}>
            {displayName}.
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
            Seguís donde lo dejaste.
          </p>
        </div>

        {/* Courses */}
        {validCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '24px' }}>
              Todavía no tenés cursos. ¿Empezamos?
            </p>
            <Button href="/cursos" variant="primary">Ver cursos</Button>
          </div>
        ) : (
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--color-text)',
              marginBottom: '24px',
            }}>
              Mis cursos
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {validCourses.map(course => (
                <CourseProgressCard key={course.courseSlug} {...course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
