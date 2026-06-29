import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminCursosPage() {
  const supabase = createAdminClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, price_ars, price_usd, is_published, is_featured, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--color-text)', marginBottom: '32px' }}>
        Cursos
      </h1>

      <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-mid)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Título', 'Precio ARS', 'USD', 'Publicado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(courses || []).map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text)', maxWidth: '300px' }}>{c.title}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-coral)' }}>${c.price_ars?.toLocaleString('es-AR')}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{c.price_usd ? `$${c.price_usd}` : '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: c.is_published ? 'var(--color-teal)' : 'var(--color-text-faint)' }}>
                  {c.is_published ? '✓ Sí' : '✗ No'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/cursos/${c.slug}`} style={{ fontSize: '13px', color: 'var(--color-teal)', textDecoration: 'none' }}>
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
