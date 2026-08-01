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
  'canva-pro-para-tu-marca': {
    slug: 'canva-pro-para-tu-marca',
    title: 'Canva Pro para tu marca — de plantilla a identidad propia',
    subtitle: 'Dejá de usar plantillas genéricas. Aprendé a usar Canva Pro como un diseñador para construir una marca coherente y profesional.',
    priceArs: 19000,
    priceUsd: 19,
    badge: 'Acceso de por vida · Actualizaciones incluidas',
    whatYouLearn: [
      'Configurar tu Brand Kit con colores, tipografías y logos',
      'Crear plantillas propias para redes, presentaciones y materiales',
      'Usar la IA de Canva para generar imágenes y textos de marca',
      'Armar un sistema de piezas coherentes para todo el año',
      'Exportar archivos listos para imprimir y para digital',
    ],
    forWho: [
      'Emprendedores que quieren dejar de "improvisar" su diseño',
      'Profesionales que usan Canva pero no saben todo lo que pueden hacer',
      'Community managers que necesitan producir más en menos tiempo',
    ],
  },
  'primeros-clientes-diseno': {
    slug: 'primeros-clientes-diseno',
    title: 'Conseguí tus primeros clientes de diseño',
    subtitle: 'El sistema que uso para conseguir y retener clientes de diseño de marca. Sin publicidad paga, sin seguidores masivos.',
    priceArs: 22000,
    priceUsd: 22,
    badge: 'Acceso de por vida · Actualizaciones incluidas',
    whatYouLearn: [
      'Definir tu nicho y propuesta de valor como diseñador',
      'Armar un portfolio que convierte visitantes en clientes',
      'Conseguir los primeros clientes con estrategia de contenido',
      'Hacer propuestas comerciales que se aceptan',
      'Cobrar lo que merecés y no bajar el precio',
    ],
    forWho: [
      'Diseñadores que recién empiezan y no saben cómo conseguir clientes',
      'Freelancers que trabajan por referidos pero quieren crecer',
      'Profesionales que quieren pasar de empleados a independientes',
    ],
  },
  'contenido-visual-ia-instagram': {
    slug: 'contenido-visual-ia-instagram',
    title: 'Contenido visual con IA para Instagram',
    subtitle: 'Creá imágenes, carruseles y stories profesionales con IA sin saber diseño. Para marcas y emprendedores que quieren un feed coherente.',
    priceArs: 18000,
    priceUsd: 18,
    badge: 'Acceso de por vida · Actualizaciones incluidas',
    whatYouLearn: [
      'Generar imágenes para posteos con IA que encajan con tu marca',
      'Diseñar carruseles que educan y convierten seguidores en clientes',
      'Crear stories y Reels covers con identidad visual coherente',
      'Armar un calendario de contenido visual para un mes entero',
      'Mantener consistencia visual sin esfuerzo semana a semana',
    ],
    forWho: [
      'Emprendedores que quieren un feed profesional sin contratar un diseñador',
      'Community managers que buscan acelerar la producción de contenido visual',
      'Marcas pequeñas que necesitan comunicar mejor en Instagram',
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
