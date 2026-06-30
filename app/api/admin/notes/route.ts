import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { user_id, note } = await req.json()
  const supabase = createAdminClient()
  await supabase
    .from('admin_notes')
    .upsert({ user_id, note, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return NextResponse.json({ ok: true })
}
