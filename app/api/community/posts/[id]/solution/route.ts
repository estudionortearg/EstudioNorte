import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: postId } = await params
  const { reply_id } = await req.json()

  // Only post owner or admin can mark solution
  const { data: post } = await supabase
    .from('community_posts')
    .select('id, user_id')
    .eq('id', postId)
    .single()

  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  const isAdmin = profile?.is_admin === true
  if (post.user_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const admin = createAdminClient()
  await admin.from('community_posts').update({ solution_reply_id: reply_id || null }).eq('id', postId)

  // Award XP + badge to reply author
  if (reply_id) {
    const { data: reply } = await admin.from('community_replies').select('user_id').eq('id', reply_id).single()
    if (reply?.user_id) {
      await admin.rpc('increment_xp', { p_user_id: reply.user_id, p_xp: 50 }).catch(() => {})
      const { data: badge } = await admin.from('badges').select('id').eq('slug', 'guia_comunidad').single()
      if (badge) {
        await admin.from('user_badges').insert({ user_id: reply.user_id, badge_id: badge.id }).catch(() => {})
      }
    }
  }

  return NextResponse.json({ ok: true })
}
