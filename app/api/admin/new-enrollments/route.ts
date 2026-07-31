import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since') || '1970-01-01'
  const admin = createAdminClient()
  const { count } = await admin
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .gt('enrolled_at', since)
  return NextResponse.json({ count: count || 0 })
}
