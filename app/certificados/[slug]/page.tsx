import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CertificadoClient from './CertificadoClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CertificadoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, enrolled_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/cursos/${slug}`)

  // Get all lesson IDs for this course
  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons (id)')
    .eq('course_id', course.id)

  const allLessonIds = (modules || []).flatMap(m =>
    ((m.lessons as unknown as { id: string }[]) || []).map(l => l.id)
  )

  const totalLessons = allLessonIds.length

  const { data: progressRows } = allLessonIds.length > 0
    ? await supabase.from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', allLessonIds)
    : { data: [] }

  const completedCount = (progressRows || []).length
  const isComplete = totalLessons > 0 && completedCount >= totalLessons

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Alumno'

  return (
    <CertificadoClient
      courseTitle={course.title}
      courseSlug={slug}
      displayName={displayName}
      isComplete={isComplete}
      completedCount={completedCount}
      totalLessons={totalLessons}
      enrolledAt={enrollment.enrolled_at}
    />
  )
}
