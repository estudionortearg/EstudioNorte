import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { courseSlug, courseTitle, priceUsd, userEmail } = await request.json()

    if (!courseSlug || !courseTitle || !priceUsd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
            unit_amount: priceUsd * 100, // Stripe uses cents
            product_data: {
              name: courseTitle,
              description: 'Estudio Norte — Acceso de por vida',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseSlug,
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
