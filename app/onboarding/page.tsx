import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  // If already completed, skip to dashboard
  if (profile?.onboarding_completed) redirect('/dashboard')

  return (
    <OnboardingWizard
      userName={profile?.full_name || user.email?.split('@')[0] || 'estudiante'}
      userPlan={profile?.plan || 'free'}
    />
  )
}
