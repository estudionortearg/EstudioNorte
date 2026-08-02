import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

async function guardAdmin(): Promise<{ admin: ReturnType<typeof createAdminClient> } | { error: Response }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { admin: createAdminClient() }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const result = await guardAdmin()
  if ('error' in result) return result.error
  const admin = result.admin

  const body = await req.json()
  const allowed = ['title', 'description', 'is_free_preview', 'duration_minutes', 'order_index', 'pdf_url']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 })

  const { error } = await admin.from('lessons').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const result = await guardAdmin()
  if ('error' in result) return result.error
  const admin = result.admin

  const { error } = await admin.from('lessons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
