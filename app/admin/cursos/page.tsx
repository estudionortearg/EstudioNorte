import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import TogglePublish from './TogglePublish'

export const dynamic = 'force-dynamic'

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
      background: published ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.04)',
      color: published ? 'var(--color-teal)' : 'rgba(247,247,242,0.25)',
      border: `1px solid ${published ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.07)'}`,
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
      {published ? 'Publicado' : 'Borrador'}
    </span>
  )
}

export default async function AdminCursosPage() {
  const supabase = createAdminClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, price_ars, price_usd, is_published, is_featured, created_at')
    .order('created_at', { ascending: false })

  const { data: enrollCounts } = await supabase.from('enrollments').select('course_id')
  const countMap = new Map<string, number>()
  ;(enrollCounts || []).forEach(e => {
    countMap.set(e.course_id, (countMap.get(e.course_id) || 0) + 1)
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
            Gestión
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
            Cursos
          </h1>
        </div>
        <Link href="/admin/cursos/nuevo" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
          background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)',
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-teal)', fontWeight: 600,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Nuevo curso
        </Link>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: courses?.length || 0 },
          { label: 'Publicados', value: courses?.filter(c => c.is_published).length || 0 },
          { label: 'Borradores', value: courses?.filter(c => !c.is_published).length || 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: 'var(--color-text)', letterSpacing: '-1px' }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Curso', 'Precio ARS', 'USD', 'Alumnos', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', fontFamily: 'var(--font-body)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(courses || []).map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < (courses?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.4 }}>{c.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', marginTop: '2px' }}>{c.slug}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--color-coral)', letterSpacing: '-0.5px' }}>
                    {c.price_ars ? `$${c.price_ars.toLocaleString('es-AR')}` : '—'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)' }}>
                    {c.price_usd ? `$${c.price_usd}` : '—'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-teal)', letterSpacing: '-0.5px' }}>
                    {countMap.get(c.id) || 0}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <PublishedBadge published={c.is_published} />
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link href={`/admin/cursos/${c.id}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', color: 'var(--color-teal)', textDecoration: 'none',
                      padding: '5px 12px', borderRadius: '8px',
                      background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.12)',
                      fontFamily: 'var(--font-body)', fontWeight: 600,
                    }}>
                      Editar
                    </Link>
                    <Link href={`/cursos/${c.slug}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', color: 'rgba(247,247,242,0.4)', textDecoration: 'none',
                      padding: '5px 12px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      Ver →
                    </Link>
                    <TogglePublish courseId={c.id} published={c.is_published} />
                  </div>
                </td>
              </tr>
            ))}
            {(!courses || courses.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                  Sin cursos. Creá el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
