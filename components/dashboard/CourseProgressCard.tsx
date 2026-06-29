import RadialProgress from './RadialProgress'
import { Button } from '@/components/ui'

interface CourseProgressCardProps {
  courseSlug: string
  courseTitle: string
  progressPercent: number
  lastLessonSlug?: string
  lastLessonTitle?: string
}

export default function CourseProgressCard({
  courseSlug, courseTitle, progressPercent, lastLessonSlug, lastLessonTitle
}: CourseProgressCardProps) {
  const isComplete = progressPercent === 100

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border-mid)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <RadialProgress percent={progressPercent} size={64} />
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '18px',
            color: 'var(--color-text)',
            lineHeight: 1.3,
            marginBottom: '6px',
          }}>{courseTitle}</h3>
          {lastLessonTitle && !isComplete && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Próximo: {lastLessonTitle}
            </p>
          )}
          {isComplete && (
            <p style={{ fontSize: '13px', color: 'var(--color-teal)', fontWeight: 500 }}>
              ✓ Completado
            </p>
          )}
        </div>
      </div>

      {isComplete ? (
        <Button href={`/certificados/${courseSlug}`} variant="secondary" size="sm">
          Descargar certificado
        </Button>
      ) : (
        <Button
          href={lastLessonSlug ? `/aprender/${courseSlug}/${lastLessonSlug}` : `/aprender/${courseSlug}`}
          variant="primary"
          size="sm"
        >
          Continuar →
        </Button>
      )}
    </div>
  )
}
