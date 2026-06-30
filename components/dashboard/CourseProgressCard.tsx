import Link from 'next/link'

interface CourseProgressCardProps {
  courseSlug: string
  courseTitle: string
  progressPercent: number
  lastLessonSlug?: string
  lastLessonTitle?: string
  totalLessons?: number
  completedLessons?: number
}

export default function CourseProgressCard({
  courseSlug, courseTitle, progressPercent, lastLessonSlug, lastLessonTitle,
  totalLessons = 0, completedLessons = 0,
}: CourseProgressCardProps) {
  const isComplete = progressPercent === 100
  const isStarted = progressPercent > 0

  return (
    <div style={{
      borderRadius: '18px', padding: '24px',
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${isComplete ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex', flexDirection: 'column', gap: '20px',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Glow top-right */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '140px', height: '140px',
        background: isComplete
          ? 'radial-gradient(circle at 100% 0%, rgba(78,205,196,0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle at 100% 0%, rgba(255,107,107,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isComplete && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
              background: 'rgba(78,205,196,0.1)', color: 'var(--color-teal)',
              border: '1px solid rgba(78,205,196,0.2)', fontFamily: 'var(--font-body)',
              letterSpacing: '0.5px', marginBottom: '8px',
            }}>
              ✓ Completado
            </span>
          )}
          {!isStarted && !isComplete && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(247,247,242,0.3)',
              border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-body)',
              marginBottom: '8px',
            }}>
              Sin comenzar
            </span>
          )}
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '17px', color: 'var(--color-text)',
            letterSpacing: '-0.5px', lineHeight: 1.3,
          }}>{courseTitle}</h3>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '22px', letterSpacing: '-1px', flexShrink: 0,
          color: isComplete ? 'var(--color-teal)' : isStarted ? 'var(--color-coral)' : 'rgba(247,247,242,0.2)',
        }}>
          {progressPercent}%
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{
          height: '4px', borderRadius: '100px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '100px',
            width: `${progressPercent}%`,
            background: isComplete
              ? 'var(--color-teal)'
              : 'linear-gradient(90deg, var(--color-coral), rgba(255,107,107,0.6))',
            transition: 'width 0.4s ease',
          }}/>
        </div>
        {totalLessons > 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', marginTop: '6px' }}>
            {completedLessons} de {totalLessons} clases completadas
          </p>
        )}
      </div>

      {/* Next lesson */}
      {lastLessonTitle && !isComplete && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.1)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path d="M1 1l8 5-8 5V1z" fill="rgba(255,107,107,0.8)"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(247,247,242,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Próxima clase</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.6)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastLessonTitle}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      {isComplete ? (
        <Link href={`/certificados/${courseSlug}`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px', borderRadius: '10px', textDecoration: 'none',
          background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.2)',
          color: 'var(--color-teal)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          Descargar certificado
        </Link>
      ) : (
        <Link
          href={lastLessonSlug ? `/aprender/${courseSlug}/${lastLessonSlug}` : `/aprender/${courseSlug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '11px', borderRadius: '10px', textDecoration: 'none',
            background: isStarted ? 'var(--color-coral)' : 'rgba(255,255,255,0.05)',
            border: isStarted ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: isStarted ? '#fff' : 'rgba(247,247,242,0.4)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
          }}
        >
          {isStarted ? 'Continuar →' : 'Comenzar curso →'}
        </Link>
      )}
    </div>
  )
}
