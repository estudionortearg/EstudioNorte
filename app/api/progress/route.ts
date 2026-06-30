import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lesson_id } = await req.json()
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  await supabase.from('progress').upsert(
    { user_id: user.id, lesson_id, completed_at: new Date().toISOString() },
    { onConflict: 'user_id,lesson_id' }
  )

  return NextResponse.json({ ok: true })
}
