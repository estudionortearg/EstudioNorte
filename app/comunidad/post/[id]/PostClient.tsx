'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Profile { full_name: string | null; avatar_url: string | null; is_admin: boolean | null }

interface Reply {
  id: string
  body: string
  is_bot: boolean
  reaction_count: number
  created_at: string
  profiles: Profile | null
}

interface Post {
  id: string
  title: string
  body: string
  category: string | null
  lesson_id: string | null
  solution_reply_id: string | null
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  reaction_count: number
  created_at: string
  profiles: Profile | null
}

interface Props {
  post: Post
  initialReplies: Reply[]
  userId: string
  isAdmin: boolean
  myReactedPostIds: string[]
  myReactedReplyIds: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  general: '💬 General', branding: '🎨 Branding', ia: '🤖 IA & Herramientas',
  trabajos: '✨ Mis trabajos', dudas: '🙋 Dudas',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

function Avatar({ profile, size = 36 }: { profile: Profile | null; size?: number }) {
  const initials = (profile?.full_name || '?').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--en-green)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size * 0.33, color: '#fff',
      overflow: 'hidden',
    }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : initials}
    </div>
  )
}

export default function PostClient({ post, initialReplies, userId, isAdmin, myReactedPostIds, myReactedReplyIds }: Props) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [postLiked, setPostLiked] = useState(myReactedPostIds.includes(post.id))
  const [postReactions, setPostReactions] = useState(post.reaction_count)
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set(myReactedReplyIds))
  const [replyReactions, setReplyReactions] = useState<Record<string, number>>(
    Object.fromEntries(initialReplies.map(r => [r.id, r.reaction_count]))
  )
  const [solution, setSolution] = useState<string | null>(post.solution_reply_id)
  const [xpMsg, setXpMsg] = useState('')

  const canMarkSolution = post.profiles !== null && (userId === (post as any).user_id || isAdmin)

  const handleReply = async () => {
    if (!replyBody.trim()) return
    setSending(true); setReplyError('')
    const res = await fetch('/api/community/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id, body: replyBody.trim() }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setReplyError(data.error || 'Error al responder'); return }
    setReplies(prev => [...prev, { ...data.reply, profiles: null }])
    setReplyBody('')
    if (data.xp_earned) setXpMsg(`+${data.xp_earned} XP`)
  }

  const togglePostLike = async () => {
    const res = await fetch('/api/community/reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    })
    const data = await res.json()
    setPostLiked(data.liked)
    setPostReactions(prev => data.liked ? prev + 1 : prev - 1)
  }

  const toggleReplyLike = async (replyId: string) => {
    const res = await fetch('/api/community/reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply_id: replyId }),
    })
    const data = await res.json()
    setLikedReplies(prev => {
      const next = new Set(prev)
      data.liked ? next.add(replyId) : next.delete(replyId)
      return next
    })
    setReplyReactions(prev => ({ ...prev, [replyId]: (prev[replyId] || 0) + (data.liked ? 1 : -1) }))
  }

  const markSolution = async (replyId: string) => {
    const next = solution === replyId ? null : replyId
    await fetch(`/api/community/posts/${post.id}/solution`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply_id: next }),
    })
    setSolution(next)
    if (next) setXpMsg('+50 XP a quien respondió!')
  }

  const categoryLabel = post.category ? CATEGORY_LABELS[post.category] : null

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>

      {/* Post */}
      <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', padding: '24px 28px', marginBottom: '16px' }}>
        {categoryLabel && (
          <Link href={`/comunidad/${post.category}`} style={{ display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.6px', textDecoration: 'none', marginBottom: '10px' }}>
            {categoryLabel}
          </Link>
        )}
        {solution && (
          <div style={{ display: 'inline-block', marginLeft: categoryLabel ? '10px' : 0, fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            ✅ Resuelto
          </div>
        )}
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(20px, 3vw, 26px)', letterSpacing: '-0.8px', color: 'var(--en-text)', lineHeight: 1.2, marginBottom: '16px' }}>
          {post.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Avatar profile={post.profiles} size={32} />
          <div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)' }}>
              {post.profiles?.full_name || 'Alumno'}
            </span>
            {post.profiles?.is_admin && (
              <span style={{ marginLeft: '6px', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</span>
            )}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', marginLeft: '8px' }}>{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--en-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
          {post.body}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={togglePostLike} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            borderRadius: '8px', cursor: 'pointer', border: 'none',
            background: postLiked ? 'var(--en-green-light)' : 'var(--en-bg)',
            color: postLiked ? 'var(--en-green)' : 'var(--en-text-soft)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
          }}>
            ❤️ {postReactions}
          </button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
            💬 {replies.length} respuestas
          </span>
          {xpMsg && <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>{xpMsg}</span>}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {replies.map(reply => {
            const isSolution = solution === reply.id
            const liked = likedReplies.has(reply.id)
            return (
              <div key={reply.id} style={{
                background: isSolution
                  ? 'color-mix(in srgb, var(--en-green) 5%, var(--en-surface))'
                  : reply.is_bot ? 'color-mix(in srgb, var(--en-green) 3%, var(--en-surface))' : 'var(--en-surface)',
                border: `1px solid ${isSolution ? 'var(--en-green-15)' : 'var(--en-border)'}`,
                borderRadius: '14px', padding: '18px 22px',
              }}>
                {isSolution && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    ✅ Respuesta solución
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {reply.is_bot ? (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--en-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🤖</div>
                  ) : (
                    <Avatar profile={reply.profiles} size={32} />
                  )}
                  <div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)' }}>
                      {reply.is_bot ? 'Bot Estudio Norte' : reply.profiles?.full_name || 'Alumno'}
                    </span>
                    {reply.profiles?.is_admin && !reply.is_bot && (
                      <span style={{ marginLeft: '6px', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</span>
                    )}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', marginLeft: '8px' }}>{timeAgo(reply.created_at)}</span>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                  {reply.body}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!reply.is_bot && (
                    <button onClick={() => toggleReplyLike(reply.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                      borderRadius: '7px', cursor: 'pointer', border: 'none',
                      background: liked ? 'var(--en-green-light)' : 'var(--en-bg)',
                      color: liked ? 'var(--en-green)' : 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '12px',
                    }}>
                      ❤️ {replyReactions[reply.id] ?? reply.reaction_count}
                    </button>
                  )}
                  {canMarkSolution && !reply.is_bot && !post.is_locked && (
                    <button onClick={() => markSolution(reply.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                      borderRadius: '7px', cursor: 'pointer', border: '1px solid var(--en-border)',
                      background: isSolution ? 'var(--en-green)' : 'transparent',
                      color: isSolution ? '#fff' : 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                    }}>
                      {isSolution ? '✅ Solución' : 'Marcar solución'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reply box */}
      {!post.is_locked ? (
        <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '14px', padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)', marginBottom: '10px' }}>
            Tu respuesta
          </p>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="Escribí tu respuesta..."
            rows={4}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
              background: 'var(--en-white)', border: '2px solid var(--en-border)',
              color: 'var(--en-text)', fontSize: '14px', fontFamily: 'var(--font-body)',
              outline: 'none', resize: 'vertical', lineHeight: 1.6, marginBottom: '10px',
            }}
          />
          {replyError && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-coral)', marginBottom: '8px' }}>{replyError}</p>
          )}
          <button
            onClick={handleReply}
            disabled={sending || !replyBody.trim()}
            style={{
              padding: '10px 20px', borderRadius: '9px', cursor: 'pointer', border: 'none',
              background: 'var(--en-green)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              opacity: (sending || !replyBody.trim()) ? 0.6 : 1,
            }}
          >
            {sending ? 'Enviando...' : 'Responder +5 XP'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'var(--en-surface)', border: '1px solid var(--en-border)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textAlign: 'center' }}>
          🔒 Este hilo está cerrado
        </div>
      )}
    </div>
  )
}
