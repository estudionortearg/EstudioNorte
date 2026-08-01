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
  'tu-marca-con-ia': {
    slug: 'tu-marca-con-ia',
    title: 'Tu Marca con IA — de idea a identidad visual completa',
    subtitle: 'Creá tu logo, definí tu paleta de colores, tipografía y sistema de marca usando IA. Sin experiencia previa en diseño.',
    priceArs: 29000,
    priceUsd: 29,
    badge: 'Acceso de por vida · Actualizaciones incluidas',
    whatYouLearn: [
      'Crear un logo profesional con IA en menos de 2 horas',
      'Definir paleta de colores y tipografías que comuniquen tu marca',
      'Armar un mini sistema de marca listo para usar en cualquier soporte',
      'Generar piezas para redes con coherencia visual usando Canva + IA',
      'Presentar tu marca a clientes de manera profesional',
    ],
    forWho: [
      'Emprendedores que quieren una marca propia sin pagar una agencia',
      'Freelancers que necesitan una identidad visual para conseguir clientes',
      'Profesionales que quieren renovar su marca personal con IA',
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
