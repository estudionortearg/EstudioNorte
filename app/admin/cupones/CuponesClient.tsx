'use client'

import { useState } from 'react'

type Coupon = {
  id: string
  code: string
  type: 'percent' | 'fixed_ars' | 'fixed_usd'
  value: number
  course_slugs: string[] | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  referrer_user_id: string | null
  referrer_xp: number
  created_at: string
  coupon_uses?: { count: number }[]
}

type Course = { slug: string; title: string }

const TYPE_LABELS: Record<string, string> = {
  percent: 'Porcentaje (%)',
  fixed_ars: 'Monto fijo (ARS)',
  fixed_usd: 'Monto fijo (USD)',
}

const typeDisplay = (c: Coupon) => {
  if (c.type === 'percent') return `${c.value}%`
  if (c.type === 'fixed_ars') return `$${c.value.toLocaleString('es-AR')} ARS`
  return `$${c.value} USD`
}

export default function CuponesClient({ coupons: initial, courses }: { coupons: Coupon[]; courses: Course[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    course_slugs: [] as string[],
    max_uses: '',
    expires_at: '',
    referrer_xp: '50',
  })
  const [formError, setFormError] = useState('')

  const handleToggle = async (id: string, is_active: boolean) => {
    const res = await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    })
    if (res.ok) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active } : c))
    }
  }

  const handleCreate = async () => {
    setFormError('')
    if (!form.code.trim() || !form.value) {
      setFormError('Código y valor son requeridos')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.value,
        course_slugs: form.course_slugs,
        max_uses: form.max_uses || null,
        expires_at: form.expires_at || null,
        referrer_xp: form.referrer_xp || 0,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || 'Error al crear el cupón')
    } else {
      setCoupons(prev => [data.coupon, ...prev])
      setShowForm(false)
      setForm({ code: '', type: 'percent', value: '', course_slugs: [], max_uses: '', expires_at: '', referrer_xp: '50' })
    }
    setSaving(false)
  }

  const toggleCourseSlug = (slug: string) => {
    setForm(prev => ({
      ...prev,
      course_slugs: prev.course_slugs.includes(slug)
        ? prev.course_slugs.filter(s => s !== slug)
        : [...prev.course_slugs, slug],
    }))
  }

  const s: React.CSSProperties & { [k: string]: string | number } = {}
  void s

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-text)', letterSpacing: '-1px', margin: 0 }}>Cupones</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', margin: '4px 0 0' }}>Descuentos y códigos de referidos</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--en-green)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo cupón'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '16px', color: 'var(--en-text)', margin: '0 0 20px' }}>Crear cupón</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>CÓDIGO</span>
              <input
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="EJ: LANZAMIENTO30"
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>TIPO</span>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>VALOR {form.type === 'percent' ? '(%)' : form.type === 'fixed_ars' ? '(ARS)' : '(USD)'}</span>
              <input
                type="number"
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                placeholder={form.type === 'percent' ? '30' : '5000'}
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>USO MÁXIMO (vacío = ilimitado)</span>
              <input
                type="number"
                value={form.max_uses}
                onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                placeholder="100"
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>FECHA DE VENCIMIENTO (vacío = sin venc.)</span>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)' }}>XP PARA REFERIDOR (si aplica)</span>
              <input
                type="number"
                value={form.referrer_xp}
                onChange={e => setForm(p => ({ ...p, referrer_xp: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: '9px', border: '1.5px solid var(--en-border)', background: 'var(--en-bg)', color: 'var(--en-text)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
              />
            </label>
          </div>

          {/* Course slugs */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--en-text-soft)', display: 'block', marginBottom: '8px' }}>CURSOS (vacío = todos)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {courses.map(c => (
                <button
                  key={c.slug}
                  onClick={() => toggleCourseSlug(c.slug)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--en-border)',
                    background: form.course_slugs.includes(c.slug) ? 'var(--en-green)' : 'var(--en-bg)',
                    color: form.course_slugs.includes(c.slug) ? '#fff' : 'var(--en-text-soft)',
                    fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {formError && <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-coral)', margin: '12px 0 0' }}>{formError}</p>}

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCreate}
              disabled={saving}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--en-green)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando...' : 'Crear cupón'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', overflow: 'hidden' }}>
        {coupons.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-faint)' }}>
            No hay cupones todavía. Creá el primero.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--en-border)' }}>
                {['Código', 'Descuento', 'Usos', 'Límite', 'Vence', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--en-text-faint)', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < coupons.length - 1 ? '1px solid var(--en-border)' : 'none', opacity: c.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: 'var(--en-text)', letterSpacing: '0.5px' }}>{c.code}</span>
                      {c.referrer_user_id && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: 'var(--en-coral)', background: 'color-mix(in srgb, var(--en-coral) 10%, var(--en-surface))', padding: '2px 6px', borderRadius: '4px' }}>REFERIDO</span>
                      )}
                    </div>
                    {c.course_slugs && c.course_slugs.length > 0 && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--en-text-faint)', marginTop: '2px' }}>{c.course_slugs.join(', ')}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', color: 'var(--en-green)' }}>{typeDisplay(c)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text)' }}>{c.uses_count}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)' }}>{c.max_uses ?? '∞'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                      background: c.is_active ? 'color-mix(in srgb, var(--en-green) 12%, var(--en-surface))' : 'var(--en-border)',
                      color: c.is_active ? 'var(--en-green)' : 'var(--en-text-faint)',
                    }}>
                      {c.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggle(c.id, !c.is_active)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--en-border)', background: 'none', color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {c.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
