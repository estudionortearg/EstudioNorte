import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Supabase sometimes sends errors directly in query params (expired OTP, etc.)
  const urlError = searchParams.get('error')
  const urlErrorCode = searchParams.get('error_code')
  if (urlError) {
    const desc = urlErrorCode === 'otp_expired'
      ? 'El link expiró. Pedí uno nuevo.'
      : 'El link no es válido. Pedí uno nuevo.'
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(desc)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // PKCE verifier mismatch — most common when link opened in a different browser/tab
    const msg = error.message.includes('code verifier')
      ? 'El link debe abrirse en el mismo navegador donde pediste el acceso.'
      : 'El link expiró o ya fue usado. Pedí uno nuevo.'
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('El link no es válido. Pedí uno nuevo.')}`
  )
}
