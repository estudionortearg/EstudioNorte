import { Metadata } from 'next'
import CourseCard from '@/components/courses/CourseCard'

export const metadata: Metadata = {
  title: 'Cursos — Estudio Norte',
  description: 'Cursos de IA y marketing digital para profesionales que quieren resultados.',
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
  }
]

export default function CursosPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '48px',
          letterSpacing: '-1px',
          color: 'var(--color-text)',
          marginBottom: '16px'
        }}>
          Lo que podés aprender
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '56px' }}>
          Cursos diseñados para profesionales que quieren resultados, no teoría.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {courses.map(course => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      </div>
    </div>
  )
}
