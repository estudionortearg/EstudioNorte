'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/ui'
import { Button } from '@/components/ui'

const navLinks = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/sobre-juano', label: 'Sobre Juano' },
]

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '13px',
        color: hovered ? '#F7F7F2' : 'rgba(247,247,242,0.7)',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  )
}

export default function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#0A0A14',
        borderBottom: '1px solid rgba(78,205,196,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <nav
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo size="md" />

        {/* Desktop nav */}
        <div
          className="hidden md:flex"
          style={{ gap: '32px', alignItems: 'center' }}
        >
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <Button href="/login" variant="ghost" size="sm">
            Ya soy alumno
          </Button>
        </div>

        {/* Mobile: only show button */}
        <div className="flex md:hidden">
          <Button href="/login" variant="ghost" size="sm">
            Ya soy alumno
          </Button>
        </div>
      </nav>
    </header>
  )
}
