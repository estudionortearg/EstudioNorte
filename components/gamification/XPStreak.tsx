interface XPStreakProps {
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  badgesCount: number
}

function isStreakAtRisk(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return false
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  return lastActivityDate === twoDaysAgo
}

export default function XPStreak({ totalXp, currentStreak, longestStreak, lastActivityDate, badgesCount }: XPStreakProps) {
  const atRisk = isStreakAtRisk(lastActivityDate)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '10px',
      marginBottom: '24px',
    }}>
      {/* XP Total */}
      <div style={{
        background: 'var(--en-surface)',
        border: '1px solid var(--en-border)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-green)', letterSpacing: '-1px', lineHeight: 1 }}>
          {totalXp}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          XP total
        </div>
      </div>

      {/* Racha */}
      <div style={{
        background: 'var(--en-surface)',
        border: `1px solid ${atRisk ? 'rgba(232,115,90,0.3)' : 'var(--en-border)'}`,
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
        position: 'relative' as const,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '20px', animation: atRisk ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
            {currentStreak > 0 ? '🔥' : '💤'}
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: atRisk ? 'var(--en-coral)' : 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
            {currentStreak}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: atRisk ? 'var(--en-coral)' : 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {atRisk ? '¡En riesgo!' : 'días de racha'}
        </div>
      </div>

      {/* Longest streak (unused prop surfaced) */}
      <div style={{
        background: 'var(--en-surface)',
        border: '1px solid var(--en-border)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
          {longestStreak}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          mejor racha
        </div>
      </div>

      {/* Badges */}
      <div style={{
        background: 'var(--en-surface)',
        border: '1px solid var(--en-border)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--en-shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
          {badgesCount}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          badges
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
