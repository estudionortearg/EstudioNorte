import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import EditCursoClient from './EditCursoClient'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditCursoPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, title, subtitle, description, price_ars, price_usd, is_published, is_featured')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, order_index, lessons(id, title, description, is_free_preview, duration_minutes, xp_value, order_index, pdf_url)')
    .eq('course_id', id)
    .order('order_index')

  return (
    <EditCursoClient
      course={course}
      initialModules={(modules || []).map(m => ({
        ...m,
        lessons: ((m.lessons as unknown as Lesson[]) || []).sort((a, b) => a.order_index - b.order_index),
      }))}
    />
  )
}

interface Lesson {
  id: string; title: string; description: string | null
  is_free_preview: boolean; duration_minutes: number | null
  xp_value: number; order_index: number; pdf_url: string | null
}
