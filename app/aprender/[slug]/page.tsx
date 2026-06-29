import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) redirect('/cursos')

  // Get first lesson
  const { data: firstModule } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', course.id)
    .order('order_index')
    .limit(1)
    .single()

  if (firstModule) {
    const { data: firstLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', firstModule.id)
      .order('order_index')
      .limit(1)
      .single()

    if (firstLesson) {
      redirect(`/aprender/${slug}/${firstLesson.id}`)
    }
  }

  redirect(`/cursos/${slug}`)
}
