import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id, note } = await req.json()
  const admin = createAdminClient()
  await admin
    .from('admin_notes')
    .upsert({ user_id, note, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return NextResponse.json({ ok: true })
}
