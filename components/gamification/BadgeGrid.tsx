interface Badge {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  condition_type: string
  condition_value: number
}

interface EarnedBadge {
  badge: Badge
  earned_at: string
  course_id: string | null
}

interface BadgeGridProps {
  earnedBadges: EarnedBadge[]
  allBadges: Badge[]
}

export default function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map(e => e.badge.id))

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '12px',
    }}>
      {allBadges.map(badge => {
        const earned = earnedIds.has(badge.id)
        const earnedEntry = earnedBadges.find(e => e.badge.id === badge.id)
        const earnedDate = earnedEntry
          ? new Date(earnedEntry.earned_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
          : null

        return (
          <div key={badge.id} style={{
            background: 'var(--en-surface)',
            border: `1px solid ${earned ? 'var(--en-green-15)' : 'var(--en-border)'}`,
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center' as const,
            opacity: earned ? 1 : 0.45,
            transition: 'opacity 0.2s',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(100%)' }}>
              {badge.emoji}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: 'var(--en-text)', marginBottom: '4px' }}>
              {badge.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)', lineHeight: 1.3 }}>
              {earned ? `Ganado el ${earnedDate}` : badge.description}
            </div>
          </div>
        )
      })}
    </div>
  )
}
