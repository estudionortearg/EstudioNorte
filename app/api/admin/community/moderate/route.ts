import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { post_id, action } = await req.json()
  if (!post_id || !['approve', 'hide'].includes(action)) {
    return NextResponse.json({ error: 'post_id y action (approve|hide) son requeridos' }, { status: 400 })
  }

  const admin = createAdminClient()
  const status = action === 'approve' ? 'published' : 'hidden'

  const { error } = await admin
    .from('community_posts')
    .update({ status })
    .eq('id', post_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('moderation_logs').insert({
    post_id,
    reason: action === 'approve' ? 'manual_approve' : 'manual_hide',
    action,
  })

  return NextResponse.json({ ok: true, status })
}
