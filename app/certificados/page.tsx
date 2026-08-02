import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = { title: 'Mis Certificados — Estudio Norte' }

export default async function CertificadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).maybeSingle()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'estudiante'

  // Get all enrollments with course data
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at, courses (id, slug, title)')
    .eq('user_id', user.id)

  // For each enrolled course, compute progress
  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string } | null
      if (!course) return null

      const { data: modules } = await supabase.from('modules').select('id, lessons(id)').eq('course_id', course.id)
      const allLessonIds = (modules || []).flatMap(m =>
        ((m.lessons as unknown as { id: string }[]) || []).map(l => l.id)
      )
      const totalLessons = allLessonIds.length
      if (totalLessons === 0) return { ...course, isComplete: false, totalLessons: 0, hasCert: false }

      const { data: progressRows } = await supabase
        .from('progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', allLessonIds)
      const completedCount = (progressRows || []).length
      const isComplete = completedCount >= totalLessons

      // Check if cert exists
      const { data: cert } = await supabase
        .from('certificates')
        .select('issued_at')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .maybeSingle()

      return { ...course, isComplete, totalLessons, completedCount, hasCert: !!cert, issuedAt: cert?.issued_at }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    id: string; slug: string; title: string
    isComplete: boolean; totalLessons: number; completedCount: number
    hasCert: boolean; issuedAt?: string
  }>

  const earned = validCourses.filter(c => c.isComplete)
  const inProgress = validCourses.filter(c => !c.isComplete)

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
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text)', fontWeight: 600 }}>Certificados</span>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          <StudentSidebar activeRoute="/certificados" displayName={displayName} />

          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {validCourses.length === 0 ? (
              <div style={{
                textAlign: 'center', paddingTop: '80px', paddingBottom: '80px',
                border: '1.5px dashed var(--en-border)', borderRadius: '20px',
                background: 'var(--en-surface)',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="1.2" style={{ marginBottom: '20px' }}>
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
                  Todavía no tenés cursos
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--en-text-soft)', fontSize: '15px', marginBottom: '28px' }}>
                  Completá un curso para recibir tu certificado.
                </p>
                <Link href="/cursos" style={{
                  padding: '12px 24px', borderRadius: '12px',
                  background: 'var(--en-green)', color: 'var(--en-white)',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                }}>
                  Ver cursos disponibles →
                </Link>
              </div>
            ) : (
              <>
                {/* Certificados ganados */}
                {earned.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Certificados obtenidos
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 400, color: 'var(--en-text-faint)', marginLeft: '4px' }}>({earned.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {earned.map(c => {
                        const issuedDate = c.issuedAt
                          ? new Date(c.issuedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : null
                        return (
                          <div key={c.slug} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                            padding: '20px 24px', borderRadius: '16px',
                            background: 'var(--en-green-light)', border: '1.5px solid var(--en-green-15)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {/* Medal icon */}
                              <div style={{
                                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--en-green) 0%, color-mix(in srgb, var(--en-green) 60%, var(--en-coral)) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                                </svg>
                              </div>
                              <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '3px' }}>
                                  {c.title}
                                </p>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                                  {issuedDate ? `Emitido el ${issuedDate}` : `${c.totalLessons} lecciones completadas`}
                                </p>
                              </div>
                            </div>
                            <Link href={`/certificados/${c.slug}`} style={{
                              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                              background: 'var(--en-green)', color: 'var(--en-white)',
                              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                              boxShadow: 'var(--en-shadow-green-sm)',
                            }}>
                              Ver certificado →
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* En progreso — próximos certificados */}
                {inProgress.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-soft)" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Próximos certificados
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 400, color: 'var(--en-text-faint)', marginLeft: '4px' }}>({inProgress.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {inProgress.map(c => {
                        const pct = c.totalLessons ? Math.round(((c.completedCount || 0) / c.totalLessons) * 100) : 0
                        return (
                          <div key={c.slug} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                            padding: '20px 24px', borderRadius: '16px',
                            background: 'var(--en-surface)', border: '1.5px solid var(--en-border)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                                background: 'var(--en-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--en-text-faint)" strokeWidth="1.8">
                                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                                </svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', marginBottom: '8px' }}>
                                  {c.title}
                                </p>
                                {/* Progress bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ flex: 1, height: '5px', borderRadius: '100px', background: 'var(--en-border)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '100px', background: 'var(--en-green)', transition: 'width 0.4s ease' }}/>
                                  </div>
                                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {c.completedCount || 0}/{c.totalLessons} lecciones
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/aprender/${c.slug}`} style={{
                              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                              background: 'transparent', color: 'var(--en-green)',
                              border: '1.5px solid var(--en-green)',
                              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                            }}>
                              Continuar →
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <BottomNav activeRoute="/certificados" />
    </div>
  )
}
