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
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
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
              color: 'var(--en-white)', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

          {/* Left: texto */}
          <div>
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
              fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-2.5px',
              color: 'var(--en-text)', lineHeight: 1.05, marginBottom: '20px',
            }}>
              Diseñá tu marca<br />
              con <span style={{ color: 'var(--en-green)' }}>IA</span> y<br />
              <span style={{ color: 'var(--en-coral)' }}>propósito</span>.
            </h1>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.5vw, 18px)',
              color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '440px',
            }}>
              Cursos prácticos de Juan Gallino para crear identidades de marca, generar contenido con IA y conseguir tus primeros clientes.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link href="/cursos" style={{
                padding: '14px 28px', borderRadius: '12px',
                background: 'var(--en-green)', color: 'var(--en-white)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: 'var(--en-shadow-green)',
              }}>
                Empezar gratis
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

            {/* Social proof row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['JG','MA','LR','CP','FT'].map((init, i) => (
                  <div key={init} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: i % 2 === 0 ? 'var(--en-green-light)' : 'var(--en-coral-light)',
                    border: '2px solid var(--en-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: 'var(--en-text-soft)',
                    marginLeft: i > 0 ? '-8px' : '0',
                    zIndex: 5 - i,
                    position: 'relative',
                  }}>{init}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                  +500 alumnos • 4.9 rating
                </span>
              </div>
            </div>
          </div>

          {/* Right: visual mockup */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Main card */}
            <div style={{
              background: 'var(--en-surface)', borderRadius: '20px',
              boxShadow: 'var(--en-shadow-lg)', padding: '28px',
              width: '100%', maxWidth: '340px',
              border: '1px solid var(--en-border)',
            }}>
              {/* Course preview card */}
              <div style={{
                background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
                borderRadius: '12px', height: '140px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: 'var(--en-text)', marginBottom: '6px' }}>
                Tu Marca con IA
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '16px' }}>
                De idea a identidad visual completa
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'var(--en-green-light)', color: 'var(--en-green)',
                  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                }}>GRATIS</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>8 lecciones</div>
              </div>
            </div>

            {/* Floating stat: XP */}
            <div style={{
              position: 'absolute', top: '-16px', right: '-16px',
              background: 'var(--en-surface)', borderRadius: '14px',
              boxShadow: 'var(--en-shadow-sm)', padding: '12px 16px',
              border: '1px solid var(--en-border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: 'var(--en-text)' }}>+250 XP</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>al completar</div>
              </div>
            </div>

            {/* Floating stat: students */}
            <div style={{
              position: 'absolute', bottom: '-16px', left: '-16px',
              background: 'var(--en-surface)', borderRadius: '14px',
              boxShadow: 'var(--en-shadow-sm)', padding: '12px 16px',
              border: '1px solid var(--en-border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>🎓</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: 'var(--en-text)' }}>500+</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>alumnos activos</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: '0 clamp(16px, 5vw, 64px) 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', gap: '0', flexWrap: 'wrap',
          background: 'var(--en-surface)', borderRadius: '16px',
          border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-sm)',
          overflow: 'hidden',
        }}>
          {[
            { value: '500+', label: 'Alumnos activos', icon: '👥' },
            { value: '12', label: 'Cursos y guías', icon: '📚' },
            { value: '4.9★', label: 'Rating promedio', icon: '⭐' },
            { value: '100%', label: 'Online y a tu ritmo', icon: '🎯' },
          ].map(({ value, label, icon }, i) => (
            <div key={label} style={{
              flex: '1', minWidth: '140px', padding: '24px 28px',
              borderRight: i < 3 ? '1px solid var(--en-border)' : 'none',
              display: 'flex', gap: '12px', alignItems: 'center',
            }}>
              <span style={{ fontSize: '24px' }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--en-text)', letterSpacing: '-1px' }}>
                  {value}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cursos preview */}
      {courses.length > 0 && (
        <section style={{ padding: '64px clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
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
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
            borderRadius: '24px', padding: 'clamp(40px, 6vw, 64px)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}/>
            <div style={{
              position: 'absolute', bottom: '-60px', left: '-60px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }}/>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-1.5px',
              color: '#fff', marginBottom: '12px', position: 'relative',
            }}>
              Empezá hoy — gratis.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '16px',
              color: 'rgba(255,255,255,0.80)', marginBottom: '28px',
              position: 'relative',
            }}>
              El primer curso es gratis. El resto lo hacemos juntos.
            </p>
            <Link href="/cursos" style={{
              padding: '14px 32px', borderRadius: '12px',
              background: '#fff', color: 'var(--en-green)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px',
              textDecoration: 'none', display: 'inline-block',
              position: 'relative',
            }}>
              Ver cursos →
            </Link>
          </div>
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
