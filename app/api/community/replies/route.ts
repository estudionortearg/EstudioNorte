import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { moderateContent } from '@/lib/community/moderation'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id requerido' }, { status: 400 })

  const { data, error } = await supabase
    .from('community_replies')
    .select('id, body, is_bot, reaction_count, created_at, profiles!user_id(full_name, avatar_url, is_admin)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ replies: data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { post_id, body } = await req.json()
  if (!post_id || !body?.trim()) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  // Check post exists and is not locked
  const { data: post } = await supabase
    .from('community_posts')
    .select('id, is_locked, status')
    .eq('id', post_id)
    .single()

  if (!post || post.status !== 'published') return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
  if (post.is_locked) return NextResponse.json({ error: 'Este hilo está cerrado' }, { status: 403 })

  const mod = moderateContent(body)
  if (mod.flagged) return NextResponse.json({ error: 'Tu mensaje no pudo publicarse. Revisá el contenido.', reason: mod.reason }, { status: 422 })

  const admin = createAdminClient()
  const { data: reply, error } = await admin
    .from('community_replies')
    .insert({ post_id, user_id: user.id, body: body.trim() })
    .select('id, body, is_bot, reaction_count, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // XP por respuesta
  await admin.rpc('increment_xp', { p_user_id: user.id, p_xp: 5 }).then(() => {}, () => {})

  // Badge: colaborador (10 respuestas)
  const { count } = await admin
    .from('community_replies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_bot', false)

  let badge_earned = null
  if (count === 10) {
    const { data: badge } = await admin.from('badges').select('id, slug, name, emoji, description').eq('slug', 'colaborador').single()
    if (badge) {
      await admin.from('user_badges').insert({ user_id: user.id, badge_id: badge.id }).then(() => {}, () => {})
      badge_earned = badge
    }
  }

  return NextResponse.json({ reply, xp_earned: 5, badge_earned })
}
