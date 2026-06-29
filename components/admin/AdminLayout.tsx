import Link from 'next/link'
import { Logo } from '@/components/ui'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/cursos', label: 'Cursos' },
  { href: '/admin/alumnos', label: 'Alumnos' },
  { href: '/admin/ventas', label: 'Ventas' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        backgroundColor: 'var(--color-bg-card)',
        borderRight: '1px solid var(--color-border)',
        padding: '32px 0',
        display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '32px' }}>
          <Logo size="sm" />
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginTop: '8px' }}>
            Admin
          </p>
        </div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'block', padding: '10px 20px',
              color: 'var(--color-text-muted)',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              transition: 'color 150ms ease',
            }}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
