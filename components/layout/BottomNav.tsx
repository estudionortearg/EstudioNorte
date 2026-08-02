// components/layout/BottomNav.tsx
'use client'

import Link from 'next/link'

interface BottomNavProps {
  activeRoute: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { href: '/cursos', label: 'Cursos', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { href: '/comunidad', label: 'Comunidad', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )},
  { href: '/perfil', label: 'Perfil', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function BottomNav({ activeRoute }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
      background: 'var(--en-white-90)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--en-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    }} className="md:hidden">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = activeRoute.startsWith(href)
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            textDecoration: 'none', padding: '8px 16px',
            color: isActive ? 'var(--en-green)' : 'var(--en-text-soft)',
            transition: 'color 0.15s ease',
          }}>
            {icon}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
