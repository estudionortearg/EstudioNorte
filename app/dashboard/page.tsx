import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import CourseProgressCard from '@/components/dashboard/CourseProgressCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Dashboard — Estudio Norte',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function StatCard({ value, label, color = 'var(--color-teal)' }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{
      padding: '28px 24px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: '40px', letterSpacing: '-2px',
        color, lineHeight: 1, marginBottom: '8px',
      }}>{value}</div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '12px',
        letterSpacing: '1px', textTransform: 'uppercase',
        color: 'rgba(247,247,242,0.3)',
      }}>{label}</div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`course_id, courses (id, slug, title)`)
    .eq('user_id', user.id)

  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; slug: string; title: string } | null
      if (!course) return null

      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', course.id)
      const moduleIds = modules?.map((m: { id: string }) => m.id) || []
      if (moduleIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0 }

      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds)
      const lessonIds = lessons?.map((l: { id: string }) => l.id) || []
      if (lessonIds.length === 0) return { courseSlug: course.slug, courseTitle: course.title, progressPercent: 0 }

      const { count: totalLessons } = await supabase
        .from('lessons').select('id', { count: 'exact', head: true }).in('id', lessonIds)
      const { count: completedLessons } = await supabase
        .from('progress').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).in('lesson_id', lessonIds)

      const percent = totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0
      return { courseSlug: course.slug, courseTitle: course.title, progressPercent: percent }
    })
  )

  const validCourses = coursesWithProgress.filter(Boolean) as Array<{
    courseSlug: string; courseTitle: string; progressPercent: number
  }>

  const activeCourses = validCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100).length
  const completedCourses = validCourses.filter(c => c.progressPercent === 100).length
  const displayName = user.email?.split('@')[0] || 'estudiante'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)' }}>

      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(10,10,20,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1152px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px',
        }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px',
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'rgba(247,247,242,0.3)',
            }}>
              {getGreeting()},&nbsp;
            </span>
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px',
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--color-teal)',
            }}>
              {displayName}
            </span>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(78,205,196,0.3), rgba(255,107,107,0.15))',
            border: '1px solid rgba(78,205,196,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
            color: 'var(--color-teal)',
          }}>
            {initials}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '56px 24px' }}>

        {/* Heading */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-2px',
            color: 'var(--color-text)', lineHeight: 1.05,
          }}>
            Tu aprendizaje
          </h1>
          <p style={{ color: 'rgba(247,247,242,0.35)', fontSize: '15px', marginTop: '8px' }}>
            Seguís donde lo dejaste.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '56px',
        }}>
          <StatCard value={validCourses.length} label="Cursos inscriptos" />
          <StatCard value={activeCourses} label="En progreso" color="var(--color-coral)" />
          <StatCard value={completedCourses} label="Completados" color="rgba(247,247,242,0.6)" />
          <StatCard value={completedCourses > 0 ? completedCourses : '—'} label="Certificados" color="var(--color-teal)" />
        </div>

        {/* Courses */}
        {validCourses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px',
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '1px solid rgba(78,205,196,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 8h16M6 12h10M14 20l6-6" stroke="rgba(78,205,196,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(247,247,242,0.4)', fontSize: '16px', marginBottom: '24px', lineHeight: 1.6 }}>
              Todavía no tenés cursos.<br />Empezá hoy.
            </p>
            <Button href="/cursos" variant="primary">Ver cursos disponibles</Button>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '20px', color: 'var(--color-text)', letterSpacing: '-0.5px',
              }}>
                Mis cursos
              </h2>
              <Button href="/cursos" variant="secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                Explorar más
              </Button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {validCourses.map(course => (
                <CourseProgressCard key={course.courseSlug} {...course} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <div style={{
          marginTop: '64px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          {[
            { href: '/certificados', label: 'Mis certificados' },
            { href: '/perfil', label: 'Mi perfil' },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'rgba(247,247,242,0.3)', textDecoration: 'none',
              letterSpacing: '0.5px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-teal)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(247,247,242,0.3)')}
            >
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
