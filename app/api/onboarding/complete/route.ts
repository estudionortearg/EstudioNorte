import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_INTERESTS = [
  'Diseño de marca', 'Logo con IA', 'Canva avanzado',
  'Contenido para redes', 'Conseguir clientes', 'Herramientas IA',
]

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interests } = await req.json()

  // Validate interests — filter to only known values
  const sanitizedInterests = Array.isArray(interests)
    ? interests.filter((i: unknown) => typeof i === 'string' && VALID_INTERESTS.includes(i))
    : []

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, interests: sanitizedInterests })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
