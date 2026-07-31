// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = { title: 'Mi Dashboard — Estudio Norte' }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at, courses (id, slug, title)')
    .eq('user_id', user.id)

  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string } | null
      if (!course) return null

      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', course.id)
      const moduleIds = modules?.map((m: { id: string }) => m.id) || []
      if (moduleIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0, totalLessons: 0, completedLessons: 0 }

      const { data: lessons } = await supabase.from('lessons').select('id, title').in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []
      if (lessonIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0, totalLessons: 0, completedLessons: 0 }

      const { data: progressRows } = await supabase
        .from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', lessonIds)

      const completedIds = new Set((progressRows || []).map(p => p.lesson_id))
      const completedLessons = completedIds.size
      const totalLessons = lessonIds.length
      const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
      const nextLesson = lessons?.find((l: { id: string; title: string }) => !completedIds.has(l.id))

      return { courseSlug: course.slug, courseTitle: course.title, progressPercent: percent, totalLessons, completedLessons, nextLessonId: nextLesson?.id, nextLessonTitle: nextLesson?.title }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    courseSlug: string; courseTitle: string; progressPercent: number
    totalLessons: number; completedLessons: number
    nextLessonId?: string; nextLessonTitle?: string
  }>

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const resumeCourse = activeCourses[0] || validCourses[0]
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', display: 'flex' }}>

      <Sidebar activeRoute="/dashboard" />

      {/* Main content — con offset por sidebar en desktop */}
      <div style={{ flex: 1, paddingLeft: '0', paddingBottom: '80px' }} className="md:pl-16">

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--en-border)',
          padding: '0 clamp(16px, 4vw, 40px)',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>{getGreeting()}, </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-green)' }}>{displayName}</span>
            </div>
            <Link href="/perfil" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--en-green-light)', border: `2px solid var(--en-green-30)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-green)',
              textDecoration: 'none',
            }}>
              {initials}
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)' }}>

          {validCourses.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-2px', color: 'var(--en-text)', marginBottom: '16px' }}>
                Tu aprendizaje<br />empieza hoy
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '16px', marginBottom: '32px' }}>
                Todavía no tenés cursos. Explorá el catálogo y empezá.
              </p>
              <Link href="/cursos" style={{
                padding: '14px 28px', borderRadius: '12px',
                background: 'var(--en-green)', color: 'var(--en-white)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
                textDecoration: 'none',
              }}>
                Ver cursos disponibles →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Resume banner */}
              {resumeCourse && resumeCourse.progressPercent > 0 && resumeCourse.progressPercent < 100 && (
                <div style={{
                  background: `linear-gradient(135deg, var(--en-green-08), var(--en-coral-05))`,
                  border: `1.5px solid var(--en-green-15)`,
                  borderRadius: '20px', padding: '28px 32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '6px' }}>
                      Retomá donde lo dejaste
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                      {resumeCourse.courseTitle}
                    </h2>
                    {resumeCourse.nextLessonTitle && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', marginTop: '4px' }}>
                        Próximo: {resumeCourse.nextLessonTitle}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color: 'var(--en-green)', letterSpacing: '-1.5px', lineHeight: 1 }}>
                        {resumeCourse.progressPercent}%
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)' }}>completado</div>
                    </div>
                    <Link
                      href={resumeCourse.nextLessonId
                        ? `/aprender/${resumeCourse.courseSlug}/${resumeCourse.nextLessonId}`
                        : `/aprender/${resumeCourse.courseSlug}`}
                      style={{
                        padding: '12px 24px', borderRadius: '10px', textDecoration: 'none',
                        background: 'var(--en-green)', color: 'var(--en-white)',
                        fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
                        boxShadow: 'var(--en-shadow-green-sm)',
                      }}
                    >
                      Continuar →
                    </Link>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                  { value: validCourses.length, label: 'Inscriptos', color: 'var(--en-text)' },
                  { value: activeCourses.length, label: 'En progreso', color: 'var(--en-coral)' },
                  { value: completedCourses.length, label: 'Completados', color: 'var(--en-green)' },
                ].map(({ value, label, color }) => (
                  <div key={label} style={{
                    background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                    borderRadius: '16px', padding: '20px 16px',
                    boxShadow: 'var(--en-shadow-sm)',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color, letterSpacing: '-1.5px', lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cursos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                    Mis cursos
                  </h2>
                  <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-green)', textDecoration: 'none' }}>
                    Explorar más →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                  {validCourses.map(course => {
                    const isComplete = course.progressPercent === 100
                    return (
                      <Link key={course.courseSlug}
                        href={course.nextLessonId
                          ? `/aprender/${course.courseSlug}/${course.nextLessonId}`
                          : `/aprender/${course.courseSlug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                          borderRadius: '16px', padding: '20px',
                          boxShadow: 'var(--en-shadow-sm)', transition: 'box-shadow 0.2s ease',
                        }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '12px' }}>
                            {course.courseTitle}
                          </h3>
                          {/* Progress bar */}
                          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--en-track-bg)', marginBottom: '8px' }}>
                            <div style={{ height: '100%', borderRadius: '2px', background: isComplete ? 'var(--en-green)' : 'var(--en-coral)', width: `${course.progressPercent}%`, transition: 'width 0.3s ease' }}/>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                              {course.completedLessons}/{course.totalLessons} lecciones
                            </span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: isComplete ? 'var(--en-green)' : 'var(--en-coral)' }}>
                              {course.progressPercent}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <BottomNav activeRoute="/dashboard" />
    </div>
  )
}
