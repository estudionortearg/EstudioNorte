import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Juan Gallino — Estudio Norte',
  description: 'Community manager en Rafaela, Santa Fe. Creador de Estudio Norte y JuanoConecta.',
}

export default function SobreJuanoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
