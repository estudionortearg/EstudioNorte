import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { moderateContent, sendWelcome } from '@/lib/community/moderation'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const lessonId = searchParams.get('lesson_id')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('community_posts')
    .select(`
      id, title, body, category, lesson_id, status, is_pinned, is_locked,
      solution_reply_id, reply_count, reaction_count, created_at,
      profiles!user_id(full_name, avatar_url, is_admin)
    `)
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category', category)
  if (lessonId) query = query.eq('lesson_id', lessonId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check user has at least one enrollment
  const { count } = await supabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if (!count || count === 0) {
    return NextResponse.json({ error: 'Necesitás inscribirte en un curso para participar en la comunidad' }, { status: 403 })
  }

  const { title, body, category, lesson_id } = await req.json()
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
  }
  if (!category && !lesson_id) {
    return NextResponse.json({ error: 'Categoría o lección requerida' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Moderation check
  const modResult = moderateContent(title + ' ' + body)
  const status = modResult.flagged ? 'pending' : 'published'

  const { data: post, error } = await admin
    .from('community_posts')
    .insert({ user_id: user.id, title: title.trim(), body: body.trim(), category: category || null, lesson_id: lesson_id || null, status })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (modResult.flagged) {
    await admin.from('moderation_logs').insert({
      post_id: post.id, reason: modResult.reason, action: 'flagged'
    })
    return NextResponse.json({ post, flagged: true, message: 'Tu publicación está en revisión.' })
  }

  // XP for first post or any post
  const xpResult = await awardCommunityXP(admin, user.id, 'post')

  // Welcome bot on first post
  const { count: postCount } = await admin
    .from('community_posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'published')
  if (postCount === 1) {
    await sendWelcome(admin, post.id, user.id)
  }

  return NextResponse.json({ post, ...xpResult })
}

async function awardCommunityXP(admin: ReturnType<typeof createAdminClient>, userId: string, type: 'post' | 'reply' | 'solution') {
  const xpMap = { post: 10, reply: 5, solution: 50 }
  const xp = xpMap[type]

  await admin.from('user_xp').upsert({ user_id: userId, total_xp: xp }, { onConflict: 'user_id' })
  await admin.rpc('increment_xp', { p_user_id: userId, p_xp: xp }).catch(() => {})

  // Badge: primer aporte
  if (type === 'post') {
    const { count } = await admin.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published')
    if (count === 1) {
      const { data: badge } = await admin.from('badges').select('id').eq('slug', 'primer_aporte').single()
      if (badge) {
        await admin.from('user_badges').insert({ user_id: userId, badge_id: badge.id }).onConflict?.catch?.(() => {})
      }
    }
  }

  return { xp_earned: xp }
}
