import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, course_slug, price_ars, price_usd } = await req.json()
  if (!code?.trim() || !course_slug) {
    return NextResponse.json({ error: 'Código y curso requeridos' }, { status: 400 })
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return NextResponse.json({ error: 'Código inválido o inactivo' }, { status: 404 })
  }

  // Verificar vencimiento
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este código ya venció' }, { status: 400 })
  }

  // Verificar usos máximos
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'Este código ya alcanzó el límite de usos' }, { status: 400 })
  }

  // Verificar si el usuario ya lo usó para este curso
  const { data: existingUse } = await supabase
    .from('coupon_uses')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', user.id)
    .eq('course_slug', course_slug)
    .maybeSingle()

  if (existingUse) {
    return NextResponse.json({ error: 'Ya usaste este código para este curso' }, { status: 400 })
  }

  // Verificar que aplica al curso
  if (coupon.course_slugs && coupon.course_slugs.length > 0) {
    if (!coupon.course_slugs.includes(course_slug)) {
      return NextResponse.json({ error: 'Este código no aplica a este curso' }, { status: 400 })
    }
  }

  // Calcular descuento
  let discount_ars = 0
  let discount_usd = 0

  if (coupon.type === 'percent') {
    discount_ars = Math.round((price_ars || 0) * coupon.value / 100)
    discount_usd = Math.round(((price_usd || 0) * coupon.value / 100) * 100) / 100
  } else if (coupon.type === 'fixed_ars') {
    discount_ars = Math.min(coupon.value, price_ars || 0)
    discount_usd = 0
  } else if (coupon.type === 'fixed_usd') {
    discount_usd = Math.min(coupon.value, price_usd || 0)
    discount_ars = 0
  }

  const final_ars = Math.max(0, (price_ars || 0) - discount_ars)
  const final_usd = Math.max(0, (price_usd || 0) - discount_usd)

  return NextResponse.json({
    valid: true,
    coupon_id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount_ars,
    discount_usd,
    final_ars,
    final_usd,
    is_referral: !!coupon.referrer_user_id,
    referrer_xp: coupon.referrer_xp || 0,
  })
}
