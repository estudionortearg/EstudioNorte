import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '40px', color: 'var(--color-text)' }}>
          Mi dashboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
          Bienvenido, {user.email}
        </p>
      </div>
    </div>
  )
}
