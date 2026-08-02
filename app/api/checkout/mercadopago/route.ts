import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { courseSlug, courseTitle, priceArs, userEmail, couponCode, couponId, discountArs } = await request.json()

    if (!courseSlug || !courseTitle || !priceArs) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const finalPrice = discountArs && couponId ? Math.max(1, priceArs - discountArs) : priceArs

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const result = await preference.create({
      body: {
        items: [
          {
            id: courseSlug,
            title: courseTitle + (couponCode ? ` (código: ${couponCode})` : ''),
            quantity: 1,
            unit_price: finalPrice,
            currency_id: 'ARS',
          },
        ],
        payer: userEmail ? { email: userEmail } : undefined,
        back_urls: {
          success: `${siteUrl}/gracias?curso=${courseSlug}${couponId ? `&coupon=${couponId}&discount=${discountArs || 0}` : ''}`,
          failure: `${siteUrl}/cursos/${courseSlug}`,
          pending: `${siteUrl}/gracias?curso=${courseSlug}&pending=true`,
        },
        auto_return: 'approved',
        external_reference: `${courseSlug}|${couponId || ''}|${user?.id || ''}`,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
    })

    return NextResponse.json({ init_point: result.init_point })
  } catch (error) {
    console.error('MP checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
