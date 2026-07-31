'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import BadgeGrid from '@/components/gamification/BadgeGrid'

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
  id: string; status: string; requested_at: string;
  rewards: { title: string; type: string; xp_cost: number } | null
}

interface Props {
  email: string
  fullName: string
  avatarUrl: string | null
  createdAt: string
  enrollmentsCount: number
  lessonsCompleted: number
  payments: Payment[]
  allBadges: Badge[]
  earnedBadges: EarnedBadge[]
  activeRewards: Reward[]
  myRequests: RewardRequest[]
  totalXp: number
}

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

export default function PerfilClient({ email, fullName, avatarUrl, createdAt, enrollmentsCount, lessonsCompleted, payments, allBadges, earnedBadges, activeRewards, myRequests, totalXp }: Props) {
  const [name, setName] = useState(fullName)
  const [inputName, setInputName] = useState(fullName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'pagos' | 'badges' | 'recompensas' | 'canjes'>('info')
  const inputRef = useRef<HTMLInputElement>(null)

  const memberSince = new Date(createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const initials = getInitials(name || inputName, email)
  const isDirty = inputName !== name

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <div style={{
        height: '56px', background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,40px)', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(247,247,242,0.35)', textDecoration: 'none', fontSize: '13px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </Link>
        <span style={{ fontSize: '13px', color: 'rgba(247,247,242,0.25)' }}>Mi Perfil</span>
        <div style={{ width: '80px' }}/>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,24px)' }}>

        {/* Avatar + name hero */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px',
          padding: '28px 32px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at 100% 0%, rgba(78,205,196,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(255,107,107,0.15))',
            border: '2px solid rgba(78,205,196,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-teal)', letterSpacing: '-1px',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
            ) : initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', marginBottom: '4px' }}>
              Miembro desde {memberSince}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name || email.split('@')[0]}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(247,247,242,0.3)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Cursos', value: enrollmentsCount, icon: '◎', color: 'var(--color-teal)' },
            { label: 'Clases completadas', value: lessonsCompleted, icon: '✓', color: 'var(--color-coral)' },
            { label: 'Pagos realizados', value: payments.length, icon: '$', color: 'rgba(247,247,242,0.4)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: color, fontWeight: 700, marginBottom: '6px' }}>{icon}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--color-text)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(247,247,242,0.25)', marginTop: '4px', lineHeight: 1.3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px' }}>
          {([['info', 'Mis datos'], ['pagos', 'Mis pagos'], ['badges', 'Badges'], ['recompensas', 'Recompensas'], ['canjes', 'Mis canjes']] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer', border: 'none',
                background: activeTab === tab ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: activeTab === tab ? 'var(--color-text)' : 'rgba(247,247,242,0.3)',
                fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Mis datos */}
        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Nombre */}
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.3)', marginBottom: '10px' }}>
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
                    flex: 1, padding: '11px 14px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${isDirty ? 'rgba(78,205,196,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-body)',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  style={{
                    padding: '11px 20px', borderRadius: '10px', cursor: isDirty ? 'pointer' : 'default',
                    background: saved ? 'rgba(78,205,196,0.15)' : isDirty ? 'var(--color-teal)' : 'rgba(255,255,255,0.04)',
                    color: saved ? 'var(--color-teal)' : isDirty ? '#0C0C18' : 'rgba(247,247,242,0.2)',
                    border: saved ? '1px solid rgba(78,205,196,0.2)' : 'none',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(247,247,242,0.2)', marginTop: '8px' }}>
                Este nombre aparece en tus certificados
              </p>
            </div>

            {/* Email (readonly) */}
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.3)', marginBottom: '10px' }}>
                Email
              </label>
              <div style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(247,247,242,0.4)', fontSize: '14px' }}>
                {email}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(247,247,242,0.2)', marginTop: '8px' }}>
                El email no se puede cambiar. Es tu forma de acceder a la plataforma.
              </p>
            </div>

            {/* Acciones */}
            <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'rgba(247,247,242,0.5)', marginBottom: '2px' }}>Cerrar sesión</p>
                <p style={{ fontSize: '11px', color: 'rgba(247,247,242,0.2)' }}>Salís de tu cuenta en este dispositivo</p>
              </div>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" style={{ padding: '9px 18px', borderRadius: '9px', cursor: 'pointer', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', color: 'var(--color-coral)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
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
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '4px' }}>
              Tu saldo: <strong style={{ color: 'var(--en-green)' }}>{totalXp} XP</strong>
            </div>
            {activeRewards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                No hay recompensas disponibles por ahora.
              </div>
            ) : activeRewards.map(reward => {
              const canAfford = totalXp >= reward.xp_cost
              const hasPending = myRequests.some(r => r.rewards && r.status === 'pending' && r.id === reward.id)
              const typeLabel = reward.type === 'course' ? '🎓 Curso gratis' : reward.type === 'discount' ? '💸 Descuento' : '🤝 Mentoría'
              return (
                <div key={reward.id} style={{
                  padding: '20px', borderRadius: '14px',
                  background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginBottom: '4px' }}>{typeLabel}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)' }}>{reward.title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginTop: '2px' }}>{reward.description}</div>
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
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
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
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>
                      {req.rewards?.title || 'Recompensa'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
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
              <div style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>💳</p>
                <p style={{ fontSize: '14px', color: 'rgba(247,247,242,0.3)' }}>No hay pagos registrados todavía</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payments.map((p, i) => {
                  const date = new Date(p.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                  const amount = p.currency === 'ARS'
                    ? '$' + p.amount.toLocaleString('es-AR')
                    : 'U$D ' + p.amount
                  return (
                    <div key={i} style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-teal)', fontWeight: 700, flexShrink: 0 }}>
                          {p.provider === 'mercadopago' ? 'MP' : 'ST'}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', color: 'rgba(247,247,242,0.7)', fontWeight: 600 }}>{amount}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(247,247,242,0.25)', marginTop: '2px' }}>{date}</p>
                        </div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600, background: 'rgba(78,205,196,0.08)', color: 'var(--color-teal)', border: '1px solid rgba(78,205,196,0.15)' }}>
                        Aprobado
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
