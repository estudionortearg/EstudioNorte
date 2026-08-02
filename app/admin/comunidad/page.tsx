import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminComunidadClient from './AdminComunidadClient'

export default async function AdminComunidadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) redirect('/dashboard')

  const admin = createAdminClient()

  const { data: pending } = await admin
    .from('community_posts')
    .select('id, title, body, category, lesson_id, created_at, profiles!user_id(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: logs } = await admin
    .from('moderation_logs')
    .select('id, post_id, reason, action, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return <AdminComunidadClient pending={(pending || []) as any} logs={(logs || []) as any} />
}
