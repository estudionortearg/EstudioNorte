import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since') || '1970-01-01'
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .gt('enrolled_at', since)
  return NextResponse.json({ count: count || 0 })
}
