import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GamificacionClient from './GamificacionClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gamificación — Admin Estudio Norte' }

export default async function AdminGamificacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const [
    { data: badges },
    { data: rewards },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase.from('badges').select('*').order('created_at'),
    supabase.from('rewards').select('*').order('created_at'),
    supabase
      .from('reward_requests')
      .select('id, requested_at, user_id, reward_id, rewards(title, xp_cost, type), profiles(full_name)')
      .eq('status', 'pending')
      .order('requested_at'),
  ])

  // XP actual de cada usuario con solicitud pendiente
  const userIds = [...new Set((pendingRequests || []).map((r: { user_id: string }) => r.user_id))]
  const { data: xpRows } = userIds.length > 0
    ? await supabase.from('user_xp').select('user_id, total_xp').in('user_id', userIds)
    : { data: [] }

  const xpByUser = Object.fromEntries(
    (xpRows || []).map((r: { user_id: string; total_xp: number }) => [r.user_id, r.total_xp])
  )

  // Supabase returns joined rows as arrays; we normalize to single objects for the client
  type RawRequest = {
    id: string
    requested_at: string
    user_id: string
    reward_id: string
    rewards: { title: string; xp_cost: number; type: string }[] | null
    profiles: { full_name: string | null }[] | null
  }

  const requestsWithXp = ((pendingRequests || []) as unknown as RawRequest[]).map(r => ({
    id: r.id,
    requested_at: r.requested_at,
    user_id: r.user_id,
    reward_id: r.reward_id,
    rewards: Array.isArray(r.rewards) ? (r.rewards[0] ?? null) : r.rewards,
    profiles: Array.isArray(r.profiles) ? (r.profiles[0] ?? null) : r.profiles,
    user_xp: xpByUser[r.user_id] || 0,
  }))

  return (
    <GamificacionClient
      badges={badges || []}
      rewards={rewards || []}
      pendingRequests={requestsWithXp}
    />
  )
}
