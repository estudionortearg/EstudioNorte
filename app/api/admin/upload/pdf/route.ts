import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { courseSlug, lessonId } = await req.json()
  if (!courseSlug || !lessonId) return NextResponse.json({ error: 'courseSlug and lessonId required' }, { status: 400 })

  const path = `${courseSlug}/${lessonId}.pdf`
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('course-pdfs')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-pdfs/${path}`
  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
