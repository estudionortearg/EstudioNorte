import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id: course_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const admin = createAdminClient()
  // Get next order_index
  const { count } = await admin.from('modules').select('id', { count: 'exact', head: true }).eq('course_id', course_id)
  const order_index = (count || 0)

  const { data, error } = await admin
    .from('modules')
    .insert({ course_id, title: title.trim(), order_index })
    .select('id, title, order_index')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
