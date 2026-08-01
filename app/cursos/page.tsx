import { Metadata } from 'next'
import CourseCard from '@/components/courses/CourseCard'

export const metadata: Metadata = {
  title: 'Cursos — Estudio Norte',
  description: 'Cursos de diseño de marca con IA. Material práctico de Juan Gallino para crear identidades visuales y conseguir clientes.',
}

const courses = [
  {
    slug: 'ia-para-community-managers',
    title: 'IA para Community Managers que quieren trabajar distinto',
    subtitle: 'Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía.',
    priceArs: 25000,
    priceUsd: 25,
    badges: ['IA Práctica', 'Nuevo'],
    isFeatured: true,
  },
  {
    slug: 'tu-marca-con-ia',
    title: 'Tu Marca con IA — de idea a identidad visual completa',
    subtitle: 'Creá tu logo, paleta, tipografía y sistema de marca con inteligencia artificial. Sin experiencia en diseño.',
    priceArs: 29000,
    priceUsd: 29,
    badges: ['Diseño', 'IA'],
    isFeatured: false,
  },
]

export default function CursosPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </a>
          <a href="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', textDecoration: 'none', padding: '7px 16px', borderRadius: '8px', border: '1.5px solid var(--en-green)' }}>
            Ingresar
          </a>
        </div>
      </header>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--en-green-light)', marginBottom: '16px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--en-green)', display: 'inline-block' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>Catálogo de cursos</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-2px',
            color: 'var(--en-text)', marginBottom: '12px',
          }}>
            Lo que podés aprender
          </h1>
          <p style={{ color: 'var(--en-text-soft)', fontSize: '18px', maxWidth: '480px' }}>
            Diseño de marca con IA para emprendedores que quieren destacarse. Material de Juan Gallino, basado en trabajo real con clientes.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {courses.map(course => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      </div>
    </div>
  )
}
