import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'
import XPStreak from '@/components/gamification/XPStreak'
import ProgressBar from '@/components/ui/ProgressBar'

export const metadata: Metadata = { title: 'Mi Dashboard — Estudio Norte' }

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

  const { data: xpRow } = await supabase.from('user_xp').select('total_xp').eq('user_id', user.id).single()
  const { data: streakRow } = await supabase.from('user_streaks').select('current_streak, longest_streak, last_activity_date').eq('user_id', user.id).single()
  const { count: badgesCount } = await supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  const { data: profile } = await supabase.from('profiles').select('plan, full_name').eq('id', user.id).maybeSingle()

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const resumeCourse = activeCourses[0] || validCourses[0]
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()
  const userPlan = profile?.plan ?? 'free'
  const planLabel = userPlan === 'norte_pro' ? 'Norte Pro' : userPlan === 'norte' ? 'Norte' : 'Gratuito'
  const planColor = userPlan === 'norte_pro' ? 'var(--en-coral)' : userPlan === 'norte' ? 'var(--en-green)' : 'var(--en-text-faint)'

  const STATS = [
    { value: validCourses.length, label: 'Inscriptos', icon: '📚', color: 'var(--en-green)', bg: 'var(--en-green-light)', border: 'var(--en-green-15)' },
    { value: activeCourses.length, label: 'En progreso', icon: '⏳', color: 'var(--en-coral)', bg: 'color-mix(in srgb, var(--en-coral) 8%, var(--en-surface))', border: 'color-mix(in srgb, var(--en-coral) 18%, transparent)' },
    { value: completedCourses.length, label: 'Completados', icon: '🏆', color: 'var(--en-green)', bg: 'color-mix(in srgb, var(--en-green) 6%, var(--en-surface))', border: 'var(--en-green-15)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>

      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/cursos" style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
              color: 'var(--en-text-soft)', textDecoration: 'none', padding: '6px 12px',
              borderRadius: '8px', transition: 'background 0.15s',
            }}>
              Cursos
            </Link>
            <Link href="/perfil" style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--en-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '12px', color: '#fff',
              textDecoration: 'none', flexShrink: 0,
            }}>
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

          <StudentSidebar activeRoute="/dashboard" displayName={displayName} />

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Page heading — estilo HiStudy */}
            <div style={{
              background: 'var(--en-surface)', border: '1px solid var(--en-border)',
              borderRadius: '16px', padding: '28px 32px', marginBottom: '20px',
            }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(26px, 4vw, 36px)', letterSpacing: '-1.5px',
                color: 'var(--en-text)', marginBottom: '10px', lineHeight: 1.1,
              }}>
                Dashboard
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--en-text-soft)', lineHeight: 1.5 }}>
                  Hola, <strong style={{ color: 'var(--en-text)', fontWeight: 600 }}>{displayName}</strong> —{' '}
                  {validCourses.length === 0
                    ? 'todavía no empezaste ningún curso.'
                    : activeCourses.length > 0
                      ? `tenés ${activeCourses.length} ${activeCourses.length === 1 ? 'curso en progreso' : 'cursos en progreso'}.`
                      : `completaste ${completedCourses.length} ${completedCourses.length === 1 ? 'curso' : 'cursos'}. ¡Excelente!`
                  }
                </p>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px',
                  textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                  color: planColor,
                  border: `1px solid ${planColor}`,
                  background: `color-mix(in srgb, ${planColor} 8%, transparent)`,
                  flexShrink: 0,
                }}>
                  {planLabel}
                </span>
              </div>
            </div>

            {validCourses.length === 0 ? (
              /* Empty state */
              <div style={{
                textAlign: 'center', paddingTop: '64px', paddingBottom: '64px',
                border: '1.5px dashed var(--en-border)', borderRadius: '16px',
                background: 'var(--en-surface)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
                  Todavía no tenés cursos
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '14px', marginBottom: '24px' }}>
                  Elegí un curso y empezá a diseñar tu marca con IA.
                </p>
                <Link href="/cursos" style={{
                  padding: '11px 22px', borderRadius: '10px',
                  background: 'var(--en-green)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Ver cursos disponibles →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {STATS.map(({ value, label, icon, color, bg, border }) => (
                    <div key={label} style={{
                      background: bg, borderRadius: '14px', padding: '20px 18px',
                      border: `1px solid ${border}`,
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: `color-mix(in srgb, ${color} 14%, white)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: 'var(--en-text)', letterSpacing: '-1px', lineHeight: 1 }}>
                          {value}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '3px' }}>
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* XP + Racha */}
                <XPStreak
                  totalXp={xpRow?.total_xp || 0}
                  currentStreak={streakRow?.current_streak || 0}
                  longestStreak={streakRow?.longest_streak || 0}
                  lastActivityDate={streakRow?.last_activity_date || null}
                  badgesCount={badgesCount || 0}
                />

                {/* Retomar curso */}
                {resumeCourse && resumeCourse.progressPercent > 0 && resumeCourse.progressPercent < 100 && (
                  <div style={{
                    background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                    borderRadius: '14px', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '5px' }}>
                        Retomá donde lo dejaste
                      </p>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resumeCourse.courseTitle}
                      </h3>
                      {/* Progress bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '5px', borderRadius: '100px', background: 'var(--en-border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${resumeCourse.progressPercent}%`, borderRadius: '100px', background: 'var(--en-green)', transition: 'width 0.4s ease' }}/>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', flexShrink: 0 }}>
                          {resumeCourse.progressPercent}%
                        </span>
                      </div>
                    </div>
                    <Link
                      href={resumeCourse.nextLessonId
                        ? `/aprender/${resumeCourse.courseSlug}/${resumeCourse.nextLessonId}`
                        : `/aprender/${resumeCourse.courseSlug}`}
                      style={{
                        padding: '11px 22px', borderRadius: '10px', textDecoration: 'none',
                        background: 'var(--en-green)', color: '#fff',
                        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Continuar →
                    </Link>
                  </div>
                )}

                {/* Mis cursos */}
                <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '14px', padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.3px' }}>
                      Mis cursos
                    </h2>
                    <Link href="/mis-cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-green)', textDecoration: 'none', fontWeight: 500 }}>
                      Ver todos →
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {validCourses.map(course => (
                      <ProgressBar
                        key={course.courseSlug}
                        label={course.courseTitle}
                        sublabel={`${course.completedLessons}/${course.totalLessons} lecciones`}
                        value={course.progressPercent}
                        href={course.nextLessonId
                          ? `/aprender/${course.courseSlug}/${course.nextLessonId}`
                          : `/aprender/${course.courseSlug}`}
                        isComplete={course.progressPercent === 100}
                        height={5}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}
          </main>
        </div>
      </div>

      <BottomNav activeRoute="/dashboard" />
    </div>
  )
}
