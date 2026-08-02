'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import BadgeModal from '@/components/gamification/BadgeModal'
import RankingPanel from '@/components/gamification/RankingPanel'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  pdf_url: string | null
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

interface BadgeInfo {
  slug: string
  name: string
  emoji: string
  description: string
}

interface Props {
  courseSlug: string
  courseTitle: string
  courseId: string
  lesson: Lesson
  modules: Module[]
  completedIds: string[]
  prevLessonId: string | null
  nextLessonId: string | null
  userId: string
  completedCount: number
  totalCount: number
}

function getVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`
  return url
}

export default function PlayerClient({
  courseSlug, courseTitle, courseId, lesson, modules, completedIds,
  prevLessonId, nextLessonId, userId, completedCount, totalCount,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [completed, setCompleted] = useState(new Set(completedIds))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [badgesEarned, setBadgesEarned] = useState<BadgeInfo[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const [sidebarTab, setSidebarTab] = useState<'modules' | 'ranking' | 'preguntas'>('modules')
  const [lessonQuestions, setLessonQuestions] = useState<any[]>([])
  const [questionsLoaded, setQuestionsLoaded] = useState(false)
  const [questionBody, setQuestionBody] = useState('')
  const [questionTitle, setQuestionTitle] = useState('')
  const [sendingQuestion, setSendingQuestion] = useState(false)

  const isCurrentComplete = completed.has(lesson.id)
  const progressPercent = totalCount > 0 ? Math.round((completed.size / totalCount) * 100) : 0
  const videoEmbedUrl = getVideoEmbedUrl(lesson.video_url)

  const markComplete = async () => {
    if (isCurrentComplete) return
    startTransition(async () => {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lesson.id }),
      })
      const data = await res.json()
      setCompleted(prev => new Set([...prev, lesson.id]))
      if (data.badges_earned && data.badges_earned.length > 0) {
        setBadgesEarned(data.badges_earned)
        setXpEarned(data.xp_earned || 0)
      }
      if (nextLessonId) {
        setTimeout(() => router.push(`/aprender/${courseSlug}/${nextLessonId}`), 500)
      }
    })
  }

  const loadLessonQuestions = async () => {
    const res = await fetch(`/api/community/posts?lesson_id=${lesson.id}&limit=50`)
    if (res.ok) {
      const data = await res.json()
      setLessonQuestions(data.posts || [])
    }
    setQuestionsLoaded(true)
  }

  const handleSubmitQuestion = async () => {
    if (!questionTitle.trim() || !questionBody.trim()) return
    setSendingQuestion(true)
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: questionTitle.trim(), body: questionBody.trim(), lesson_id: lesson.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setLessonQuestions(prev => [data.post, ...prev])
      setQuestionTitle('')
      setQuestionBody('')
    }
    setSendingQuestion(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', display: 'flex' }}>

      <Sidebar activeRoute={pathname} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '80px' }} className="md:pl-16">

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--en-bg)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--en-border)',
          padding: '0 clamp(12px, 3vw, 32px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)',
              textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {courseTitle}
            </Link>
          </div>

          {/* Progress + toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '100px', height: '4px', borderRadius: '2px', background: 'var(--en-border)' }}>
              <div style={{ height: '100%', borderRadius: '2px', background: 'var(--en-green)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}/>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>
              {progressPercent}%
            </span>

            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--en-border)',
                background: sidebarOpen ? 'var(--en-green-light)' : 'var(--en-white)',
                color: sidebarOpen ? 'var(--en-green)' : 'var(--en-text-soft)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              Índice
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', gap: '0', overflow: 'hidden' }}>

          {/* Main player */}
          <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }}>

            {/* Lesson title */}
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '-1px',
              color: 'var(--en-text)', marginBottom: '24px', lineHeight: 1.2,
            }}>
              {lesson.title}
            </h1>

            {/* Video player */}
            {videoEmbedUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: 'var(--en-shadow)' }}>
                <iframe
                  src={videoEmbedUrl}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF viewer */}
            {lesson.pdf_url && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <a
                    href={lesson.pdf_url}
                    download
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                      background: 'var(--en-green-light)', color: 'var(--en-green)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                      border: '1px solid var(--en-border)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar PDF
                  </a>
                  <a
                    href={lesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                      background: 'var(--en-white)', color: 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '13px',
                      border: '1px solid var(--en-border)',
                    }}
                  >
                    Abrir en nueva pestaña
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>

                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-sm)' }}>
                  <embed
                    src={lesson.pdf_url}
                    type="application/pdf"
                    style={{ width: '100%', height: '80vh', display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* No content fallback */}
            {!videoEmbedUrl && !lesson.pdf_url && (
              <div style={{
                height: '200px', borderRadius: '16px',
                background: 'var(--en-surface)', border: '1.5px dashed var(--en-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-faint)', fontSize: '14px' }}>
                  Contenido próximamente
                </p>
              </div>
            )}

            {/* Description */}
            {lesson.description && (
              <div style={{
                background: 'var(--en-white)', border: '1px solid var(--en-border)',
                borderRadius: '16px', padding: '20px', marginBottom: '24px',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.7 }}>
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Nav + Mark complete */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {prevLessonId && (
                  <Link href={`/aprender/${courseSlug}/${prevLessonId}`} style={{
                    padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                    background: 'var(--en-white)', color: 'var(--en-text)',
                    border: '1px solid var(--en-border)',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Anterior
                  </Link>
                )}
                {nextLessonId && (
                  <Link href={`/aprender/${courseSlug}/${nextLessonId}`} style={{
                    padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
                    background: 'var(--en-white)', color: 'var(--en-text)',
                    border: '1px solid var(--en-border)',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    Siguiente
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                )}
              </div>

              <button
                onClick={markComplete}
                disabled={isCurrentComplete || isPending}
                style={{
                  padding: '12px 24px', borderRadius: '10px', border: 'none',
                  cursor: isCurrentComplete ? 'default' : 'pointer',
                  background: 'var(--en-green)',
                  color: 'var(--en-white)',
                  fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                  opacity: isCurrentComplete ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: isCurrentComplete ? 'none' : 'var(--en-shadow-green)',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {isCurrentComplete ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Completada
                  </>
                ) : isPending ? 'Guardando...' : 'Marcar como completada'}
              </button>
            </div>
          </div>

          {/* Sidebar panel — módulos e índice */}
          {sidebarOpen && (
            <aside style={{
              width: '280px', flexShrink: 0,
              background: 'var(--en-white)', borderLeft: '1px solid var(--en-border)',
              overflow: 'auto', padding: '20px 0',
            }}>
              {/* Tab toggle */}
              <div style={{
                display: 'flex', gap: '4px', padding: '8px 12px',
                borderBottom: '1px solid var(--en-border)',
                marginBottom: '8px',
              }}>
                {(['modules', 'ranking', 'preguntas'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setSidebarTab(tab)
                      if (tab === 'preguntas' && !questionsLoaded) loadLessonQuestions()
                    }}
                    style={{
                      flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: sidebarTab === tab ? 'var(--en-green-light)' : 'transparent',
                      color: sidebarTab === tab ? 'var(--en-green)' : 'var(--en-text-soft)',
                      fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: sidebarTab === tab ? 600 : 400,
                    }}
                  >
                    {tab === 'modules' ? 'Módulos' : tab === 'ranking' ? 'Ranking' : 'Preguntas'}
                  </button>
                ))}
              </div>

              {sidebarTab === 'modules' ? (
                <>
                  <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-text-soft)' }}>
                      Índice del curso
                    </p>
                  </div>
                  {(modules || []).sort((a, b) => a.order_index - b.order_index).map(mod => (
                    <div key={mod.id} style={{ marginBottom: '16px' }}>
                      <div style={{ padding: '6px 16px', marginBottom: '4px' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {mod.title}
                        </p>
                      </div>
                      {(mod.lessons || []).sort((a, b) => a.order_index - b.order_index).map(l => {
                        const isComplete = completed.has(l.id)
                        const isCurrent = l.id === lesson.id
                        return (
                          <Link
                            key={l.id}
                            href={`/aprender/${courseSlug}/${l.id}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 16px', textDecoration: 'none',
                              background: isCurrent ? 'var(--en-green-light)' : 'transparent',
                              borderLeft: `3px solid ${isCurrent ? 'var(--en-green)' : 'transparent'}`,
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <span style={{
                              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                              background: isComplete ? 'var(--en-green)' : 'var(--en-white)',
                              border: `1.5px solid ${isComplete ? 'var(--en-green)' : 'var(--en-border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isComplete && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--en-white)" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: '13px',
                              color: isCurrent ? 'var(--en-green)' : isComplete ? 'var(--en-text-soft)' : 'var(--en-text)',
                              fontWeight: isCurrent ? 600 : 400,
                              lineHeight: 1.3, flex: 1,
                            }}>
                              {l.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </>
              ) : sidebarTab === 'ranking' ? (
                <RankingPanel courseId={courseId} userId={userId} />
              ) : (
                <LessonQuestionsPanel
                  lessonId={lesson.id}
                  questions={lessonQuestions}
                  questionTitle={questionTitle}
                  questionBody={questionBody}
                  sending={sendingQuestion}
                  onTitleChange={setQuestionTitle}
                  onBodyChange={setQuestionBody}
                  onSubmit={handleSubmitQuestion}
                />
              )}
            </aside>
          )}
        </div>
      </div>

      <BottomNav activeRoute={pathname} />

      {badgesEarned.length > 0 && (
        <BadgeModal
          badges={badgesEarned}
          xpEarned={xpEarned}
          onClose={() => setBadgesEarned([])}
        />
      )}
    </div>
  )
}

function LessonQuestionsPanel({
  lessonId, questions, questionTitle, questionBody, sending,
  onTitleChange, onBodyChange, onSubmit,
}: {
  lessonId: string
  questions: any[]
  questionTitle: string
  questionBody: string
  sending: boolean
  onTitleChange: (v: string) => void
  onBodyChange: (v: string) => void
  onSubmit: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ padding: '0 12px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-text-soft)', marginBottom: '12px', padding: '0 4px' }}>
        Preguntas de esta lección
      </p>

      {/* Form nueva pregunta */}
      <div style={{ background: 'var(--en-bg)', border: '1px solid var(--en-border)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--en-text)', marginBottom: '8px' }}>
          Hacer una pregunta +10 XP
        </p>
        <input
          value={questionTitle}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Título (ej: ¿Cómo aplico X?)"
          style={{
            width: '100%', padding: '8px 10px', borderRadius: '7px', boxSizing: 'border-box',
            background: 'var(--en-white)', border: '1.5px solid var(--en-border)',
            color: 'var(--en-text)', fontSize: '12px', fontFamily: 'var(--font-body)',
            outline: 'none', marginBottom: '6px',
          }}
        />
        <textarea
          value={questionBody}
          onChange={e => onBodyChange(e.target.value)}
          placeholder="Detallá tu pregunta..."
          rows={3}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: '7px', boxSizing: 'border-box',
            background: 'var(--en-white)', border: '1.5px solid var(--en-border)',
            color: 'var(--en-text)', fontSize: '12px', fontFamily: 'var(--font-body)',
            outline: 'none', resize: 'none', lineHeight: 1.5, marginBottom: '8px',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={sending || !questionTitle.trim() || !questionBody.trim()}
          style={{
            width: '100%', padding: '8px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            background: 'var(--en-green)', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
            opacity: (sending || !questionTitle.trim() || !questionBody.trim()) ? 0.55 : 1,
          }}
        >
          {sending ? 'Enviando...' : 'Publicar pregunta'}
        </button>
      </div>

      {/* Lista de preguntas */}
      {questions.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', textAlign: 'center', padding: '16px 0' }}>
          Aún no hay preguntas. ¡Sé el primero!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {questions.map((q: any) => (
            <div key={q.id} style={{
              background: 'var(--en-bg)', border: '1px solid var(--en-border)',
              borderLeft: q.solution_reply_id ? '3px solid var(--en-green)' : '1px solid var(--en-border)',
              borderRadius: '9px', padding: '10px 12px', cursor: 'pointer',
            }}
              onClick={() => setExpanded(expanded === q.id ? null : q.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text)', lineHeight: 1.4, flex: 1 }}>
                  {q.solution_reply_id && <span style={{ color: 'var(--en-green)', marginRight: '4px' }}>✅</span>}
                  {q.title}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--en-text-faint)', whiteSpace: 'nowrap' }}>
                  {q.reply_count} resp.
                </span>
              </div>
              {expanded === q.id && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', lineHeight: 1.5, marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                  {q.body}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-faint)' }}>
                  {q.profiles?.full_name || 'Alumno'}
                </span>
                <Link
                  href={`/comunidad/post/${q.id}`}
                  onClick={e => e.stopPropagation()}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-green)', textDecoration: 'none' }}
                >
                  Ver hilo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
