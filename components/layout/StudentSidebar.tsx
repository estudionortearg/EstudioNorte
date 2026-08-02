'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  activeRoute: string
  displayName: string
}

const NAV_MAIN = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  },
  {
    href: '/mis-cursos',
    label: 'Mis Cursos',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
    href: '/perfil',
    label: 'Mi Perfil',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: '/certificados',
    label: 'Certificados',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  },
  {
    href: '/comunidad',
    label: 'Comunidad',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
]

function NavItem({ href, label, icon, isActive }: { href: string; label: string; icon: ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 16px', borderRadius: '10px',
        textDecoration: 'none',
        background: isActive ? 'var(--en-green)' : 'transparent',
        color: isActive ? '#fff' : 'var(--en-text-soft)',
        fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: isActive ? 600 : 400,
        transition: 'background 0.15s, color 0.15s',
        marginBottom: '2px',
      }}
    >
      {icon}
      {label}
    </Link>
  )
}

export default function StudentSidebar({ activeRoute, displayName }: Props) {
  const isActive = (href: string) => {
    if (href === '/dashboard') return activeRoute === '/dashboard'
    return activeRoute.startsWith(href)
  }

  return (
    <aside
      style={{ width: '220px', flexShrink: 0 }}
      className="hidden md:block"
    >
      <div style={{
        border: '1px solid var(--en-border)',
        borderRadius: '16px',
        background: 'var(--en-surface)',
        overflow: 'hidden',
        position: 'sticky',
        top: '76px',
      }}>
        {/* User pill at top */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--en-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--en-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '12px', color: '#fff',
            }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px',
                color: 'var(--en-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)' }}>
                Alumno
              </p>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div style={{ padding: '10px 8px 8px' }}>
          {NAV_MAIN.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} isActive={isActive(href)} />
          ))}
        </div>

        {/* Bottom section */}
        <div style={{ padding: '6px 8px 10px', borderTop: '1px solid var(--en-border)' }}>
          <NavItem
            href="/perfil"
            label="Configuración"
            isActive={false}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
          />
          <form action="/api/auth/signout" method="POST" style={{ marginTop: '2px' }}>
            <button
              type="submit"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: 'var(--en-coral)', fontFamily: 'var(--font-body)', fontSize: '14px',
                fontWeight: 400, textAlign: 'left', transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
