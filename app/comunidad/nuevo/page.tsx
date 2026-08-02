'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'general',   label: 'General',           emoji: '💬' },
  { key: 'branding',  label: 'Branding',           emoji: '🎨' },
  { key: 'ia',        label: 'IA & Herramientas',  emoji: '🤖' },
  { key: 'trabajos',  label: 'Mis trabajos',       emoji: '✨' },
  { key: 'dudas',     label: 'Dudas',              emoji: '🙋' },
]

function NuevoPostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get('category') || 'general'

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) { setError('Completá el título y el contenido.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al publicar'); return }
    if (data.flagged) { setError(data.message || 'Tu publicación está en revisión.'); return }
    router.push(`/comunidad/post/${data.post.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: '10px', height: '60px' }}>
          <Link href="/comunidad" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            Comunidad
          </Link>
          <span style={{ color: 'var(--en-border)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)' }}>Nuevo hilo</span>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '24px' }}>
          Crear hilo
        </h1>

        {/* Category */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--en-text-soft)', marginBottom: '10px' }}>
            Categoría
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)} style={{
                padding: '8px 14px', borderRadius: '9px', cursor: 'pointer',
                background: category === c.key ? 'var(--en-green)' : 'var(--en-surface)',
                color: category === c.key ? '#fff' : 'var(--en-text-soft)',
                border: category === c.key ? 'none' : '1px solid var(--en-border)',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: category === c.key ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
            Título
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="¿Sobre qué querés hablar?"
            maxLength={120}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: '10px', boxSizing: 'border-box',
              background: 'var(--en-white)', border: '2px solid var(--en-border)',
              color: 'var(--en-text)', fontSize: '15px', fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
            Contenido
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Escribí tu pregunta, idea o trabajo..."
            rows={8}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: '10px', boxSizing: 'border-box',
              background: 'var(--en-white)', border: '2px solid var(--en-border)',
              color: 'var(--en-text)', fontSize: '15px', fontFamily: 'var(--font-body)',
              outline: 'none', resize: 'vertical', lineHeight: 1.6,
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'color-mix(in srgb, var(--en-coral) 8%, var(--en-surface))', border: '1px solid color-mix(in srgb, var(--en-coral) 20%, transparent)', color: 'var(--en-coral)', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px 24px', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'var(--en-green)', border: 'none', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Publicando...' : 'Publicar hilo'}
          </button>
          <Link href="/comunidad" style={{
            padding: '12px 20px', borderRadius: '10px', textDecoration: 'none',
            background: 'var(--en-surface)', border: '1px solid var(--en-border)',
            color: 'var(--en-text-soft)', fontFamily: 'var(--font-body)', fontSize: '14px',
          }}>
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function NuevoPage() {
  return (
    <Suspense>
      <NuevoPostForm />
    </Suspense>
  )
}
