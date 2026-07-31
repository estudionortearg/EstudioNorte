// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'

interface SidebarProps {
  activeRoute: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { href: '/cursos', label: 'Cursos', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { href: '/perfil', label: 'Perfil', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '64px', zIndex: 20,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--en-border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '16px', paddingBottom: '16px', gap: '4px',
        // Oculto en mobile
      }} className="hidden md:flex">
        {/* Logo */}
        <Link href="/dashboard" style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--en-green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '14px' }}>EN</span>
        </Link>

        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = activeRoute.startsWith(href)
          return (
            <div key={href} style={{ position: 'relative' }} className="group">
              <Link href={href} style={{
                width: '44px', height: '44px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                background: isActive ? 'var(--en-green-light)' : 'transparent',
                color: isActive ? 'var(--en-green)' : 'var(--en-text-soft)',
                transition: 'all 0.15s ease',
              }}>
                {icon}
              </Link>
              {/* Tooltip */}
              <div style={{
                position: 'absolute', left: '56px', top: '50%', transform: 'translateY(-50%)',
                background: 'var(--en-text)', color: '#fff',
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                fontFamily: 'var(--font-body)', fontWeight: 500,
                whiteSpace: 'nowrap', pointerEvents: 'none',
                opacity: 0, transition: 'opacity 0.15s ease',
              }} className="group-hover:opacity-100">
                {label}
              </div>
            </div>
          )
        })}
      </aside>
    </>
  )
}
