import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlayerClient from './PlayerClient'

interface Props {
  params: Promise<{ slug: string; lessonId: string }>
}

export default async function PlayerPage({ params }: Props) {
  const { slug, lessonId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/aprender/' + slug)

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
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/cursos/${slug}`)

  // Plan gate — fetch profile plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  // Get all modules + lessons for sidebar
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order_index, lessons (id, title, duration_minutes, order_index, is_free_preview)')
    .eq('course_id', course.id)
    .order('order_index')

  // Get current lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, description, video_url, pdf_url, duration_minutes, order_index, module_id, is_free_preview')
    .eq('id', lessonId)
    .single()

  if (!lesson) notFound()

  // Gate: free plan + non-preview lesson → redirect to pricing
  if ((profile?.plan ?? 'free') === 'free' && !lesson.is_free_preview) {
    redirect(`/precios?ref=paywall&course=${slug}`)
  }

  // Get user progress
  const allLessonIds = (modules || []).flatMap(m =>
    ((m.lessons as unknown as { id: string }[]) || []).map(l => l.id)
  )

  const { data: progressRows } = allLessonIds.length > 0
    ? await supabase.from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', allLessonIds)
    : { data: [] }

  const completedIds = new Set((progressRows || []).map(p => p.lesson_id))

  // Find prev/next lesson
  const allLessons = (modules || [])
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(m => ((m.lessons as unknown as { id: string; order_index: number }[]) || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(l => l.id)
    )
  const currentIdx = allLessons.indexOf(lessonId)
  const prevLessonId = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLessonId = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  const completedCount = completedIds.size
  const totalCount = allLessons.length

  return (
    <PlayerClient
      courseSlug={slug}
      courseTitle={course.title}
      courseId={course.id}
      lesson={lesson as { id: string; title: string; description: string | null; video_url: string | null; pdf_url: string | null; duration_minutes: number | null; order_index: number; module_id: string; is_free_preview: boolean }}
      modules={modules as unknown as Array<{ id: string; title: string; order_index: number; lessons: Array<{ id: string; title: string; duration_minutes: number | null; order_index: number; is_free_preview: boolean }> }>}
      completedIds={[...completedIds]}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
      userId={user.id}
      completedCount={completedCount}
      totalCount={totalCount}
    />
  )
}
