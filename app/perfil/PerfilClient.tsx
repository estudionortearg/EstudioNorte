'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import BadgeGrid from '@/components/gamification/BadgeGrid'
import StudentSidebar from '@/components/layout/StudentSidebar'

interface Payment {
  amount: number
  currency: string
  created_at: string
  provider: string
  status: string
}

interface Badge {
  id: string; slug: string; name: string; emoji: string; description: string;
  condition_type: string; condition_value: number;
}

interface EarnedBadge { badge: Badge; earned_at: string; course_id: string | null }

interface Reward {
  id: string; title: string; description: string; type: string; xp_cost: number; stock: number | null
}

interface RewardRequest {
  id: string; reward_id: string; status: string; requested_at: string;
  rewards: { title: string; type: string; xp_cost: number } | null
}

interface Props {
  email: string
  fullName: string
  avatarUrl: string | null
  bannerUrl: string | null
  createdAt: string
  plan: string
  enrollmentsCount: number
  lessonsCompleted: number
  payments: Payment[]
  allBadges: Badge[]
  earnedBadges: EarnedBadge[]
  activeRewards: Reward[]
  myRequests: RewardRequest[]
  totalXp: number
}

// Preset banner gradients
const BANNER_PRESETS = [
  { key: 'linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)', label: 'Verde' },
  { key: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)', label: 'Azul' },
  { key: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)', label: 'Violeta' },
  { key: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 60%, #991b1b 100%)', label: 'Rojo' },
  { key: 'linear-gradient(135deg, #d97706 0%, #b45309 60%, #92400e 100%)', label: 'Naranja' },
  { key: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)', label: 'Noche' },
]

const DEFAULT_BANNER = 'linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)'

function RedeemButton({ rewardId, canAfford, hasPending }: { rewardId: string; canAfford: boolean; hasPending: boolean }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRedeem = async () => {
    if (!canAfford || hasPending || loading || done) return
    setLoading(true)
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reward_id: rewardId }),
    })
    setLoading(false)
    if (res.ok) setDone(true)
  }

  if (done || hasPending) return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', padding: '8px 14px', borderRadius: '8px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
      Solicitud enviada
    </span>
  )

  return (
    <button
      onClick={handleRedeem}
      disabled={!canAfford || loading}
      style={{
        padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
        background: canAfford ? 'var(--en-green)' : 'var(--en-border)',
        color: canAfford ? 'var(--en-white)' : 'var(--en-text-soft)',
        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? '...' : canAfford ? 'Canjear' : 'XP insuficiente'}
    </button>
  )
}

function getInitials(name: string, email: string) {
  if (name) return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

const TABS = [
  { key: 'info', label: 'Mis datos' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'badges', label: 'Badges' },
  { key: 'recompensas', label: 'Recompensas' },
  { key: 'canjes', label: 'Mis canjes' },
] as const

type Tab = typeof TABS[number]['key']

export default function PerfilClient({ email, fullName, avatarUrl, bannerUrl, createdAt, plan, enrollmentsCount, lessonsCompleted, payments, allBadges, earnedBadges, activeRewards, myRequests, totalXp }: Props) {
  const [name, setName] = useState(fullName)
  const [inputName, setInputName] = useState(fullName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const inputRef = useRef<HTMLInputElement>(null)

  // Avatar state
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(avatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Banner state
  const [currentBanner, setCurrentBanner] = useState<string | null>(bannerUrl)
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const memberSince = new Date(createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const initials = getInitials(name || inputName, email)
  const displayName = name || 'Sin nombre'
  const isDirty = inputName !== name
  const planLabel = plan === 'norte_pro' ? 'Norte Pro' : plan === 'norte' ? 'Norte' : 'Gratuito'

  const bannerStyle = (() => {
    const b = currentBanner || DEFAULT_BANNER
    if (b.startsWith('http')) {
      return { backgroundImage: `url(${b})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    return { background: b }
  })()

  const handleSave = async () => {
    if (!isDirty || saving) return
    setSaving(true)
    try {
      await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: inputName }),
      })
      setName(inputName)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/perfil/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setCurrentAvatar(data.url)
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleBannerPreset = async (gradient: string) => {
    setBannerPickerOpen(false)
    setCurrentBanner(gradient)
    await fetch('/api/perfil/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradient }),
    })
  }

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    setBannerPickerOpen(false)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/perfil/banner', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setCurrentBanner(data.url)
    } finally {
      setBannerUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', fontFamily: 'var(--font-body)' }}>

      {/* Sticky top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: '12px', height: '60px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            Dashboard
          </Link>
          <span style={{ color: 'var(--en-border)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text)', fontWeight: 600 }}>Mi Perfil</span>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px) 96px' }}>

        {/* Profile banner */}
        <div style={{
          ...bannerStyle,
          borderRadius: '20px', padding: 'clamp(24px, 4vw, 36px) clamp(24px, 4vw, 40px)',
          marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>

          {/* Avatar with edit overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2.5px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: '#fff',
              letterSpacing: '-1px', overflow: 'hidden',
            }}>
              {currentAvatar ? (
                <img src={currentAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : initials}
            </div>
            {/* Camera button */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              title="Cambiar foto de perfil"
              style={{
                position: 'absolute', bottom: '-2px', right: '-4px',
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#fff', border: '2px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                padding: 0,
              }}
            >
              {avatarUploading ? (
                <span style={{ fontSize: '10px', color: '#666' }}>…</span>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange}/>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Miembro desde {memberSince}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 26px)', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </h1>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {enrollmentsCount} {enrollmentsCount === 1 ? 'curso inscripto' : 'cursos inscriptos'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {lessonsCompleted} {lessonsCompleted === 1 ? 'lección completada' : 'lecciones completadas'}
              </span>
            </div>
          </div>

          {/* Plan badge + XP */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', padding: '5px 12px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {planLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              {totalXp} XP
            </span>
          </div>

          {/* Banner edit button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setBannerPickerOpen(p => !p)}
              title="Cambiar fondo del banner"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '9px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
              }}
            >
              {bannerUploading ? '...' : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar fondo
                </>
              )}
            </button>

            {/* Banner picker dropdown */}
            {bannerPickerOpen && (
              <div style={{
                position: 'fixed', right: 'clamp(16px, 4vw, 40px)', top: '140px', zIndex: 50,
                background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                borderRadius: '14px', padding: '14px',
                boxShadow: 'var(--en-shadow-lg)',
                width: '240px',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--en-text-soft)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Presets
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {BANNER_PRESETS.map(p => (
                    <button
                      key={p.key}
                      onClick={() => handleBannerPreset(p.key)}
                      style={{
                        borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                        background: 'none',
                        outline: 'none',
                      }}
                    >
                      <span style={{
                        display: 'block', height: '36px', width: '100%', borderRadius: '7px', background: p.key,
                        outline: currentBanner === p.key ? '2px solid var(--en-green)' : '2px solid transparent',
                        outlineOffset: '2px',
                      }}/>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)' }}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--en-border)', paddingTop: '10px' }}>
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    style={{
                      width: '100%', padding: '9px', borderRadius: '9px', cursor: 'pointer',
                      background: 'transparent', border: '1.5px dashed var(--en-border)',
                      color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Subir imagen
                  </button>
                </div>
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerImageChange}/>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop to close picker */}
        {bannerPickerOpen && (
          <div
            onClick={() => setBannerPickerOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          />
        )}

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          <StudentSidebar activeRoute="/perfil" displayName={displayName} />

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '2px', marginBottom: '20px',
              background: 'var(--en-surface)', borderRadius: '12px', padding: '4px',
              border: '1px solid var(--en-border)', overflowX: 'auto',
            }}>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '9px', cursor: 'pointer', border: 'none',
                    background: activeTab === key ? 'var(--en-bg)' : 'transparent',
                    color: activeTab === key ? 'var(--en-text)' : 'var(--en-text-soft)',
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: activeTab === key ? 600 : 400,
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                    boxShadow: activeTab === key ? 'var(--en-shadow-sm)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Mis datos */}
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--en-text-soft)', marginBottom: '10px' }}>
                    Nombre completo
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      ref={inputRef}
                      value={inputName}
                      onChange={e => setInputName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      placeholder="Tu nombre completo"
                      style={{
                        flex: 1, padding: '13px 16px', borderRadius: '10px',
                        background: 'var(--en-white)', border: `2px solid ${isDirty ? 'var(--en-green)' : 'var(--en-border)'}`,
                        color: 'var(--en-text)', fontSize: '15px', fontFamily: 'var(--font-body)',
                        outline: 'none', transition: 'border-color 0.2s',
                        boxShadow: isDirty ? '0 0 0 3px color-mix(in srgb, var(--en-green) 12%, transparent)' : 'none',
                      }}
                    />
                    <button
                      onClick={handleSave}
                      disabled={!isDirty || saving}
                      style={{
                        padding: '11px 20px', borderRadius: '10px', cursor: isDirty ? 'pointer' : 'default',
                        background: saved ? 'var(--en-green-light)' : isDirty ? 'var(--en-green)' : 'var(--en-border)',
                        color: saved ? 'var(--en-green)' : isDirty ? 'var(--en-white)' : 'var(--en-text-faint)',
                        border: saved ? '1.5px solid var(--en-green-30)' : 'none',
                        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                        transition: 'all 0.2s', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
                    </button>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '8px' }}>
                    Este nombre aparece en tus certificados
                  </p>
                </div>

                {/* Avatar section */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--en-text-soft)', marginBottom: '14px' }}>
                    Foto de perfil
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--en-green)',
                      border: '2px solid var(--en-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: '#fff',
                      overflow: 'hidden',
                    }}>
                      {currentAvatar
                        ? <img src={currentAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : initials
                      }
                    </div>
                    <div>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        style={{
                          padding: '9px 18px', borderRadius: '9px', cursor: 'pointer',
                          background: 'var(--en-green)', border: 'none',
                          color: '#fff', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                          opacity: avatarUploading ? 0.6 : 1, display: 'block', marginBottom: '6px',
                        }}
                      >
                        {avatarUploading ? 'Subiendo...' : 'Subir foto'}
                      </button>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>
                        JPG, PNG o WebP · máx. 5 MB
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--en-text-soft)', marginBottom: '10px' }}>
                    Email
                  </label>
                  <div style={{ padding: '13px 16px', borderRadius: '10px', background: 'color-mix(in srgb, var(--en-border) 30%, var(--en-white))', border: '2px solid var(--en-border)', color: 'var(--en-text-soft)', fontSize: '15px', fontFamily: 'var(--font-body)' }}>
                    {email}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '8px' }}>
                    El email no se puede cambiar. Es tu forma de acceder a la plataforma.
                  </p>
                </div>

                <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text)', fontWeight: 600, marginBottom: '2px' }}>Cerrar sesión</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>Salís de tu cuenta en este dispositivo</p>
                  </div>
                  <form action="/api/auth/signout" method="POST">
                    <button type="submit" style={{
                      padding: '9px 18px', borderRadius: '9px', cursor: 'pointer',
                      background: 'color-mix(in srgb, var(--en-coral) 8%, var(--en-surface))',
                      border: '1px solid color-mix(in srgb, var(--en-coral) 20%, var(--en-border))',
                      color: 'var(--en-coral)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                    }}>
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab: Badges */}
            {activeTab === 'badges' && (
              <BadgeGrid earnedBadges={earnedBadges} allBadges={allBadges} />
            )}

            {/* Tab: Recompensas */}
            {activeTab === 'recompensas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '14px 18px', borderRadius: '12px',
                  background: 'var(--en-green-light)', border: '1px solid var(--en-green-15)',
                  fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                  </svg>
                  Tu saldo: <strong style={{ color: 'var(--en-green)' }}>{totalXp} XP</strong>
                </div>

                {activeRewards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                    No hay recompensas disponibles por ahora.
                  </div>
                ) : activeRewards.map(reward => {
                  const canAfford = totalXp >= reward.xp_cost
                  const hasPending = myRequests.some(r => r.status === 'pending' && r.reward_id === reward.id)
                  const typeLabel = reward.type === 'course' ? 'Curso gratis' : reward.type === 'discount' ? 'Descuento' : 'Mentoría'
                  return (
                    <div key={reward.id} style={{
                      padding: '20px', borderRadius: '14px',
                      background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--en-text-faint)', marginBottom: '4px' }}>{typeLabel}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', marginBottom: '2px' }}>{reward.title}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>{reward.description}</div>
                        {reward.stock !== null && (
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-coral)', marginTop: '4px' }}>
                            {reward.stock} disponibles
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--en-green)' }}>
                          {reward.xp_cost} XP
                        </div>
                        <RedeemButton rewardId={reward.id} canAfford={canAfford} hasPending={hasPending} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tab: Mis canjes */}
            {activeTab === 'canjes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px', borderRadius: '16px', background: 'var(--en-surface)', border: '1px solid var(--en-border)' }}>
                    No tenés solicitudes de canje todavía.
                  </div>
                ) : myRequests.map(req => {
                  const statusColor = req.status === 'approved' ? 'var(--en-green)' : req.status === 'rejected' ? 'var(--en-coral)' : 'var(--en-text-soft)'
                  const statusLabel = req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'
                  const date = new Date(req.requested_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                  return (
                    <div key={req.id} style={{
                      padding: '16px 20px', borderRadius: '12px',
                      background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)', marginBottom: '2px' }}>
                          {req.rewards?.title || 'Recompensa'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                          {req.rewards?.xp_cost} XP · {date}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '100px',
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                        color: statusColor, border: `1px solid ${statusColor}`,
                      }}>
                        {statusLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tab: Pagos */}
            {activeTab === 'pagos' && (
              <div>
                {payments.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '48px 24px', borderRadius: '16px',
                    background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="1.2" style={{ marginBottom: '16px' }}>
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)' }}>No hay pagos registrados todavía</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {payments.map((p, i) => {
                      const date = new Date(p.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                      const amount = p.currency === 'ARS'
                        ? '$' + p.amount.toLocaleString('es-AR')
                        : 'U$D ' + p.amount
                      return (
                        <div key={i} style={{
                          padding: '16px 20px', borderRadius: '14px',
                          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: 'var(--en-green-light)', border: '1px solid var(--en-green-30)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                              color: 'var(--en-green)', flexShrink: 0,
                            }}>
                              {p.provider === 'mercadopago' ? 'MP' : 'ST'}
                            </div>
                            <div>
                              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>{amount}</p>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '2px' }}>{date}</p>
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 10px', borderRadius: '100px',
                            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                            color: 'var(--en-green)', border: '1px solid var(--en-green-30)',
                            background: 'var(--en-green-light)',
                          }}>
                            Aprobado
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
