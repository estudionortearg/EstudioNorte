'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RankingEntry {
  user_id: string
  xp: number
  full_name: string | null
  avatar_url: string | null
}

interface RankingPanelProps {
  courseId: string
  userId: string
}

export default function RankingPanel({ courseId, userId }: RankingPanelProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [myPosition, setMyPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_course_xp')
        .select('user_id, xp, profiles(full_name, avatar_url)')
        .eq('course_id', courseId)
        .order('xp', { ascending: false })
        .limit(50)

      if (!data) { setLoading(false); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: RankingEntry[] = (data as any[]).map(r => {
        const profile = Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles ?? null
        return {
          user_id: r.user_id as string,
          xp: r.xp as number,
          full_name: (profile?.full_name as string | null) ?? null,
          avatar_url: (profile?.avatar_url as string | null) ?? null,
        }
      })

      const myIdx = entries.findIndex(e => e.user_id === userId)
      setMyPosition(myIdx === -1 ? null : myIdx + 1)
      setRanking(entries.slice(0, 10))
      setLoading(false)
    }
    load()
  }, [courseId, userId])

  if (loading) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
      Cargando ranking...
    </div>
  )

  if (ranking.length === 0) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
      Todavía no hay ranking para este curso.
    </div>
  )

  const isInTop10 = myPosition !== null && myPosition <= 10

  return (
    <div style={{ padding: '12px 0' }}>
      {ranking.map((entry, idx) => {
        const isMe = entry.user_id === userId
        const initials = entry.full_name
          ? entry.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
          : '?'
        return (
          <div key={entry.user_id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px',
            background: isMe ? 'var(--en-green-light)' : 'transparent',
            borderRadius: '10px',
            marginBottom: '2px',
          }}>
            <div style={{
              width: '20px', textAlign: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px',
              color: idx < 3 ? 'var(--en-green)' : 'var(--en-text-soft)',
            }}>
              {idx + 1}
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--en-green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '10px',
              color: 'var(--en-green)', flexShrink: 0,
            }}>
              {entry.avatar_url
                ? <img src={entry.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: isMe ? 600 : 400,
                color: isMe ? 'var(--en-green)' : 'var(--en-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.full_name || 'Alumno'}
                {isMe && ' (vos)'}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
              color: 'var(--en-green)', flexShrink: 0,
            }}>
              {entry.xp} XP
            </div>
          </div>
        )
      })}

      {!isInTop10 && myPosition !== null && (
        <>
          <div style={{ textAlign: 'center', padding: '8px', color: 'var(--en-text-soft)', fontSize: '18px' }}>···</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px',
            background: 'var(--en-green-light)',
            borderRadius: '10px',
          }}>
            <div style={{ width: '20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-text-soft)' }}>
              {myPosition}
            </div>
            <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)' }}>
              Vos
            </div>
          </div>
        </>
      )}
    </div>
  )
}
