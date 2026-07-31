import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verificar que es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  // Obtener la solicitud
  const { data: request } = await supabase
    .from('reward_requests')
    .select('id, user_id, reward_id, status')
    .eq('id', id)
    .single()

  if (!request) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 400 })
  }

  if (action === 'approve') {
    // Verificar XP al momento de aprobar
    const { data: reward } = await supabase
      .from('rewards')
      .select('xp_cost, stock')
      .eq('id', request.reward_id)
      .single()

    const { data: xpRow } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', request.user_id)
      .single()

    if ((xpRow?.total_xp || 0) < (reward?.xp_cost || 0)) {
      // Rechazar automáticamente: XP insuficiente al momento de aprobar
      await supabase.from('reward_requests').update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      }).eq('id', id)
      return NextResponse.json({ error: 'XP insuficiente al momento de aprobar — solicitud rechazada automáticamente' }, { status: 400 })
    }

    // Descontar XP
    await supabase.from('user_xp').update({
      total_xp: (xpRow?.total_xp || 0) - (reward?.xp_cost || 0),
      updated_at: new Date().toISOString(),
    }).eq('user_id', request.user_id)

    // Reducir stock si no es ilimitado
    if (reward && reward.stock !== null && reward.stock !== undefined) {
      await supabase.from('rewards').update({ stock: reward.stock - 1 }).eq('id', request.reward_id)
    }

    await supabase.from('reward_requests').update({
      status: 'approved',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    }).eq('id', id)
  } else {
    await supabase.from('reward_requests').update({
      status: 'rejected',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
