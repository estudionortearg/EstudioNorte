'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function togglePublish(courseId: string, currentState: boolean) {
  const supabase = createAdminClient()
  await supabase.from('courses').update({ is_published: !currentState }).eq('id', courseId)
  revalidatePath('/admin/cursos')
}
