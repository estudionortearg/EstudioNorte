import { MercadoPagoConfig, Payment } from 'mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Only handle payment notifications
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const payerEmail = payment.payer?.email
    const courseSlug = payment.external_reference

    if (!payerEmail || !courseSlug) {
      console.error('MP webhook: missing payer email or course slug')
      return NextResponse.json({ ok: true })
    }

    // Find user by email
    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users?.find(u => u.email === payerEmail)

    if (!user) {
      console.error('MP webhook: user not found for email', payerEmail)
      return NextResponse.json({ ok: true })
    }

    // Find course by slug
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .single()

    if (!course) {
      console.error('MP webhook: course not found for slug', courseSlug)
      return NextResponse.json({ ok: true })
    }

    // Check if payment already processed
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_payment_id', String(paymentId))
      .single()

    if (existingPayment) {
      return NextResponse.json({ ok: true }) // Already processed
    }

    // Create payment record
    await supabase.from('payments').insert({
      user_id: user.id,
      course_id: course.id,
      provider: 'mercadopago',
      provider_payment_id: String(paymentId),
      amount: payment.transaction_amount,
      currency: 'ARS',
      status: 'approved',
    })

    // Create enrollment
    await supabase.from('enrollments').upsert({
      user_id: user.id,
      course_id: course.id,
      expires_at: null, // lifetime access
    })

    // TODO: Send welcome email (Task 15)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
