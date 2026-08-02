import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera 5 MB' }, { status: 400 })
  }

  const admin = createAdminClient()
  const path = `${user.id}/avatar.${ext}`

  // Ensure bucket exists
  await admin.storage.createBucket('avatars', { public: true }).catch(() => {})

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

  // Add cache-busting so the browser reloads the image
  const url = `${publicUrl}?t=${Date.now()}`

  await admin.from('profiles').upsert({ id: user.id, avatar_url: url }, { onConflict: 'id' })

  return NextResponse.json({ url })
}
