'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Badge {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  condition_type: string
  condition_value: number
  is_active: boolean
}

interface Reward {
  id: string
  title: string
  description: string
  type: string
  xp_cost: number
  stock: number | null
  is_active: boolean
}

interface PendingRequest {
  id: string
  requested_at: string
  user_id: string
  rewards: { title: string; xp_cost: number; type: string } | null
  profiles: { full_name: string | null } | null
  user_xp: number
}

interface Props {
  badges: Badge[]
  rewards: Reward[]
  pendingRequests: PendingRequest[]
}

type Tab = 'badges' | 'rewards' | 'canjes'

export default function GamificacionClient({ badges, rewards, pendingRequests }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('canjes')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [processed, setProcessed] = useState<Set<string>>(new Set())

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId)
    try {
      const res = await fetch(`/api/rewards/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(`Error: ${data.error || 'Error al procesar'}`)
        setProcessingId(null)
        return
      }
      setProcessed(prev => new Set([...prev, requestId]))
    } catch {
      alert('Error de conexión')
    }
    setProcessingId(null)
  }

  const pendingVisible = pendingRequests.filter(r => !processed.has(r.id))

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    flex: 1,
    padding: '9px',
    borderRadius: '9px',
    cursor: 'pointer',
    border: 'none',
    background: activeTab === tab ? 'var(--en-green-light)' : 'transparent',
    color: activeTab === tab ? 'var(--en-green)' : 'var(--en-text-soft)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: activeTab === tab ? 600 : 400,
    transition: 'all 0.2s ease',
  })

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>
          ← Admin
        </Link>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '6px' }}>
            Gestión
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--en-text)' }}>
            Gamificación
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '28px',
        background: 'var(--en-surface)', borderRadius: '12px', padding: '4px',
        border: '1px solid var(--en-border)',
      }}>
        {([
          ['canjes', `Canjes pendientes (${pendingVisible.length})`],
          ['badges', 'Badges'],
          ['rewards', 'Recompensas'],
        ] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Canjes */}
      {activeTab === 'canjes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingVisible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
              No hay canjes pendientes.
            </div>
          )}
          {pendingVisible.map(req => {
            const typeLabel = req.rewards?.type === 'course' ? '🎓' : req.rewards?.type === 'discount' ? '💸' : '🤝'
            const date = new Date(req.requested_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
            const canApprove = req.user_xp >= (req.rewards?.xp_cost || 0)
            return (
              <div key={req.id} style={{
                padding: '20px', borderRadius: '14px',
                background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>
                    {typeLabel} {req.rewards?.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '4px' }}>
                    {req.profiles?.full_name || 'Alumno'} · {req.rewards?.xp_cost} XP · {date}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '12px', marginTop: '2px',
                    color: canApprove ? 'var(--en-green)' : 'var(--en-coral)',
                  }}>
                    XP actual del alumno: {req.user_xp} {!canApprove && '⚠️ insuficiente'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleRequest(req.id, 'approve')}
                    disabled={processingId === req.id || !canApprove}
                    style={{
                      padding: '9px 18px', borderRadius: '10px', border: 'none',
                      background: canApprove ? 'var(--en-green)' : 'var(--en-border)',
                      color: canApprove ? 'var(--en-bg)' : 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                      cursor: canApprove && processingId !== req.id ? 'pointer' : 'not-allowed',
                      opacity: processingId === req.id ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {processingId === req.id ? '...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, 'reject')}
                    disabled={processingId === req.id}
                    style={{
                      padding: '9px 18px', borderRadius: '10px',
                      border: '1px solid var(--en-coral)',
                      background: 'transparent', color: 'var(--en-coral)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                      cursor: processingId !== req.id ? 'pointer' : 'not-allowed',
                      opacity: processingId === req.id ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Badges */}
      {activeTab === 'badges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {badges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
              No hay badges configurados aún.
            </div>
          )}
          {badges.map(badge => (
            <div key={badge.id} style={{
              padding: '16px 20px', borderRadius: '14px',
              background: 'var(--en-surface)', border: '1px solid var(--en-border)',
              display: 'flex', alignItems: 'center', gap: '16px',
              opacity: badge.is_active ? 1 : 0.5,
            }}>
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{badge.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>
                  {badge.name}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
                  {badge.description}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '2px', fontStyle: 'italic' }}>
                  Condición: {badge.condition_type} ≥ {badge.condition_value}
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '100px', flexShrink: 0,
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                color: badge.is_active ? 'var(--en-green)' : 'var(--en-text-soft)',
                border: `1px solid ${badge.is_active ? 'var(--en-green-15)' : 'var(--en-border)'}`,
              }}>
                {badge.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', textAlign: 'center', marginTop: '8px' }}>
            Para editar badges, usar el SQL Editor de Supabase por ahora.
          </p>
        </div>
      )}

      {/* Tab: Recompensas */}
      {activeTab === 'rewards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rewards.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--en-text-soft)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
              No hay recompensas configuradas aún.
            </div>
          )}
          {rewards.map(reward => {
            const typeLabel = reward.type === 'course' ? '🎓 Curso gratis' : reward.type === 'discount' ? '💸 Descuento' : '🤝 Mentoría'
            return (
              <div key={reward.id} style={{
                padding: '16px 20px', borderRadius: '14px',
                background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: reward.is_active ? 1 : 0.5,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginBottom: '2px' }}>{typeLabel}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)' }}>{reward.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '2px' }}>{reward.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--en-green)' }}>{reward.xp_cost} XP</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '2px' }}>
                    Stock: {reward.stock === null ? '∞' : reward.stock}
                  </div>
                </div>
              </div>
            )
          })}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', textAlign: 'center', marginTop: '8px' }}>
            Para crear o editar recompensas, usar el SQL Editor de Supabase por ahora.
          </p>
        </div>
      )}
    </div>
  )
}
