'use client'

import { useState } from 'react'

interface Props {
  planSlug: 'norte' | 'norte_pro'
  ctaText: string
  ctaStyle: 'solid' | 'coral'
  currentUserPlan: string | null // null = not logged in
  thisPlan: string
}

export default function PreciosCTA({ planSlug, ctaText, ctaStyle, currentUserPlan, thisPlan }: Props) {
  const [loading, setLoading] = useState(false)

  const isCurrentPlan = currentUserPlan === thisPlan
  const isHigherPlan =
    (currentUserPlan === 'norte_pro' && thisPlan === 'norte')

  const disabled = isCurrentPlan || isHigherPlan || loading

  const label = isCurrentPlan
    ? 'Tu plan actual'
    : isHigherPlan
    ? 'Ya tenés un plan superior'
    : loading
    ? 'Redirigiendo...'
    : ctaText

  async function handleClick() {
    if (disabled) return

    // Not logged in — redirect to login with plan param
    if (currentUserPlan === null) {
      window.location.href = `/login?plan=${planSlug}`
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planSlug }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('No init_point received', data)
        setLoading(false)
      }
    } catch (err) {
      console.error('Subscription checkout error', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: '14px',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...(ctaStyle === 'solid' && {
          background: 'var(--en-white)',
          color: 'var(--en-green)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }),
        ...(ctaStyle === 'coral' && {
          background: 'var(--en-coral)',
          color: 'var(--en-white)',
          boxShadow: 'var(--en-shadow-coral)',
        }),
      }}
    >
      {label}
    </button>
  )
}
