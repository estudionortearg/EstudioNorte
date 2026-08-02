import { SupabaseClient } from '@supabase/supabase-js'

export async function recordCouponUse(
  admin: SupabaseClient,
  {
    couponId,
    userId,
    courseSlug,
    discountAmountArs = 0,
    discountAmountUsd = 0,
  }: {
    couponId: string
    userId: string
    courseSlug: string
    discountAmountArs?: number
    discountAmountUsd?: number
  }
) {
  if (!couponId || !userId) return

  const { error } = await admin.from('coupon_uses').insert({
    coupon_id: couponId,
    user_id: userId,
    course_slug: courseSlug,
    discount_amount_ars: discountAmountArs,
    discount_amount_usd: discountAmountUsd,
  })

  if (error) {
    // 23505 = unique constraint — already recorded
    if (error.code !== '23505') {
      console.error('recordCouponUse insert error:', error)
    }
    return
  }

  // Fetch coupon info and increment uses_count
  const { data: coupon } = await admin
    .from('coupons')
    .select('uses_count, referrer_user_id, referrer_xp')
    .eq('id', couponId)
    .single()

  if (!coupon) return

  await admin
    .from('coupons')
    .update({ uses_count: (coupon.uses_count ?? 0) + 1 })
    .eq('id', couponId)
    .then(() => {}, () => {})

  // Award referrer XP if this is a referral coupon
  if (coupon.referrer_user_id && coupon.referrer_xp > 0) {
    const { data: xpRow } = await admin
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', coupon.referrer_user_id)
      .single()

    const currentXp = xpRow?.total_xp ?? 0
    await admin
      .from('user_xp')
      .upsert({
        user_id: coupon.referrer_user_id,
        total_xp: currentXp + coupon.referrer_xp,
        updated_at: new Date().toISOString(),
      })
      .then(() => {}, () => {})
  }
}
