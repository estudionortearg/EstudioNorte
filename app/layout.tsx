import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://estudio-norte-web-two.vercel.app'),
  title: {
    default: 'Estudio Norte — Cursos de Diseño con IA para Emprendedores',
    template: '%s — Estudio Norte',
  },
  description:
    'Aprendé a crear logos, identidades visuales, contenido y automatizaciones con IA. Cursos prácticos de Juan Gallino para emprendedores de Argentina y LATAM.',
  keywords: [
    'cursos diseño IA', 'diseño de marca con inteligencia artificial',
    'aprender Canva', 'Meta Ads', 'Manychat', 'automatizaciones',
    'emprendedores Argentina', 'identidad visual', 'logo con IA',
    'Juan Gallino', 'Estudio Norte',
  ],
  authors: [{ name: 'Juan Gallino', url: 'https://estudio-norte-web-two.vercel.app/sobre-juano' }],
  creator: 'Juan Gallino',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://estudio-norte-web-two.vercel.app',
    siteName: 'Estudio Norte',
    title: 'Estudio Norte — Cursos de Diseño con IA para Emprendedores',
    description:
      'De 0 a marca profesional con IA en un fin de semana. Cursos prácticos de Juan Gallino para emprendedores de Argentina y LATAM.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Estudio Norte — Cursos de Diseño con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estudio Norte — Cursos de Diseño con IA',
    description: 'De 0 a marca profesional con IA en un fin de semana.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakartaSans.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
