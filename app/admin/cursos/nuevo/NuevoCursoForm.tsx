'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoCursoForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    price_ars: '',
    price_usd: '',
    is_featured: false,
  })

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (!form.price_ars || isNaN(Number(form.price_ars))) { setError('Precio ARS inválido'); return }

    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        price_ars: Number(form.price_ars),
        price_usd: form.price_usd ? Number(form.price_usd) : null,
        is_featured: form.is_featured,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'slug_conflict' ? 'Ya existe un curso con ese nombre. Probá un título diferente.' : (data.error || 'Error al crear'))
      setSaving(false)
      return
    }
    router.push(`/admin/cursos/${data.id}`)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px',
    fontFamily: 'var(--font-body)', fontSize: '12px',
    color: 'rgba(247,247,242,0.4)', fontWeight: 600, letterSpacing: '0.5px',
  }

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '8px' }}>
          Gestión
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-1.5px', color: 'var(--color-text)' }}>
          Nuevo curso
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Análisis Técnico desde Cero" />
        </div>
        <div>
          <label style={labelStyle}>Subtítulo</label>
          <input style={inputStyle} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Una línea descriptiva" />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción larga del curso" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Precio ARS *</label>
            <input style={inputStyle} type="number" value={form.price_ars} onChange={e => set('price_ars', e.target.value)} placeholder="29999" />
          </div>
          <div>
            <label style={labelStyle}>Precio USD</label>
            <input style={inputStyle} type="number" value={form.price_usd} onChange={e => set('price_usd', e.target.value)} placeholder="29" />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
          <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-teal)' }} />
          Destacado en la home
        </label>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-coral)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => router.push('/admin/cursos')}
            style={{ padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(247,247,242,0.4)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '12px 24px', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', color: 'var(--color-teal)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Creando...' : 'Crear curso'}
          </button>
        </div>
      </form>
    </div>
  )
}
