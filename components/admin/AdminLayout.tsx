'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    href: '/admin/cursos',
    label: 'Cursos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/alumnos',
    label: 'Alumnos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/ventas',
    label: 'Ventas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L5 8L8 10L11 5L14 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/gamificacion',
    label: 'Gamificación',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5 6.5 5 8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/cupones',
    label: 'Cupones',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="5" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M10 5V4a2 2 0 0 0-4 0v1M10 11v1a2 2 0 0 1-4 0v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [newEnrollments, setNewEnrollments] = useState(0)

  useEffect(() => {
    const lastVisit = localStorage.getItem('admin_last_visit') || '1970-01-01'
    fetch('/api/admin/new-enrollments?since=' + encodeURIComponent(lastVisit))
      .then(r => r.json())
      .then(d => setNewEnrollments(d.count || 0))
    if (pathname === '/admin/alumnos') {
      localStorage.setItem('admin_last_visit', new Date().toISOString())
      setNewEnrollments(0)
    }
  }, [pathname])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'rgba(12,12,24,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '28px 24px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <Logo size="sm" />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '10px', padding: '3px 10px', borderRadius: '100px',
            background: 'rgba(78,205,196,0.08)',
            border: '1px solid rgba(78,205,196,0.15)',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-teal)' }}/>
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', fontFamily: 'var(--font-body)' }}>
              Panel Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.2)', padding: '8px 12px 4px', fontFamily: 'var(--font-body)' }}>
            Gestión
          </p>
          {navItems.map(item => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px',
                  color: isActive ? 'var(--color-teal)' : 'rgba(247,247,242,0.4)',
                  textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'rgba(78,205,196,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(78,205,196,0.12)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
                {item.label}
                {item.href === '/admin/alumnos' && newEnrollments > 0 && (
                  <span style={{
                    marginLeft: 'auto', minWidth: '18px', height: '18px', borderRadius: '100px',
                    background: 'var(--color-coral)', color: '#fff',
                    fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                  }}>{newEnrollments}</span>
                )}
                {isActive && newEnrollments === 0 && (
                  <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-teal)' }}/>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: ver sitio */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          <Link href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            color: 'rgba(247,247,242,0.3)', textDecoration: 'none',
            fontSize: '13px', fontFamily: 'var(--font-body)',
            transition: 'color 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 8h14M8 1c-2 2-3 4-3 7s1 5 3 7M8 1c2 2 3 4 3 7s-1 5-3 7" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            Ver sitio →
          </Link>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            color: 'rgba(247,247,242,0.3)', textDecoration: 'none',
            fontSize: '13px', fontFamily: 'var(--font-body)',
            transition: 'color 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Mi dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
