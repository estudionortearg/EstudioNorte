import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { post_id, reply_id } = await req.json()
  if (!post_id && !reply_id) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const filter = post_id
    ? { user_id: user.id, post_id, reply_id: null }
    : { user_id: user.id, reply_id, post_id: null }

  // Toggle: check if exists
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id')
    .match(post_id ? { user_id: user.id, post_id } : { user_id: user.id, reply_id })
    .maybeSingle()

  if (existing) {
    await supabase.from('community_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  }

  await supabase.from('community_reactions').insert(
    post_id ? { user_id: user.id, post_id } : { user_id: user.id, reply_id }
  )
  return NextResponse.json({ liked: true })
}
