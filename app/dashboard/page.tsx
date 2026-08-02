// app/dashboard/page.tsx
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

  const { data: xpRow } = await supabase
    .from('user_xp').select('total_xp').eq('user_id', user.id).single()

  const { data: streakRow } = await supabase
    .from('user_streaks').select('current_streak, longest_streak, last_activity_date').eq('user_id', user.id).single()

  const { count: badgesCount } = await supabase
    .from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', user.id).maybeSingle()

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const resumeCourse = activeCourses[0] || validCourses[0]
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()
  const userPlan = profile?.plan ?? 'free'
  const planLabel = userPlan === 'norte_pro' ? 'Norte Pro' : userPlan === 'norte' ? 'Norte' : 'Gratuito'
  const planColor = userPlan === 'norte_pro' ? 'var(--en-coral)' : userPlan === 'norte' ? 'var(--en-green)' : 'var(--en-text-faint)'

  const STATS = [
    { value: validCourses.length, label: 'Inscriptos', bg: 'var(--en-green-light)', color: 'var(--en-green)' },
    { value: activeCourses.length, label: 'En progreso', bg: 'color-mix(in srgb, var(--en-coral) 10%, var(--en-surface))', color: 'var(--en-coral)' },
    { value: completedCourses.length, label: 'Completados', bg: 'color-mix(in srgb, var(--en-green) 8%, var(--en-surface))', color: 'var(--en-green)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>

      {/* Sticky top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--en-white)', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </Link>
          <Link href="/perfil" style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--en-green-light)', border: '2px solid var(--en-green-30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-green)',
            textDecoration: 'none', flexShrink: 0,
          }}>
            {initials}
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>

        {/* Profile banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--en-green) 0%, color-mix(in srgb, var(--en-green) 55%, var(--en-coral)) 100%)',
          borderRadius: '20px', padding: 'clamp(24px, 4vw, 36px) clamp(24px, 4vw, 40px)',
          marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: '-24px', right: '40px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}/>

          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.2)',
            border: '2.5px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: '#fff',
            letterSpacing: '-1px',
          }}>
            {initials}
          </div>

          {/* Name + stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Mi espacio de aprendizaje
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 26px)', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </h1>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {validCourses.length} {validCourses.length === 1 ? 'curso inscripto' : 'cursos inscriptos'}
              </span>
              {completedCourses.length > 0 && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  {completedCourses.length} {completedCourses.length === 1 ? 'completado' : 'completados'}
                </span>
              )}
            </div>
          </div>

          {/* Plan badge + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', padding: '5px 12px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {planLabel}
            </span>
            <Link href="/cursos" style={{
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
              padding: '9px 18px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              textDecoration: 'none', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
            }}>
              Ver cursos →
            </Link>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          <StudentSidebar activeRoute="/dashboard" displayName={displayName} />

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {validCourses.length === 0 ? (
              /* Empty state */
              <div style={{
                textAlign: 'center', paddingTop: '80px', paddingBottom: '80px',
                border: '1.5px dashed var(--en-border)', borderRadius: '20px',
                background: 'var(--en-surface)',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="1.2" style={{ marginBottom: '20px' }}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
                  Todavía no tenés cursos
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '15px', marginBottom: '28px' }}>
                  Elegí un curso y empezá a diseñar tu marca con IA.
                </p>
                <Link href="/cursos" style={{
                  padding: '12px 24px', borderRadius: '12px',
                  background: 'var(--en-green)', color: 'var(--en-white)',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Ver cursos disponibles →
                </Link>
              </div>
            ) : (
              <>
                {/* XP, Racha, Badges */}
                <XPStreak
                  totalXp={xpRow?.total_xp || 0}
                  currentStreak={streakRow?.current_streak || 0}
                  longestStreak={streakRow?.longest_streak || 0}
                  lastActivityDate={streakRow?.last_activity_date || null}
                  badgesCount={badgesCount || 0}
                />

                {/* Stat cards — HiStudy style */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {STATS.map(({ value, label, bg, color }) => (
                    <div key={label} style={{
                      background: bg, borderRadius: '16px', padding: '20px 16px',
                      border: `1.5px solid color-mix(in srgb, ${color} 20%, transparent)`,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color, lineHeight: 1 }}>{value}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Resume banner */}
                {resumeCourse && resumeCourse.progressPercent > 0 && resumeCourse.progressPercent < 100 && (
                  <div style={{
                    background: 'var(--en-green-light)',
                    border: '1.5px solid var(--en-green-15)',
                    borderRadius: '18px', padding: '24px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
                  }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--en-green)', marginBottom: '6px' }}>
                        Retomá donde lo dejaste
                      </p>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--en-text)', letterSpacing: '-0.3px' }}>
                        {resumeCourse.courseTitle}
                      </h2>
                      {resumeCourse.nextLessonTitle && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginTop: '4px' }}>
                          Próximo: {resumeCourse.nextLessonTitle}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-green)', letterSpacing: '-1px', lineHeight: 1 }}>
                          {resumeCourse.progressPercent}%
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)', marginTop: '2px' }}>completado</div>
                      </div>
                      <Link
                        href={resumeCourse.nextLessonId
                          ? `/aprender/${resumeCourse.courseSlug}/${resumeCourse.nextLessonId}`
                          : `/aprender/${resumeCourse.courseSlug}`}
                        style={{
                          padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                          background: 'var(--en-green)', color: 'var(--en-white)',
                          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                          boxShadow: 'var(--en-shadow-green-sm)',
                        }}
                      >
                        Continuar →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Mis cursos — HiStudy progress bar style */}
                <div style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--en-text)', letterSpacing: '-0.3px' }}>
                      Mis cursos
                    </h2>
                    <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-green)', textDecoration: 'none' }}>
                      Explorar más →
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              </>
            )}
          </main>
        </div>
      </div>

      <BottomNav activeRoute="/dashboard" />
    </div>
  )
}
