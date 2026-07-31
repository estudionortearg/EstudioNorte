import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, subtitle, description, price_ars, price_usd, is_featured } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })
  if (typeof price_ars !== 'number') return NextResponse.json({ error: 'price_ars required' }, { status: 400 })

  const slug = slugify(title)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('courses')
    .insert({ title: title.trim(), subtitle: subtitle?.trim() || null, description: description?.trim() || null, slug, price_ars, price_usd: price_usd || null, is_featured: !!is_featured, is_published: false })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'slug_conflict', slug }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
