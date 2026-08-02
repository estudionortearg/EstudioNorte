import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LandingAnimations, FaqAccordion } from '@/components/landing/LandingAnimations'

async function getPublishedCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('id, slug, title, subtitle, price_ars')
    .eq('is_published', true)
    .limit(6)
  return data || []
}

const FAQS = [
  {
    q: '¿Necesito saber diseño para hacer los cursos?',
    a: 'No. Los cursos están pensados para personas sin ninguna experiencia previa en diseño. Todo lo que necesitás es ganas de aprender y una computadora.',
  },
  {
    q: '¿Qué incluye el plan gratuito?',
    a: 'Con el plan gratuito podés acceder al primer módulo de cada curso, explorar el catálogo completo y participar en la comunidad en modo lectura. Es suficiente para ver si esto es para vos.',
  },
  {
    q: '¿Qué herramientas de IA voy a aprender a usar?',
    a: 'Usamos Midjourney, DALL·E, Adobe Firefly, ChatGPT y Canva con IA, entre otras. El foco no está en la herramienta en sí, sino en el proceso de diseño de marca — la IA es el vehículo.',
  },
  {
    q: '¿Los cursos tienen fecha de inicio o los hago a mi ritmo?',
    a: 'Son 100% a tu ritmo. Empezás cuando querés, pausás cuando necesitás, y avanzás sin presión. Todo el contenido está disponible desde el momento en que te inscribís.',
  },
  {
    q: '¿Cómo se cobran los planes? ¿Se renuevan solos?',
    a: 'Los planes Norte y Norte Pro son suscripciones mensuales que se renuevan automáticamente. Podés cancelarlas cuando querás desde tu perfil, sin trámites ni penalidades.',
  },
  {
    q: '¿Obtengo un certificado al terminar?',
    a: 'Sí. Al completar cada curso recibís un certificado verificable con un código único. Podés compartirlo en LinkedIn o enviarlo a un cliente para demostrar lo que aprendiste.',
  },
]

export default async function HomePage() {
  const courses = await getPublishedCourses()

  const OUTCOMES = [
    { title: 'Diseñás tu propio logo con IA', desc: 'Sin saber de diseño. Sin pagar un diseñador. Con herramientas que cualquiera puede usar.' },
    { title: 'Armás una identidad visual completa', desc: 'Paleta, tipografía, estilo visual — todo coherente y listo para aplicar en cualquier soporte.' },
    { title: 'Generás contenido que vende', desc: 'Textos, imágenes y posts para redes sociales usando IA como si fuera tu equipo creativo.' },
    { title: 'Conseguís tus primeros clientes', desc: 'El proceso real que usa Juan con sus propios clientes para cerrar proyectos de marca.' },
  ]

  const AUDIENCE = [
    { who: 'Emprendedores', desc: 'Que quieren una marca profesional sin invertir miles de pesos en agencias.' },
    { who: 'Recién egresados', desc: 'Que necesitan diferenciarse para conseguir su primer cliente o trabajo.' },
    { who: 'Community managers', desc: 'Que ya manejan redes pero quieren agregar diseño y marca a sus servicios.' },
    { who: 'Dueños de negocio', desc: 'Que venden algo pero cuya marca no los representa como merecen.' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <LandingAnimations />

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
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '24px' }}>
              <span className="badge-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--en-green)', display: 'inline-block' }}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>+500 emprendedores ya arrancaron — sumáte</span>
            </div>

            <h1 className="hero-h1" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 5.5vw, 66px)', letterSpacing: '-2.5px', color: 'var(--en-text)', lineHeight: 1.02, marginBottom: '20px' }}>
              De 0 a marca<br />
              profesional con <span style={{ color: 'var(--en-green)' }}>IA</span><br />
              en un fin de semana.
            </h1>

            <p className="hero-sub" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'var(--en-text-soft)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '460px' }}>
              El proceso exacto que Juan usa con sus propios clientes. Sin diseñador, sin agencia, sin años de experiencia. Solo IA y las ganas de diferenciarte.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link href="#cursos" className="btn-glow" style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--en-green)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--en-shadow-green)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
                Empezar gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/sobre-juano" style={{ padding: '14px 28px', borderRadius: '12px', background: 'transparent', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px', textDecoration: 'none', border: '1.5px solid var(--en-border)' }}>
                Ver el proceso
              </Link>
            </div>

            {/* Social proof */}
            <div className="hero-proof" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['JG','MA','LR','CP','FT'].map((init, i) => (
                  <div key={init} style={{ width: '32px', height: '32px', borderRadius: '50%', background: i % 2 === 0 ? 'var(--en-green-light)' : 'color-mix(in srgb, var(--en-coral) 12%, transparent)', border: '2px solid var(--en-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--en-text-soft)', marginLeft: i > 0 ? '-8px' : '0', zIndex: 5 - i, position: 'relative' }}>{init}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>+500 alumnos · 4.9 rating · 100% práctico</span>
              </div>
            </div>
          </div>

          {/* Right: featured course card */}
          <div className="hero-card" style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <div className="float-card" style={{ background: 'var(--en-surface)', borderRadius: '20px', boxShadow: 'var(--en-shadow-lg)', padding: '28px', width: '100%', maxWidth: '340px', border: '1px solid var(--en-border)' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', borderRadius: '12px', height: '160px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
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
            <div style={{ position: 'absolute', top: '8px', right: '0px', background: 'var(--en-surface)', borderRadius: '14px', boxShadow: 'var(--en-shadow-sm)', padding: '10px 14px', border: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-text)' }}>+250 XP</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>al completar</div>
              </div>
            </div>

            {/* Floating: students */}
            <div style={{ position: 'absolute', bottom: '8px', left: '0px', background: 'var(--en-surface)', borderRadius: '14px', boxShadow: 'var(--en-shadow-sm)', padding: '10px 14px', border: '1px solid var(--en-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-text)' }}>500+</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-soft)' }}>alumnos activos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="reveal" style={{ padding: '0 clamp(16px, 5vw, 64px) 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', background: 'var(--en-surface)', borderRadius: '16px', border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-sm)', overflow: 'hidden', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Alumnos activos', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { value: '4.9', label: 'Rating promedio', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--en-coral)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
            { value: '100%', label: 'Online y a tu ritmo', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { value: 'IA', label: 'Integrada en cada curso', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg> },
          ].map(({ value, label, icon }, i) => (
            <div key={label} style={{ flex: '1', minWidth: '140px', padding: '24px 28px', borderRight: i < 3 ? '1px solid var(--en-border)' : 'none', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>{icon}</div>
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
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Para quién es esto</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '12px' }}>
              No necesitás saber diseño.<br /><span style={{ color: 'var(--en-green)' }}>Solo querés resultados.</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', maxWidth: '480px', margin: '0 auto' }}>
              Si tenés algo para ofrecer y tu marca no lo refleja, este es tu lugar.
            </p>
          </div>

          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {AUDIENCE.map(({ who, desc }) => (
              <div key={who} style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '18px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--en-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
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

            <div className="reveal-left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Qué vas a lograr</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', lineHeight: 1.1, marginBottom: '16px' }}>
                Al terminar, tenés<br />algo real para mostrar.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', lineHeight: 1.7 }}>
                Cada curso termina con algo que podés usar. Un logo terminado, una identidad lista, contenido que podés publicar hoy mismo.
              </p>
            </div>

            <div className="reveal-right reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {OUTCOMES.map(({ title, desc }, i) => (
                <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--en-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '13px', color: 'var(--en-green)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
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
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
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
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '780px' }}>
              {courses.slice(0, 4).map((course, i) => {
                const GRADIENTS = [
                  'linear-gradient(135deg, #0fba81 0%, #ff6b6b 100%)',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                ]
                const bg = GRADIENTS[i % GRADIENTS.length]
                return (
                  <Link key={course.slug} href={`/cursos/${course.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--en-shadow-sm)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
                      <div style={{ flexShrink: 0, width: '140px', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '14px 12px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        {i === 0 && (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: '100px', letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>DESTACADO</span>
                        )}
                      </div>
                      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                          {[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.3px', lineHeight: 1.25, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{course.title}</h3>
                        {course.subtitle && (
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, marginBottom: '12px' }}>{course.subtitle}</p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--en-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--en-green), var(--en-coral))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '6px', color: '#fff' }}>JG</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>Juan Gallino</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>
                              {course.price_ars > 0 ? `$${course.price_ars.toLocaleString('es-AR')}` : 'Gratis'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Ver →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '780px' }}>
              {[
                { slug: 'tu-marca-con-ia', title: 'Tu Marca con IA — de 0 a cliente', subtitle: 'Logo, identidad visual y primeros clientes. El proceso completo con IA.', price_ars: 29000 },
                { slug: 'canva-pro-para-tu-marca', title: 'Canva Pro para tu marca — de plantilla a identidad propia', subtitle: 'Dejá de usar plantillas genéricas. Aprendé a usar Canva Pro como un diseñador profesional.', price_ars: 19000 },
                { slug: 'ia-para-community-managers', title: 'IA para Community Managers que quieren trabajar distinto', subtitle: 'Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía.', price_ars: 25000 },
              ].map((c, i) => {
                const GRADIENTS = ['linear-gradient(135deg, #0fba81 0%, #ff6b6b 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)']
                const bg = GRADIENTS[i % GRADIENTS.length]
                return (
                  <Link key={c.slug} href={`/cursos/${c.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--en-shadow-sm)' }}>
                      <div style={{ flexShrink: 0, width: '140px', background: bg, display: 'flex', alignItems: 'flex-end', padding: '14px 12px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                          {[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.3px', lineHeight: 1.25, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{c.title}</h3>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, marginBottom: '12px' }}>{c.subtitle}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--en-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--en-green), var(--en-coral))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '6px', color: '#fff' }}>JG</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>Juan Gallino</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.5px' }}>${c.price_ars.toLocaleString('es-AR')}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-green)', background: 'var(--en-green-light)', padding: '4px 10px', borderRadius: '20px' }}>Ver →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── JUAN — profile card ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="reveal" style={{ background: 'var(--en-surface)', border: '1.5px solid var(--en-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--en-shadow-lg)' }}>

            {/* Banner */}
            <div style={{
              height: '200px', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
              <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
              <div style={{ position: 'absolute', top: '20px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
              {/* Title in banner */}
              <div style={{ position: 'absolute', top: '28px', left: '200px', right: '24px' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>DISEÑADOR DE MARCA CON IA</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.05, margin: 0 }}>Aprendé con Juan</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {['Diseño con IA', 'Identidad de marca', 'Herramientas reales'].map(tag => (
                    <span key={tag} style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile photo + content */}
            <div style={{ padding: '0 32px 32px', position: 'relative' }}>

              {/* Avatar overlapping banner */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)',
                  border: '4px solid var(--en-surface)',
                  marginTop: '-50px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--en-shadow)',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', color: '#fff', letterSpacing: '-1px' }}>JG</span>
                </div>

                {/* Bestseller badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '100px',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 4px 16px rgba(255,165,0,0.3)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', color: '#fff', letterSpacing: '0.5px' }}>TOP INSTRUCTOR</span>
                </div>
              </div>

              {/* Name + meta */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.8px', color: 'var(--en-text)', margin: '0 0 4px' }}>Juan Gallino</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', margin: '0 0 12px' }}>Diseñador de marca con IA · Rafaela, Santa Fe</p>

                {/* Stars + stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(s => <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="var(--en-coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', color: 'var(--en-text)' }}>4.9</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>(+200 reseñas)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>5 cursos</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--en-green)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>500+ alumnos</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--en-border)', margin: '20px 0' }}/>

              {/* Bio + social */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '32px', alignItems: 'start' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '12px' }}>
                    Diseñador de marcas con IA, basado en Rafaela, Santa Fe. Trabajo con emprendedores y profesionales que quieren construir una identidad visual que se destaque — usando inteligencia artificial para ir más rápido y más lejos.
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--en-text-soft)', lineHeight: 1.75 }}>
                    Lo que enseño acá es el proceso exacto que uso con mis propios clientes. Sin relleno, sin teoría vacía.
                  </p>

                  {/* Social links */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Instagram', href: 'https://instagram.com/juanogallino', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                      { label: 'YouTube', href: 'https://youtube.com/@juanogallino', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none"/></svg> },
                      { label: 'LinkedIn', href: 'https://linkedin.com/in/juangallino', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v7M7 7v.01M12 10v7M12 13a3 3 0 0 1 6 0v4"/></svg> },
                    ].map(({ label, href, icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '7px 14px', borderRadius: '9px',
                          border: '1.5px solid var(--en-border)', background: 'var(--en-bg)',
                          color: 'var(--en-text-soft)', textDecoration: 'none',
                          fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                          transition: 'border-color 0.15s ease, color 0.15s ease',
                        }}
                      >
                        {icon}
                        {label}
                      </a>
                    ))}
                  </div>
                </div>

                <Link href="/sobre-juano" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '10px',
                  background: 'var(--en-green)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  boxShadow: 'var(--en-shadow-green-sm)',
                }}>
                  Ver perfil →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS PREVIEW ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Planes</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '12px' }}>
              Empezá gratis, crecé a tu ritmo
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
              El primer curso es gratis. Cuando querés más, tenés planes accesibles en ARS o USD.
            </p>
          </div>

          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'FREE', price: '$0', desc: 'Para explorar', features: ['1 lección de muestra', 'Catálogo completo', 'Comunidad en lectura'], color: 'var(--en-text-soft)', highlight: false },
              { name: 'NORTE', price: 'U$D 12/mes', desc: 'Para aprender en serio', features: ['5 cursos incluidos', 'Cursos nuevos sin costo extra', 'Certificados'], color: 'var(--en-green)', highlight: true },
              { name: 'NORTE PRO', price: 'U$D 15/mes', desc: 'Para diferenciarte', features: ['Todo Norte', 'Peer review', 'Prioridad en mentoría'], color: 'var(--en-coral)', highlight: false },
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

      {/* ── FAQS ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--en-green-light)', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Preguntas frecuentes</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '12px' }}>
              Todo lo que querés saber<br /><span style={{ color: 'var(--en-green)' }}>antes de arrancar</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--en-text-soft)', maxWidth: '440px', margin: '0 auto' }}>
              Si tenés alguna otra duda, podés escribirnos directamente.
            </p>
          </div>

          <div className="reveal">
            <FaqAccordion items={FAQS} />
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)' }}>
              ¿Tenés otra pregunta?{' '}
              <a href="mailto:hola@estudionorte.ar" style={{ color: 'var(--en-green)', fontWeight: 600, textDecoration: 'none' }}>
                Escribinos →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) clamp(16px, 5vw, 64px)', background: 'var(--en-overlay-light)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="reveal" style={{ background: 'linear-gradient(135deg, var(--en-green) 0%, var(--en-coral) 100%)', borderRadius: '28px', padding: 'clamp(48px, 6vw, 72px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>

            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4.5vw, 52px)', letterSpacing: '-2px', color: '#fff', marginBottom: '16px', lineHeight: 1.05 }}>
                Ya son más de 500.<br />¿Cuándo arrancás vos?
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
