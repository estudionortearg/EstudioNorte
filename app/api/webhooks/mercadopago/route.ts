import { createHmac, timingSafeEqual } from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email/resend'

function verifyMpSignature(request: NextRequest, dataId: string): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  // If secret not configured, skip verification (dev mode)
  if (!webhookSecret) {
    console.warn('MP_WEBHOOK_SECRET not set — skipping signature verification')
    return true
  }

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  const ts = xSignature.match(/ts=([^,]+)/)?.[1] ?? ''
  const v1 = xSignature.match(/v1=([^,]+)/)?.[1] ?? ''

  if (!ts || !v1) return false

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = createHmac('sha256', webhookSecret).update(template).digest('hex')

  const hmacBuf = Buffer.from(hmac, 'hex')
  const v1Buf = Buffer.from(v1, 'hex')
  if (hmacBuf.length !== v1Buf.length) return false
  return timingSafeEqual(hmacBuf, v1Buf)
}

async function handlePaymentEvent(paymentId: string): Promise<void> {
  const admin = createAdminClient()
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })

  const paymentClient = new Payment(client)
  const payment = await paymentClient.get({ id: paymentId })

  if (payment.status !== 'approved') return

  const payerEmail = payment.payer?.email
  const courseSlug = payment.external_reference

  if (!payerEmail || !courseSlug) {
    console.error('MP webhook payment: missing payer email or course slug')
    return
  }

  // Find user by email
  const { data: userData } = await admin.auth.admin.listUsers()
  const user = userData?.users?.find(u => u.email === payerEmail)
  if (!user) {
    console.error('MP webhook payment: user not found for email', payerEmail)
    return
  }

  // Find course by slug
  const { data: course } = await admin
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()
  if (!course) {
    console.error('MP webhook payment: course not found for slug', courseSlug)
    return
  }

  // Idempotency check
  const { data: existingPayment } = await admin
    .from('payments')
    .select('id')
    .eq('provider_payment_id', String(paymentId))
    .single()
  if (existingPayment) return

  await admin.from('payments').insert({
    user_id: user.id,
    course_id: course.id,
    provider: 'mercadopago',
    provider_payment_id: String(paymentId),
    amount: payment.transaction_amount,
    currency: 'ARS',
    status: 'approved',
  })

  await admin.from('enrollments').upsert({
    user_id: user.id,
    course_id: course.id,
    expires_at: null,
  })

  try {
    await sendWelcomeEmail({
      to: payerEmail,
      studentName: payerEmail.split('@')[0],
      courseTitle: courseSlug,
      courseSlug,
    })
  } catch (emailError) {
    console.error('Welcome email error (non-fatal):', emailError)
  }
}

async function handlePreapprovalEvent(preapprovalId: string): Promise<void> {
  const admin = createAdminClient()

  const res = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  )

  if (!res.ok) {
    console.error('MP webhook preapproval: fetch failed', preapprovalId)
    return
  }

  const preapproval = await res.json()
  const externalRef = preapproval.external_reference as string | undefined

  if (!externalRef || !externalRef.includes('|')) {
    console.error('MP webhook preapproval: invalid external_reference', externalRef)
    return
  }

  const [userId, plan] = externalRef.split('|')

  if (preapproval.status === 'authorized') {
    const { error: upsertError } = await admin.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        mp_preapproval_id: preapproval.id,
        status: 'active',
        current_period_end: preapproval.next_payment_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'mp_preapproval_id' }
    )
    if (upsertError) {
      console.error('MP webhook preapproval: subscription upsert failed', upsertError)
      return
    }

    const { error: updateError } = await admin.from('profiles').update({ plan }).eq('id', userId)
    if (updateError) {
      console.error('MP webhook preapproval: profile plan update failed', updateError)
      // Don't return — subscription is recorded, profile will be fixed on next webhook
    }

  } else if (preapproval.status === 'paused' || preapproval.status === 'cancelled') {
    const { error: statusError } = await admin
      .from('subscriptions')
      .update({ status: preapproval.status, updated_at: new Date().toISOString() })
      .eq('mp_preapproval_id', preapproval.id)
    if (statusError) {
      console.error('MP webhook preapproval: subscription status update failed', statusError)
    }
    const { error: downgradeError } = await admin.from('profiles').update({ plan: 'free' }).eq('id', userId)
    if (downgradeError) {
      console.error('MP webhook preapproval: profile downgrade failed', downgradeError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topic: string = body.type ?? body.topic ?? ''
    const dataId: string = String(body.data?.id ?? body.id ?? '')

    if (!dataId) return NextResponse.json({ ok: true })

    // Verify HMAC signature
    if (!verifyMpSignature(request, dataId)) {
      console.error('MP webhook: invalid signature for id', dataId)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (topic === 'payment') {
      await handlePaymentEvent(dataId)
    } else if (topic === 'preapproval') {
      await handlePreapprovalEvent(dataId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
