import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PerfilClient from './PerfilClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Perfil — Estudio Norte' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, courses (id, slug, title)')
    .eq('user_id', user.id)

  const { data: progressRows } = await supabase
    .from('progress')
    .select('lesson_id, completed_at')
    .eq('user_id', user.id)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, currency, created_at, provider, status')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <PerfilClient
      email={user.email || ''}
      fullName={profile?.full_name || ''}
      avatarUrl={profile?.avatar_url || null}
      createdAt={profile?.created_at || user.created_at}
      enrollmentsCount={(enrollments || []).length}
      lessonsCompleted={(progressRows || []).length}
      payments={payments || []}
    />
  )
}
