'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number
  module_id: string
}

interface LessonItem {
  id: string
  title: string
  duration_minutes: number | null
  order_index: number
  is_free_preview: boolean
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: LessonItem[]
}

interface Props {
  courseSlug: string
  courseTitle: string
  lesson: Lesson
  modules: Module[]
  completedIds: string[]
  prevLessonId: string | null
  nextLessonId: string | null
  userId: string
  completedCount: number
  totalCount: number
}

export default function PlayerClient({
  courseSlug, courseTitle, lesson, modules, completedIds,
  prevLessonId, nextLessonId, userId, completedCount, totalCount,
}: Props) {
  const router = useRouter()
  const [completed, setCompleted] = useState(new Set(completedIds))
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isPending, startTransition] = useTransition()

  const isCurrentComplete = completed.has(lesson.id)
  const progressPercent = totalCount > 0 ? Math.round((completed.size / totalCount) * 100) : 0

  const markComplete = async () => {
    if (isCurrentComplete) return
    startTransition(async () => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lesson.id }),
      })
      setCompleted(prev => new Set([...prev, lesson.id]))
      // Auto-advance to next lesson
      if (nextLessonId) {
        setTimeout(() => router.push(`/aprender/${courseSlug}/${nextLessonId}`), 600)
      }
    })
  }

  // Get video embed URL
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=4ECDC4&title=0&byline=0`
    // Direct URL (Loom, Bunny, etc.)
    return url
  }

  const embedUrl = getEmbedUrl(lesson.video_url)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        height: '56px', flexShrink: 0,
        background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', gap: '16px',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'rgba(247,247,242,0.4)', textDecoration: 'none',
            fontSize: '13px', fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Dashboard
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>/</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.5)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {courseTitle}
          </span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '120px', height: '4px', borderRadius: '100px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              width: `${progressPercent}%`,
              background: progressPercent === 100 ? 'var(--color-teal)' : 'var(--color-coral)',
              transition: 'width 0.4s ease',
            }}/>
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', whiteSpace: 'nowrap' }}>
            {completed.size}/{totalCount}
          </span>
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(247,247,242,0.4)', fontFamily: 'var(--font-body)', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M9 2v10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {sidebarOpen ? 'Ocultar' : 'Temario'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Main — video + info */}
        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

          {/* Video */}
          <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', position: 'relative' }}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '16px',
                background: 'linear-gradient(135deg, rgba(78,205,196,0.05), rgba(255,107,107,0.03))',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3l14 9-14 9V3z" fill="rgba(78,205,196,0.6)"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(247,247,242,0.3)' }}>
                  Video próximamente disponible
                </p>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: '860px' }}>

            {/* Title + complete button */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '-1px',
                  color: 'var(--color-text)', lineHeight: 1.2,
                }}>
                  {lesson.title}
                </h1>
                {lesson.duration_minutes && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', marginTop: '6px' }}>
                    {lesson.duration_minutes} min
                  </p>
                )}
              </div>

              <button
                onClick={markComplete}
                disabled={isCurrentComplete || isPending}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px', cursor: isCurrentComplete ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                  background: isCurrentComplete ? 'rgba(78,205,196,0.1)' : 'var(--color-teal)',
                  color: isCurrentComplete ? 'var(--color-teal)' : '#0C0C18',
                  border: isCurrentComplete ? '1px solid rgba(78,205,196,0.2)' : 'none',
                  transition: 'all 0.2s', opacity: isPending ? 0.7 : 1, flexShrink: 0,
                }}
              >
                {isCurrentComplete ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Completada
                  </>
                ) : isPending ? '...' : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Marcar como completada
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            {lesson.description && (
              <div style={{
                padding: '20px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '32px',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(247,247,242,0.5)', lineHeight: 1.7 }}>
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Prev / Next nav */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {prevLessonId ? (
                <Link href={`/aprender/${courseSlug}/${prevLessonId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(247,247,242,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Clase anterior
                </Link>
              ) : <div />}

              {nextLessonId ? (
                <Link href={`/aprender/${courseSlug}/${nextLessonId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)',
                  color: 'var(--color-coral)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                }}>
                  Siguiente clase
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Link>
              ) : (
                <Link href={`/certificados/${courseSlug}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)',
                  color: 'var(--color-teal)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.2 3.5L12 5l-2.5 2.5.5 3L7 9 4 10.5l.5-3L2 5l3.8-.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  Obtener certificado
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — course outline */}
        {sidebarOpen && (
          <div style={{
            width: '320px', flexShrink: 0,
            background: 'rgba(10,10,20,0.95)',
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', marginBottom: '4px' }}>
                Contenido del curso
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)' }}>
                {completed.size} de {totalCount} clases · {progressPercent}%
              </p>
              <div style={{ marginTop: '10px', height: '3px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: '100px', width: `${progressPercent}%`, background: 'var(--color-teal)', transition: 'width 0.4s' }}/>
              </div>
            </div>

            {(modules || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map(mod => (
                <div key={mod.id}>
                  {/* Module header */}
                  <div style={{
                    padding: '14px 20px 10px',
                    background: 'rgba(255,255,255,0.015)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'rgba(247,247,242,0.4)', letterSpacing: '0.5px', lineHeight: 1.4 }}>
                      {mod.title}
                    </p>
                  </div>

                  {/* Lessons */}
                  {(mod.lessons || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(l => {
                      const isActive = l.id === lesson.id
                      const isDone = completed.has(l.id)
                      return (
                        <Link
                          key={l.id}
                          href={`/aprender/${courseSlug}/${l.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 20px', textDecoration: 'none',
                            background: isActive ? 'rgba(255,107,107,0.06)' : 'transparent',
                            borderLeft: `3px solid ${isActive ? 'var(--color-coral)' : 'transparent'}`,
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            transition: 'background 0.15s',
                          }}
                        >
                          {/* Status icon */}
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDone ? 'rgba(78,205,196,0.15)' : isActive ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isDone ? 'rgba(78,205,196,0.3)' : isActive ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                            {isDone ? (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l3 3 4-4" stroke="rgba(78,205,196,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : isActive ? (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M2 1.5l4 2.5-4 2.5V1.5z" fill="rgba(255,107,107,0.8)"/>
                              </svg>
                            ) : (
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}/>
                            )}
                          </div>

                          {/* Title + duration */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 1.4,
                              color: isActive ? 'var(--color-coral)' : isDone ? 'rgba(247,247,242,0.6)' : 'rgba(247,247,242,0.4)',
                              fontWeight: isActive ? 600 : 400,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {l.title}
                            </p>
                            {l.duration_minutes && (
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(247,247,242,0.2)', marginTop: '2px' }}>
                                {l.duration_minutes} min
                              </p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
