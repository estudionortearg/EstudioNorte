'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  duration_minutes: number | null
  is_free_preview: boolean
  order_index: number
  slug_or_id?: string
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface LessonSidebarProps {
  courseSlug: string
  modules: Module[]
  currentLessonId: string
  completedLessonIds: string[]
}

export default function LessonSidebar({ courseSlug, modules, currentLessonId, completedLessonIds }: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  )

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 0' }}>
      {modules.map(module => (
        <div key={module.id} style={{ marginBottom: '4px' }}>
          <button
            onClick={() => toggleModule(module.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '12px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              color: 'var(--color-text)', fontFamily: 'var(--font-body)',
              fontWeight: 600, fontSize: '13px'
            }}
          >
            <span>{module.title}</span>
            <span style={{ color: 'var(--color-text-faint)', fontSize: '11px' }}>
              {openModules.has(module.id) ? '▲' : '▼'}
            </span>
          </button>

          {openModules.has(module.id) && (
            <div>
              {module.lessons.map(lesson => {
                const isCurrent = lesson.id === currentLessonId
                const isCompleted = completedLessonIds.includes(lesson.id)

                return (
                  <Link
                    key={lesson.id}
                    href={`/aprender/${courseSlug}/${lesson.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 20px 10px 28px',
                      textDecoration: 'none',
                      backgroundColor: isCurrent ? 'rgba(78,205,196,0.08)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid #FF6B6B' : '3px solid transparent',
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: '12px', color: isCompleted ? '#4ECDC4' : 'rgba(247,247,242,0.25)' }}>
                      {isCompleted ? '✓' : '○'}
                    </span>
                    <span style={{
                      fontSize: '13px', lineHeight: 1.4,
                      color: isCurrent ? 'var(--color-coral)' : isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                      fontWeight: isCurrent ? 500 : 400
                    }}>
                      {lesson.title}
                    </span>
                    {lesson.duration_minutes && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-faint)', flexShrink: 0 }}>
                        {lesson.duration_minutes}min
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
