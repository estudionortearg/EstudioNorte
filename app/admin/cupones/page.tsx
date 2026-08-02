import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import CuponesClient from './CuponesClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cupones — Admin Estudio Norte' }

export default async function AdminCuponesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const admin = createAdminClient()
  const { data: coupons } = await admin
    .from('coupons')
    .select('*, coupon_uses(count)')
    .order('created_at', { ascending: false })

  const { data: courses } = await admin.from('courses').select('slug, title').order('title')

  return <CuponesClient coupons={coupons || []} courses={courses || []} />
}
