'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VideoPlayer from '@/components/player/VideoPlayer'
import LessonSidebar from '@/components/player/LessonSidebar'

interface PlayerLesson {
  id: string
  title: string
  video_url: string | null
  duration_minutes: number | null
  is_free_preview: boolean
  order_index: number
}

interface PlayerModule {
  id: string
  title: string
  order_index: number
  lessons: PlayerLesson[]
}

interface Props {
  courseTitle: string
  courseSlug: string
  currentLesson: PlayerLesson
  modules: PlayerModule[]
  completedLessonIds: string[]
  progressPercent: number
  userId: string
}

export default function LessonPlayerLayout({
  courseTitle, courseSlug, currentLesson, modules, completedLessonIds, progressPercent, userId: _userId
}: Props) {
  const [completed, setCompleted] = useState(completedLessonIds)
  const [marking, setMarking] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const isCurrentCompleted = completed.includes(currentLesson.id)

  const handleMarkComplete = async () => {
    if (isCurrentCompleted || marking) return
    setMarking(true)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: currentLesson.id }),
    })
    setCompleted(prev => [...prev, currentLesson.id])
    setJustCompleted(true)
    setMarking(false)
    setTimeout(() => setJustCompleted(false), 2000)
  }

  const allLessons = modules.flatMap(m => m.lessons)
  const currentPercent = allLessons.length > 0 ? Math.round((completed.length / allLessons.length) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', display: 'flex', flexDirection: 'column' }}>

      {/* Header with progress bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: 'var(--color-bg-deep)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '100%', display: 'flex', alignItems: 'center', height: '56px', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--color-text)', fontWeight: 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {courseTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ width: '120px', height: '4px', backgroundColor: 'rgba(78,205,196,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${currentPercent}%`, backgroundColor: 'var(--color-teal)', transition: 'width 0.5s ease', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 500 }}>{currentPercent}%</span>
          </div>
        </div>
      </div>

      {/* Two-panel body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Video panel (70%) */}
        <div style={{ flex: '0 0 70%', padding: '32px', overflowY: 'auto' }}>
          <div style={{ borderRight: '1px solid rgba(255,107,107,0.3)', paddingRight: '0' }}>
            {currentLesson.video_url ? (
              <VideoPlayer url={currentLesson.video_url} title={currentLesson.title} />
            ) : (
              <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-bg-section)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Video próximamente</p>
              </div>
            )}
          </div>

          {/* Lesson info + complete button */}
          <div style={{ marginTop: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--color-text)', marginBottom: '16px' }}>
              {currentLesson.title}
            </h1>

            <AnimatePresence>
              {justCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)', fontSize: '16px', marginBottom: '16px' }}
                >
                  <span>✓</span> <span>¡Lección completada!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCurrentCompleted ? (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                style={{
                  padding: '12px 24px', backgroundColor: 'var(--color-teal)',
                  color: '#0A0A14', border: 'none', borderRadius: '8px',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px',
                  cursor: marking ? 'not-allowed' : 'pointer',
                  opacity: marking ? 0.7 : 1, transition: 'all 150ms ease'
                }}
              >
                {marking ? 'Guardando...' : 'Marcar como completada ✓'}
              </button>
            ) : (
              <span style={{ color: 'var(--color-teal)', fontSize: '14px', fontWeight: 500 }}>
                ✓ Completada
              </span>
            )}
          </div>
        </div>

        {/* Right: Sidebar (30%) */}
        <div style={{ flex: '0 0 30%', overflowY: 'auto', backgroundColor: 'var(--color-bg-card)', borderLeft: '1px solid rgba(255,107,107,0.2)' }}>
          <LessonSidebar
            courseSlug={courseSlug}
            modules={modules}
            currentLessonId={currentLesson.id}
            completedLessonIds={completed}
          />
        </div>
      </div>
    </div>
  )
}
