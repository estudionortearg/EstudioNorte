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

  const { data: allBadges } = await supabase
    .from('badges')
    .select('id, slug, name, emoji, description, condition_type, condition_value')
    .eq('is_active', true)
    .order('created_at')

  const { data: earnedBadgesRaw } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at, course_id, badges(id, slug, name, emoji, description, condition_type, condition_value)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  const { data: activeRewards } = await supabase
    .from('rewards')
    .select('id, title, description, type, xp_cost, stock')
    .eq('is_active', true)
    .order('xp_cost')

  const { data: myRequests } = await supabase
    .from('reward_requests')
    .select('id, status, requested_at, rewards(title, type, xp_cost)')
    .eq('user_id', user.id)
    .order('requested_at', { ascending: false })

  const { data: xpRow } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', user.id)
    .single()

  const earnedBadges = (earnedBadgesRaw || []).map((r: any) => ({
    badge: r.badges as { id: string; slug: string; name: string; emoji: string; description: string; condition_type: string; condition_value: number },
    earned_at: r.earned_at as string,
    course_id: r.course_id as string | null,
  }))

  return (
    <PerfilClient
      email={user.email || ''}
      fullName={profile?.full_name || ''}
      avatarUrl={profile?.avatar_url || null}
      createdAt={profile?.created_at || user.created_at}
      enrollmentsCount={(enrollments || []).length}
      lessonsCompleted={(progressRows || []).length}
      payments={payments || []}
      allBadges={allBadges || []}
      earnedBadges={earnedBadges}
      activeRewards={activeRewards || []}
      myRequests={(myRequests || []).map((r: any) => ({ ...r, rewards: Array.isArray(r.rewards) ? r.rewards[0] ?? null : r.rewards }))}
      totalXp={xpRow?.total_xp || 0}
    />
  )
}
