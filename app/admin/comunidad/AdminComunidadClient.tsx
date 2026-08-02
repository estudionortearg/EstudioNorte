'use client'

import { useState } from 'react'

interface PendingPost {
  id: string
  title: string
  body: string
  category: string | null
  lesson_id: string | null
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

interface ModerationLog {
  id: string
  post_id: string
  reason: string
  action: string
  created_at: string
}

interface Props {
  pending: PendingPost[]
  logs: ModerationLog[]
}

export default function AdminComunidadClient({ pending: initialPending, logs }: Props) {
  const [pending, setPending] = useState(initialPending)
  const [processing, setProcessing] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'logs'>('pending')

  const moderate = async (postId: string, action: 'approve' | 'hide') => {
    setProcessing(postId)
    await fetch('/api/admin/community/moderate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, action }),
    })
    setPending(prev => prev.filter(p => p.id !== postId))
    setProcessing(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '4px' }}>
            Moderación de Comunidad
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)' }}>
            Revisá y aprobá posts marcados por el sistema
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--en-border)', paddingBottom: '0' }}>
          {(['pending', 'logs'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--en-surface)' : 'transparent',
                color: tab === t ? 'var(--en-text)' : 'var(--en-text-soft)',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: tab === t ? 600 : 400,
                borderBottom: tab === t ? '2px solid var(--en-green)' : 'none',
              }}
            >
              {t === 'pending' ? `Pendientes (${pending.length})` : 'Historial'}
            </button>
          ))}
        </div>

        {tab === 'pending' ? (
          pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '14px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--en-text-soft)' }}>
                ✅ No hay posts pendientes de revisión
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map(post => (
                <div key={post.id} style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '14px', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', marginBottom: '4px' }}>
                        {post.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>
                        {post.profiles?.full_name || 'Alumno'} · {new Date(post.created_at).toLocaleString('es-AR')}
                        {post.category && <span style={{ marginLeft: '8px', color: 'var(--en-green)' }}>#{post.category}</span>}
                        {post.lesson_id && <span style={{ marginLeft: '8px', color: 'var(--en-green)' }}>📹 Pregunta de lección</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => moderate(post.id, 'approve')}
                        disabled={processing === post.id}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: 'var(--en-green)', color: '#fff',
                          fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                          opacity: processing === post.id ? 0.6 : 1,
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => moderate(post.id, 'hide')}
                        disabled={processing === post.id}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--en-coral)', cursor: 'pointer',
                          background: 'transparent', color: 'var(--en-coral)',
                          fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                          opacity: processing === post.id ? 0.6 : 1,
                        }}
                      >
                        Ocultar
                      </button>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {post.body}
                  </p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '14px', overflow: 'hidden' }}>
            {logs.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', padding: '24px', textAlign: 'center' }}>Sin historial aún</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--en-border)' }}>
                    {['Post ID', 'Razón', 'Acción', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--en-text-soft)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--en-border)' : 'none' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>{log.post_id.slice(0, 8)}…</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text)' }}>{log.reason}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
                        <span style={{ color: log.action === 'approved' ? 'var(--en-green)' : 'var(--en-coral)', fontWeight: 600 }}>{log.action}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>{new Date(log.created_at).toLocaleDateString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
