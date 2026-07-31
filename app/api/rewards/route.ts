import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reward_id } = await req.json()
  if (!reward_id) return NextResponse.json({ error: 'reward_id required' }, { status: 400 })

  // Verificar que la recompensa existe y está activa
  const { data: reward } = await supabase
    .from('rewards')
    .select('id, xp_cost, stock, is_active')
    .eq('id', reward_id)
    .single()

  if (!reward || !reward.is_active) {
    return NextResponse.json({ error: 'Recompensa no disponible' }, { status: 404 })
  }

  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json({ error: 'Sin stock disponible' }, { status: 400 })
  }

  // Verificar XP suficiente
  const { data: xpRow } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', user.id)
    .single()

  if ((xpRow?.total_xp || 0) < reward.xp_cost) {
    return NextResponse.json({ error: 'XP insuficiente' }, { status: 400 })
  }

  // Verificar que no hay un canje pending para esta recompensa del mismo usuario
  const { data: existingPending } = await supabase
    .from('reward_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('reward_id', reward_id)
    .eq('status', 'pending')
    .single()

  if (existingPending) {
    return NextResponse.json({ error: 'Ya tenés una solicitud pendiente para esta recompensa' }, { status: 409 })
  }

  // Crear solicitud
  const { data: request } = await supabase
    .from('reward_requests')
    .insert({ user_id: user.id, reward_id })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, request_id: request?.id })
}
