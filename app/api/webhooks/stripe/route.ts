import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('Stripe webhook signature error:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ ok: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  const courseSlug = session.metadata?.courseSlug
  const customerEmail = session.customer_email
  const amountTotal = session.amount_total // in cents

  if (!courseSlug || !customerEmail) {
    console.error('Stripe webhook: missing courseSlug or customerEmail')
    return NextResponse.json({ ok: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find user by email
  const { data: userData } = await supabase.auth.admin.listUsers()
  const user = userData?.users?.find(u => u.email === customerEmail)

  if (!user) {
    console.error('Stripe webhook: user not found for email', customerEmail)
    return NextResponse.json({ ok: true })
  }

  // Find course
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()

  if (!course) {
    console.error('Stripe webhook: course not found', courseSlug)
    return NextResponse.json({ ok: true })
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('provider_payment_id', session.id)
    .single()

  if (existing) return NextResponse.json({ ok: true })

  // Create payment
  await supabase.from('payments').insert({
    user_id: user.id,
    course_id: course.id,
    provider: 'stripe',
    provider_payment_id: session.id,
    amount: amountTotal ? Math.round(amountTotal / 100) : 0,
    currency: 'USD',
    status: 'approved',
  })

  // Create enrollment
  await supabase.from('enrollments').upsert({
    user_id: user.id,
    course_id: course.id,
    expires_at: null,
  })

  // TODO: Send welcome email (Task 15)

  return NextResponse.json({ ok: true })
}
