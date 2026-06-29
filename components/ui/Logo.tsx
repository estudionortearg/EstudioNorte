import Image from 'next/image'

type LogoSize = 'sm' | 'md' | 'lg'

const sizes: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 36 },
  md: { width: 160, height: 48 },
  lg: { width: 200, height: 60 },
}

interface LogoProps {
  className?: string
  size?: LogoSize
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const { width, height } = sizes[size]
  return (
    <Image
      src="/logo.svg"
      alt="Estudio Norte"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
