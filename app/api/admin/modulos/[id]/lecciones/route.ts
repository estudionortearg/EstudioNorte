import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id: module_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, is_free_preview, duration_minutes, xp_value } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const admin = createAdminClient()
  const { count } = await admin.from('lessons').select('id', { count: 'exact', head: true }).eq('module_id', module_id)
  const order_index = (count || 0)

  const { data, error } = await admin
    .from('lessons')
    .insert({
      module_id,
      title: title.trim(),
      description: description?.trim() || null,
      is_free_preview: !!is_free_preview,
      duration_minutes: duration_minutes || null,
      xp_value: xp_value || 10,
      order_index,
      pdf_url: null,
    })
    .select('id, title, description, is_free_preview, duration_minutes, xp_value, order_index, pdf_url')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
