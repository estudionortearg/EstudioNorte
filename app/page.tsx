import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getPublishedCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('id, slug, title, subtitle, price_ars')
    .eq('is_published', true)
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const courses = await getPublishedCourses()

  const OUTCOMES = [
    { emoji: '🎨', title: 'Diseñás tu propio logo con IA', desc: 'Sin saber de diseño. Sin pagar un diseñador. Con herramientas que cualquiera puede usar.' },
    { emoji: '📐', title: 'Armás una identidad visual completa', desc: 'Paleta, tipografía, estilo visual — todo coherente y listo para aplicar en cualquier soporte.' },
    { emoji: '📣', title: 'Generás contenido que vende', desc: 'Textos, imágenes y posts para redes sociales usando IA como si fuera tu equipo creativo.' },
    { emoji: '🤝', title: 'Conseguís tus primeros clientes', desc: 'El proceso real que usa Juan con sus propios clientes para cerrar proyectos de marca.' },
  ]

  const AUDIENCE = [
    { icon: '🧑‍💼', who: 'Emprendedores', desc: 'Que quieren una marca profesional sin invertir miles de pesos en agencias.' },
    { icon: '🎓', who: 'Recién egresados', desc: 'Que necesitan diferenciarse para conseguir su primer cliente o trabajo.' },
    { icon: '📱', who: 'Community managers', desc: 'Que ya manejan redes pero quieren agregar diseño y marca a sus servicios.' },
    { icon: '🛍️', who: 'Dueños de negocio', desc: 'Que venden algo pero cuya marca no los representa como merecen.' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="#cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Cursos</Link>
            <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Precios</Link>
            <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', textDecoration: 'none' }}>Juan</Link>
            <Link href="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', textDecoration: 'none', padding: '7px 16px', borderRadius: '8px', border: '1.5px solid var(--en-green)' }}>
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(72px, 10vw, 128px) clamp(16px, 5vw, 64px) clamp(48px, 6vw, 80px)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: '64px', alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '24px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--en-green)', display: 'inline-block' }}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Diseño de marca con IA — para Argentina y LATAM</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(38px, 5.5vw, 68px)', letterSpacing: '-2.5px', color: 'var(--en-text)', lineHeight: 1.02, marginBottom: '20px' }}>
              Tu marca,<br />
              diseñada con <span style={{ color: 'var(--en-green)' }}>IA</span>,<br />
              sin agencia.
            </h1>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '460px' }}>
              Aprendé a crear logos, identidades visuales y contenido para redes con inteligencia artificial. Cursos prácticos de Juan Gallino, con el proceso que él usa con sus propios clientes.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link href="#cursos" style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--en-green)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--en-shadow-green)' }}>
                Ver cursos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/sobre-juano" style={{ padding: '14px 28px', borderRadius: '12px', background: 'transparent', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', border: '1.5px solid var(--en-border)' }}>
                Quién es Juan
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['JG','MA','LR','CP','FT'].map((init, i) => (
                  <div key={init} style={{ width: '32px', height: '32px', borderRadius: '50%', background: i % 2 === 0 ? 'var(--en-green-light)' : 'color-mix(in srgb, var(--en-coral) 12%, transparent)', border: '2px solid var(--en-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--en-text-soft)', marginLeft: i > 0 ? '-8px' : '0', zIndex: 5 - i, position: 'relative' }}>{init}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>+500 alumnos · 4.9 rating</span>
              </div>
            </div>
          </div>

          {/* Right: visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'var(--en-surface)', borderRadius: '20px', boxShadow: 'var(--en-shadow-lg)', padding: '28px', width: '100%', maxWidth: '340px', border: '1px solid var(--en-border)' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', borderRadius: '12px', height: '160px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--en-text)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
                Tu Marca con IA — de 0 a cliente
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '16px' }}>
                Por Juan Gallino · 8 lecciones
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['Logo IA', 'Identidad', 'Canva'].map(tag => (
                  <span key={tag} style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--en-green-light)', color: 'var(--en-green)', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'var(--en-border)', marginBottom: '8px' }}>
                <div style={{ height: '100%', borderRadius: '2px', background: 'var(--en-green)', width: '35%' }}/>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)' }}>3 de 8 lecciones completadas</div>
            </div>

            {/* Floating: XP */}
            <div style={{ position: 'absolute', top: '8px', right: '0px', background: 'var(--en-surface)', borderRadius: '14px', boxShadow: 'var(--en-shadow-sm)', padding: '10px 14px', border: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-text)' }}>+250 XP</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>al completar</div>
              </div>
            </div>

            {/* Floating: students */}
            <div style={{ position: 'absolute', bottom: '8px', left: '0px', background: 'var(--en-surface)', borderRadius: '14px', boxShadow: 'var(--en-shadow-sm)', padding: '10px 14px', border: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>🎓</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-text)' }}>500+</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>alumnos activos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ padding: '0 clamp(16px, 5vw, 64px) 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', background: 'var(--en-surface)', borderRadius: '16px', border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-sm)', overflow: 'hidden', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Alumnos activos', icon: '👥' },
            { value: '4.9★', label: 'Rating promedio', icon: '⭐' },
            { value: '100%', label: 'Online y a tu ritmo', icon: '🎯' },
            { value: 'IA', label: 'Integrada en todo', icon: '🤖' },
          ].map(({ value, label, icon }, i) => (
            <div key={label} style={{ flex: '1', minWidth: '140px', padding: '24px 28px', borderRight: i < 3 ? '1px solid var(--en-border)' : 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '22px' }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--en-text)', letterSpacing: '-0.8px' }}>{value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>¿Esto es para vos?</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '12px' }}>
              Diseñado para quienes <span style={{ color: 'var(--en-green)' }}>arrancan de cero</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', maxWidth: '480px', margin: '0 auto' }}>
              No necesitás experiencia en diseño. Necesitás querer hacer algo diferente.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {AUDIENCE.map(({ icon, who, desc }) => (
              <div key={who} style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>{icon}</span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--en-text)', letterSpacing: '-0.3px' }}>{who}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ VAS A LOGRAR ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '64px', alignItems: 'center' }}>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Qué vas a lograr</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', lineHeight: 1.1, marginBottom: '16px' }}>
                Resultados reales,<br />no teoría de libro
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', lineHeight: 1.7 }}>
                Cada curso termina con algo que podés mostrar. Un logo terminado, un sistema de marca listo para usar, contenido que podés publicar hoy mismo.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {OUTCOMES.map(({ emoji, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', marginBottom: '4px', letterSpacing: '-0.2px' }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CURSOS ── */}
      <section id="cursos" style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Catálogo de cursos</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
                Elegí por dónde empezar
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)' }}>
                Podés arrancar gratis y avanzar a tu ritmo.
              </p>
            </div>
            <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-green)', textDecoration: 'none', fontWeight: 600, padding: '8px 16px', border: '1px solid var(--en-green)', borderRadius: '8px', whiteSpace: 'nowrap' }}>
              Ver todos los cursos →
            </Link>
          </div>

          {courses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {courses.map((course, i) => (
                <Link key={course.slug} href={`/cursos/${course.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '20px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                    {/* Thumbnail */}
                    <div style={{ height: '180px', background: i % 2 === 0 ? 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)' : 'linear-gradient(135deg, var(--en-coral) 0%, var(--en-green) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {i === 0 && (
                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#fff', color: 'var(--en-green)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.5px' }}>RECOMENDADO</span>
                      )}
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    {/* Content */}
                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.3px', lineHeight: 1.25 }}>{course.title}</h3>
                      {course.subtitle && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5, flex: 1 }}>{course.subtitle}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--en-border)' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                          {course.price_ars > 0 ? `$${course.price_ars.toLocaleString('es-AR')} ARS` : 'Gratis'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '5px 12px', borderRadius: '20px' }}>
                          Ver curso →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Placeholder si no hay cursos publicados aún */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Tu Marca con IA — de 0 a cliente', subtitle: 'Logo, identidad visual y primeros clientes. El proceso completo con IA.', tag: 'Nuevo', color: 'from-green to-coral' },
                { title: 'Canva Avanzado para Emprendedores', subtitle: 'Diseñá piezas para redes, presentaciones y materiales de venta sin ser diseñador.', tag: 'Popular', color: 'from-coral to-green' },
                { title: 'ChatGPT para Contenido de Marca', subtitle: 'Generá copies, captions y estrategia de contenido con IA en la mitad del tiempo.', tag: 'Próximamente', color: 'from-green to-coral' },
              ].map((c, i) => (
                <div key={c.title} style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: c.tag === 'Próximamente' ? 0.7 : 1 }}>
                  <div style={{ height: '180px', background: i % 2 === 0 ? 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)' : 'linear-gradient(135deg, var(--en-coral) 0%, var(--en-green) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', backdropFilter: 'blur(4px)' }}>{c.tag}</span>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.3px', lineHeight: 1.25 }}>{c.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5, flex: 1 }}>{c.subtitle}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--en-border)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>Gratis</span>
                      <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '5px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                        {c.tag === 'Próximamente' ? 'Avisame →' : 'Ver curso →'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── JUAN ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '64px', alignItems: 'center' }}>

            {/* Avatar placeholder */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 'clamp(220px, 30vw, 320px)', height: 'clamp(220px, 30vw, 320px)', borderRadius: '28px', background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--en-shadow-lg)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(56px, 8vw, 96px)', color: 'rgba(255,255,255,0.9)', letterSpacing: '-2px', fontStyle: 'italic' }}>JG</span>
                </div>
                {/* Badge */}
                <div style={{ position: 'absolute', bottom: '-16px', right: '-16px', background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '16px', padding: '12px 18px', boxShadow: 'var(--en-shadow-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--en-green)', letterSpacing: '-0.5px' }}>500+</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alumnos</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>El instructor</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', fontStyle: 'italic', marginBottom: '20px' }}>
                Juan Gallino
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '16px' }}>
                Diseñador de marcas con IA, basado en Rafaela, Santa Fe. Trabajo con emprendedores y profesionales que quieren construir una identidad visual que se destaque — usando inteligencia artificial para ir más rápido y más lejos.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '28px' }}>
                Lo que enseño acá es el proceso exacto que uso con mis propios clientes. Sin relleno, sin teoría vacía.
              </p>
              <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-green)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Conocer más sobre Juan →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRECIOS PREVIEW ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Planes</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '12px' }}>
            Empezá gratis, crecé a tu ritmo
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
            El primer curso es gratis. Cuando querés más, tenés planes accesibles en ARS o USD.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'FREE', price: '$0', desc: 'Para explorar', features: ['1 lección de muestra', 'Catálogo completo', 'Comunidad lectura'], color: 'var(--en-text-soft)', highlight: false },
              { name: 'NORTE', price: 'U$D 7/mes', desc: 'Para aprender en serio', features: ['5 cursos incluidos', 'Cursos nuevos sin costo extra', 'Certificados'], color: 'var(--en-green)', highlight: true },
              { name: 'NORTE PRO', price: 'U$D 15/mes', desc: 'Para diferenciarte', features: ['Todo Norte', 'Certificados', 'Peer review'], color: 'var(--en-coral)', highlight: false },
            ].map(p => (
              <div key={p.name} style={{ background: p.highlight ? 'var(--en-green)' : 'var(--en-surface)', border: `1.5px solid ${p.highlight ? 'transparent' : 'var(--en-border)'}`, borderRadius: '20px', padding: '24px', boxShadow: p.highlight ? 'var(--en-shadow-green)' : 'var(--en-shadow-sm)', textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: p.highlight ? 'rgba(255,255,255,0.7)' : p.color, marginBottom: '8px' }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.8px', color: p.highlight ? '#fff' : 'var(--en-text)', marginBottom: '4px' }}>{p.price}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: p.highlight ? 'rgba(255,255,255,0.7)' : 'var(--en-text-soft)', marginBottom: '16px' }}>{p.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.highlight ? 'rgba(255,255,255,0.9)' : 'var(--en-green)'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: p.highlight ? 'rgba(255,255,255,0.85)' : 'var(--en-text)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-green)', textDecoration: 'none' }}>
            Ver planes completos con todas las funciones →
          </Link>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', borderRadius: '28px', padding: 'clamp(48px, 6vw, 72px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>

            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>
                EMPEZÁ HOY
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4.5vw, 52px)', letterSpacing: '-2px', color: '#fff', marginBottom: '16px', lineHeight: 1.05 }}>
                Tu marca no se va a<br />diseñar sola.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'rgba(255,255,255,0.78)', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px' }}>
                El primer curso es gratis. En menos de 2 horas ya vas a tener algo concreto para mostrar.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/cursos" style={{ padding: '14px 32px', borderRadius: '12px', background: '#fff', color: 'var(--en-green)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                  Empezar gratis →
                </Link>
                <Link href="/precios" style={{ padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Ver planes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px clamp(16px, 5vw, 64px)', borderTop: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '9px' }}>EN</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)' }}>© 2026 Estudio Norte — Juan Gallino · Rafaela, SF, Argentina</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/cursos" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)', textDecoration: 'none' }}>Cursos</Link>
          <Link href="/precios" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)', textDecoration: 'none' }}>Precios</Link>
          <Link href="/sobre-juano" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-faint)', textDecoration: 'none' }}>Juan</Link>
        </div>
      </footer>

    </div>
  )
}
