import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import CourseSalesPage from './CourseSalesPage'

export interface CourseData {
  slug: string
  title: string
  subtitle: string
  priceArs: number
  priceUsd: number
  badge: string
  whatYouLearn: string[]
  forWho: string[]
}

const courses: Record<string, CourseData> = {
  'ia-para-community-managers': {
    slug: 'ia-para-community-managers',
    title: 'IA para Community Managers que quieren trabajar distinto',
    subtitle: 'Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía — solo lo que uso con mis clientes reales.',
    priceArs: 25000,
    priceUsd: 25,
    badge: 'Acceso de por vida · Actualizaciones incluidas',
    whatYouLearn: [
      'Cómo generar un mes de contenido en una tarde usando IA',
      'Prompts específicos para cada red social',
      'Cómo mantener tu voz mientras usás inteligencia artificial',
      'Automatizaciones simples que liberan horas de trabajo',
      'Cómo presentarle IA a tus clientes sin que se asusten',
    ],
    forWho: [
      'CMs freelance que quieren hacer más en menos tiempo',
      'Dueños de negocio que gestionan sus propias redes',
      'Agencias que quieren escalar sin contratar',
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = courses[slug]
  if (!course) return {}
  return { title: `${course.title} — Estudio Norte`, description: course.subtitle }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = courses[slug]
  if (!course) notFound()
  return <CourseSalesPage course={course} />
}
