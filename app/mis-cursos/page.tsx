import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'
import ProgressBar from '@/components/ui/ProgressBar'

export const metadata: Metadata = { title: 'Mis Cursos — Estudio Norte' }

export default async function MisCursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at, courses (id, slug, title, subtitle)')
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles').select('plan, full_name').eq('id', user.id).maybeSingle()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'estudiante'

  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string; subtitle: string } | null
      if (!course) return null

      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', course.id)
      const moduleIds = modules?.map((m: { id: string }) => m.id) || []
      if (moduleIds.length === 0) return { ...course, progressPercent: 0, totalLessons: 0, completedLessons: 0, enrolledAt: enrollment.enrolled_at }

      const { data: lessons } = await supabase.from('lessons').select('id, title').in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []
      if (lessonIds.length === 0) return { ...course, progressPercent: 0, totalLessons: 0, completedLessons: 0, enrolledAt: enrollment.enrolled_at }

      const { data: progressRows } = await supabase
        .from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', lessonIds)

      const completedIds = new Set((progressRows || []).map(p => p.lesson_id))
      const completedLessons = completedIds.size
      const totalLessons = lessonIds.length
      const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
      const nextLesson = lessons?.find((l: { id: string; title: string }) => !completedIds.has(l.id))

      return {
        ...course,
        progressPercent,
        totalLessons,
        completedLessons,
        enrolledAt: enrollment.enrolled_at,
        nextLessonId: nextLesson?.id,
      }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    id: string; slug: string; title: string; subtitle: string
    progressPercent: number; totalLessons: number; completedLessons: number
    enrolledAt: string; nextLessonId?: string
  }>

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const notStarted = validCourses.filter(c => c.progressPercent === 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>

      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: '12px', height: '60px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            Dashboard
          </Link>
          <span style={{ color: 'var(--en-border)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text)', fontWeight: 600 }}>Mis Cursos</span>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          <StudentSidebar activeRoute="/mis-cursos" displayName={displayName} />

          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {validCourses.length === 0 ? (
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
                  Explorá el catálogo y empezá a aprender.
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
                {/* Stats strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { value: validCourses.length, label: 'Inscriptos', color: 'var(--en-green)', bg: 'var(--en-green-light)' },
                    { value: activeCourses.length, label: 'En progreso', color: 'var(--en-coral)', bg: 'color-mix(in srgb, var(--en-coral) 10%, var(--en-surface))' },
                    { value: completedCourses.length, label: 'Completados', color: 'var(--en-green)', bg: 'color-mix(in srgb, var(--en-green) 8%, var(--en-surface))' },
                  ].map(({ value, label, color, bg }) => (
                    <div key={label} style={{
                      background: bg, borderRadius: '16px', padding: '20px 16px',
                      border: `1.5px solid color-mix(in srgb, ${color} 20%, transparent)`, textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* En progreso */}
                {activeCourses.length > 0 && (
                  <section style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '24px 28px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--en-coral)', display: 'inline-block' }}/>
                      En progreso
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {activeCourses.map(c => (
                        <ProgressBar
                          key={c.slug}
                          label={c.title}
                          sublabel={`${c.completedLessons}/${c.totalLessons} lecciones`}
                          value={c.progressPercent}
                          href={c.nextLessonId ? `/aprender/${c.slug}/${c.nextLessonId}` : `/aprender/${c.slug}`}
                          isComplete={false}
                          height={5}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* No iniciados */}
                {notStarted.length > 0 && (
                  <section style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '24px 28px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--en-border)', display: 'inline-block' }}/>
                      Sin empezar
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {notStarted.map(c => (
                        <div key={c.slug} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px', borderRadius: '12px', border: '1px solid var(--en-border)',
                          background: 'var(--en-bg)', gap: '16px', flexWrap: 'wrap',
                        }}>
                          <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', marginBottom: '2px' }}>{c.title}</p>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>{c.totalLessons} lecciones</p>
                          </div>
                          <Link href={`/aprender/${c.slug}`} style={{
                            padding: '9px 18px', borderRadius: '10px', textDecoration: 'none',
                            background: 'var(--en-green)', color: 'var(--en-white)',
                            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                          }}>
                            Empezar →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Completados */}
                {completedCourses.length > 0 && (
                  <section style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '24px 28px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--en-green)', display: 'inline-block' }}/>
                      Completados
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {completedCourses.map(c => (
                        <div key={c.slug} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px', borderRadius: '12px',
                          background: 'var(--en-green-light)', border: '1px solid var(--en-green-15)',
                          gap: '16px', flexWrap: 'wrap',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'var(--en-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                            </div>
                            <div>
                              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', marginBottom: '2px' }}>{c.title}</p>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)' }}>{c.totalLessons} lecciones completadas</p>
                            </div>
                          </div>
                          <Link href={`/certificados/${c.slug}`} style={{
                            padding: '9px 18px', borderRadius: '10px', textDecoration: 'none',
                            background: 'var(--en-green)', color: 'var(--en-white)',
                            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                          }}>
                            Ver certificado →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <BottomNav activeRoute="/mis-cursos" />
    </div>
  )
}
