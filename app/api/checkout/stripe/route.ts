import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { courseSlug, courseTitle, priceUsd, userEmail, couponCode, couponId, discountUsd } = await request.json()

    if (!courseSlug || !courseTitle || !priceUsd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const finalPrice = discountUsd && couponId ? Math.max(0, priceUsd - discountUsd) : priceUsd

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(finalPrice * 100),
            product_data: {
              name: courseTitle + (couponCode ? ` (código: ${couponCode})` : ''),
              description: 'Estudio Norte — Acceso de por vida',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseSlug,
        couponId: couponId || '',
        userId: user?.id || '',
        discountUsd: discountUsd?.toString() || '0',
      },
      success_url: `${siteUrl}/gracias?curso=${courseSlug}&provider=stripe`,
      cancel_url: `${siteUrl}/cursos/${courseSlug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
