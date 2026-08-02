import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = req.headers.get('content-type') || ''

  // Preset gradient — sent as JSON { gradient: "..." }
  if (contentType.includes('application/json')) {
    const { gradient } = await req.json()
    if (!gradient || typeof gradient !== 'string') {
      return NextResponse.json({ error: 'Gradient inválido' }, { status: 400 })
    }
    const admin = createAdminClient()
    await admin.from('profiles').upsert({ id: user.id, banner_url: gradient }, { onConflict: 'id' })
    return NextResponse.json({ url: gradient })
  }

  // Image upload — multipart form
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera 8 MB' }, { status: 400 })
  }

  const admin = createAdminClient()
  const path = `${user.id}/banner.${ext}`

  await admin.storage.createBucket('profile-banners', { public: true }).catch(() => {})

  const { error: uploadError } = await admin.storage
    .from('profile-banners')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('profile-banners').getPublicUrl(path)
  const url = `${publicUrl}?t=${Date.now()}`

  await admin.from('profiles').upsert({ id: user.id, banner_url: url }, { onConflict: 'id' })

  return NextResponse.json({ url })
}
