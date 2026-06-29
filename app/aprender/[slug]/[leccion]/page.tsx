import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonPlayerLayout from './LessonPlayerLayout'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; leccion: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: `Aprendiendo — Estudio Norte` }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; leccion: string }>
}) {
  const { slug, leccion: lessonId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/cursos/${slug}`)

  // Get all modules with lessons
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id, title, order_index,
      lessons (
        id, title, video_url, duration_minutes, is_free_preview, order_index
      )
    `)
    .eq('course_id', course.id)
    .order('order_index')

  // Sort lessons within each module
  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: [...(m.lessons as any[])].sort((a, b) => a.order_index - b.order_index),
  }))

  // Find current lesson
  const allLessons = sortedModules.flatMap(m => m.lessons)
  const currentLesson = allLessons.find(l => l.id === lessonId)

  if (!currentLesson) {
    const firstLesson = allLessons[0]
    if (firstLesson) redirect(`/aprender/${slug}/${firstLesson.id}`)
    notFound()
  }

  // Get completed lessons for this user/course
  const { data: progressData } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', allLessons.map(l => l.id))

  const completedLessonIds = (progressData || []).map(p => p.lesson_id)
  const completedCount = completedLessonIds.length
  const totalCount = allLessons.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <LessonPlayerLayout
      courseTitle={course.title}
      courseSlug={slug}
      currentLesson={currentLesson}
      modules={sortedModules}
      completedLessonIds={completedLessonIds}
      progressPercent={progressPercent}
      userId={user.id}
    />
  )
}
