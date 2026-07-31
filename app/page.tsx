import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCardGrid from '@/components/sections/CourseCardGrid'

async function getPublishedCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('id, slug, title, description, cover_image_url')
    .eq('is_published', true)
    .limit(4)
  return data || []
}

export default async function HomePage() {
  const courses = await getPublishedCourses()

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header público */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(250,250,248,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'var(--en-green)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px',
            }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>
              Estudio Norte
            </span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Cursos</Link>
            <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Precios</Link>
            <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Juan</Link>
            <Link href="/login" style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              color: 'var(--en-green)', textDecoration: 'none',
              padding: '7px 16px', borderRadius: '8px',
              border: '1.5px solid var(--en-green)',
            }}>Ingresar</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: 'clamp(64px, 10vw, 120px) clamp(16px, 5vw, 64px)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--en-green-light)', marginBottom: '24px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--en-green)', display: 'inline-block',
            }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>
              Formación digital para Argentina y LATAM
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 80px)', letterSpacing: '-3px',
            color: 'var(--en-text)', lineHeight: 1.0, marginBottom: '24px',
          }}>
            Aprendé<br />
            <span style={{ color: 'var(--en-green)' }}>marketing</span><br />
            con propósito.
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--en-text-soft)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px',
          }}>
            Guías, cursos y mentoría de Juan Gallino — CM, IA y publicidad para que crezcas de verdad.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/cursos" style={{
              padding: '14px 28px', borderRadius: '12px',
              background: 'var(--en-green)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 20px rgba(61,122,95,0.3)',
            }}>
              Ver cursos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/precios" style={{
              padding: '14px 28px', borderRadius: '12px',
              background: 'transparent', color: 'var(--en-text)',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px',
              textDecoration: 'none', border: '1.5px solid var(--en-border)',
            }}>
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 clamp(16px, 5vw, 64px) 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Alumnos activos' },
            { value: '12', label: 'Cursos y guías' },
            { value: '4.9★', label: 'Rating promedio' },
            { value: '100%', label: 'Online y a tu ritmo' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', color: 'var(--en-text)', letterSpacing: '-1.5px' }}>
                {value}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cursos preview */}
      {courses.length > 0 && (
        <section style={{ padding: '64px clamp(16px, 5vw, 64px)', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-1.5px', color: 'var(--en-text)' }}>
                Lo que podés aprender
              </h2>
              <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-green)', textDecoration: 'none', fontWeight: 500 }}>
                Ver todos →
              </Link>
            </div>
            <CourseCardGrid courses={courses} />
          </div>
        </section>
      )}

      {/* CTA final */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 52px)', letterSpacing: '-2px', color: 'var(--en-text)', marginBottom: '16px' }}>
            Empezá hoy.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', color: 'var(--en-text-soft)', marginBottom: '32px' }}>
            El primer paso es el más difícil. El resto lo hacemos juntos.
          </p>
          <Link href="/precios" style={{
            padding: '16px 40px', borderRadius: '14px',
            background: 'var(--en-coral)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '16px',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(232,115,90,0.35)',
          }}>
            Ver planes →
          </Link>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer style={{
        padding: '24px clamp(16px, 5vw, 64px)',
        borderTop: '1px solid var(--en-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
          © 2026 Estudio Norte — Juan Gallino
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>
          Rafaela, Santa Fe, Argentina
        </span>
      </footer>

    </div>
  )
}
