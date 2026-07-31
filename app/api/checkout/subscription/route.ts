import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLAN_CONFIG = {
  norte: {
    reason: 'Estudio Norte — Plan Norte',
    transaction_amount: 7000,
  },
  norte_pro: {
    reason: 'Estudio Norte — Plan Norte Pro',
    transaction_amount: 15000,
  },
} as const

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body.plan as keyof typeof PLAN_CONFIG | undefined

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Invalid plan. Must be norte or norte_pro' }, { status: 400 })
    }

    const config = PLAN_CONFIG[plan]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: config.reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: config.transaction_amount,
          currency_id: 'ARS',
        },
        back_url: `${siteUrl}/gracias?plan=${plan}`,
        payer_email: user.email,
        external_reference: `${user.id}|${plan}`,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('MP preapproval error:', errorData)
      return NextResponse.json({ error: 'MP checkout failed' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ init_point: data.init_point })
  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
