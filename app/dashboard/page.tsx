import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import CourseProgressCard from '@/components/dashboard/CourseProgressCard'
import Link from 'next/link'
import { Metadata } from 'next'

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

      const { data: lessons } = await supabase.from('lessons').select('id, title, slug').in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []

      if (lessonIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0, totalLessons: 0, completedLessons: 0 }

      const { data: progressRows } = await supabase
        .from('progress').select('lesson_id')
        .eq('user_id', user.id).in('lesson_id', lessonIds)

      const completedIds = new Set((progressRows || []).map(p => p.lesson_id))
      const completedLessons = completedIds.size
      const totalLessons = lessonIds.length
      const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Find next lesson (first not completed)
      const nextLesson = lessons?.find((l: { id: string; title: string; slug: string }) => !completedIds.has(l.id))

      return {
        courseSlug: course.slug,
        courseTitle: course.title,
        progressPercent: percent,
        totalLessons,
        completedLessons,
        lastLessonSlug: nextLesson?.slug,
        lastLessonTitle: nextLesson?.title,
      }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    courseSlug: string; courseTitle: string; progressPercent: number
    totalLessons: number; completedLessons: number
    lastLessonSlug?: string; lastLessonTitle?: string
  }>

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100)
  const completedCourses = validCourses.filter(c => c.progressPercent === 100)
  const notStarted = validCourses.filter(c => c.progressPercent === 0)
  const displayName = user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()

  // Resume card = most recent active course
  const resumeCourse = activeCourses[0] || validCourses[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)' }}>

      {/* Sticky top bar */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 10, padding: '0 clamp(16px, 4vw, 48px)',
      }}>
        <div style={{
          maxWidth: '1152px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              ESTUDIO <span style={{ color: 'var(--color-teal)' }}>NORTE</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)', textDecoration: 'none' }}>
              Ver cursos
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', letterSpacing: '1px' }}>
                  {getGreeting()}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: 'var(--color-teal)' }}>
                  {displayName}
                </p>
              </div>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(78,205,196,0.25), rgba(255,107,107,0.1))',
                border: '1px solid rgba(78,205,196,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--color-teal)',
              }}>
                {initials}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 48px)' }}>

        {validCourses.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px' }}>
              Bienvenido
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px', color: 'var(--color-text)', marginBottom: '16px' }}>
              Tu aprendizaje<br />empieza hoy
            </h1>
            <p style={{ color: 'rgba(247,247,242,0.35)', fontSize: '16px', marginBottom: '40px' }}>
              Todavía no tenés cursos. Explorá el catálogo y empezá.
            </p>
            <Button href="/cursos" variant="primary">Ver cursos disponibles →</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '40px', alignItems: 'start' }}>

            {/* Left col — main content */}
            <div style={{ gridColumn: 'span 2', minWidth: 0 }}>

              {/* Header */}
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
                  Tu progreso
                </p>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-2px',
                  color: 'var(--color-text)', lineHeight: 1.05,
                }}>
                  Seguís donde<br />lo dejaste.
                </h1>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '48px' }}>
                {[
                  { value: validCourses.length, label: 'Inscriptos', color: 'rgba(247,247,242,0.7)' },
                  { value: activeCourses.length, label: 'En progreso', color: 'var(--color-coral)' },
                  { value: completedCourses.length, label: 'Completados', color: 'var(--color-teal)' },
                  { value: completedCourses.length > 0 ? completedCourses.length : '—', label: 'Certificados', color: 'var(--color-teal)' },
                ].map(({ value, label, color }) => (
                  <div key={label} style={{
                    padding: '18px 16px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: `radial-gradient(circle at 100% 0%, ${color}10 0%, transparent 70%)` }}/>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', letterSpacing: '-1.5px', color, lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', marginTop: '6px' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resume banner — only if has active course */}
              {resumeCourse && resumeCourse.progressPercent > 0 && resumeCourse.progressPercent < 100 && (
                <div style={{
                  padding: '24px 28px', borderRadius: '18px', marginBottom: '40px',
                  background: 'linear-gradient(135deg, rgba(255,107,107,0.08), rgba(78,205,196,0.04))',
                  border: '1px solid rgba(255,107,107,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '20px', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-coral)', marginBottom: '6px' }}>
                      Retomá donde lo dejaste
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
                      {resumeCourse.courseTitle}
                    </h3>
                    {resumeCourse.lastLessonTitle && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)', marginTop: '4px' }}>
                        Próximo: {resumeCourse.lastLessonTitle}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--color-coral)', letterSpacing: '-1px' }}>
                        {resumeCourse.progressPercent}%
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(247,247,242,0.3)' }}>completado</div>
                    </div>
                    <Link
                      href={resumeCourse.lastLessonSlug
                        ? `/aprender/${resumeCourse.courseSlug}/${resumeCourse.lastLessonSlug}`
                        : `/aprender/${resumeCourse.courseSlug}`}
                      style={{
                        padding: '12px 24px', borderRadius: '10px', textDecoration: 'none',
                        background: 'var(--color-coral)', color: '#fff',
                        fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Continuar →
                    </Link>
                  </div>
                </div>
              )}

              {/* Course cards */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
                    Mis cursos
                  </h2>
                  <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-teal)', textDecoration: 'none' }}>
                    Explorar más →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
                  {validCourses.map(course => (
                    <CourseProgressCard key={course.courseSlug} {...course} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Quick links */}
              <div style={{
                padding: '20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', marginBottom: '12px' }}>
                  Accesos rápidos
                </p>
                {[
                  { href: '/certificados', label: 'Mis certificados', icon: '★' },
                  { href: '/cursos', label: 'Ver catálogo', icon: '◎' },
                ].map(({ href, label, icon }) => (
                  <Link key={href} href={href} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 0', textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'rgba(247,247,242,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-teal)' }}>{icon}</span>
                    {label}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.4 }}>→</span>
                  </Link>
                ))}
                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  paddingTop: '10px', textDecoration: 'none',
                  color: 'rgba(247,247,242,0.2)', fontFamily: 'var(--font-body)', fontSize: '12px',
                }}>
                  <span style={{ fontSize: '11px' }}>⎋</span>
                  Cerrar sesión
                </Link>
              </div>

              {/* Guarantee chip */}
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(78,205,196,0.04)', border: '1px solid rgba(78,205,196,0.1)',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1l1.3 3.5L12 5l-2.5 2.5.5 3-3-1.5-3 1.5.5-3L2 5l3.7-.5L7 1z" stroke="rgba(78,205,196,0.8)" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: 'var(--color-teal)', marginBottom: '4px' }}>Garantía 7 días</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', lineHeight: 1.5 }}>Si no quedás conforme, te devolvemos el dinero sin preguntas.</p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: 'rgba(247,247,242,0.5)', marginBottom: '6px' }}>
                  ¿Necesitás ayuda?
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', lineHeight: 1.5, marginBottom: '12px' }}>
                  Escribinos por WhatsApp y te respondemos rápido.
                </p>
                <a
                  href="https://wa.me/5493492000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', textDecoration: 'none',
                    background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)',
                    color: '#25D366', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1a5.5 5.5 0 014.7 8.3L12 12l-2.7-.8A5.5 5.5 0 116.5 1z" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
