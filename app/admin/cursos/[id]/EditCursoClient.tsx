'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  description: string | null
  is_free_preview: boolean
  duration_minutes: number | null
  order_index: number
  pdf_url: string | null
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  price_ars: number
  price_usd: number | null
  is_published: boolean
  is_featured: boolean
}

interface Props {
  course: Course
  initialModules: Module[]
}

export default function EditCursoClient({ course, initialModules }: Props) {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [savingMsg, setSavingMsg] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState({
    title: course.title,
    subtitle: course.subtitle || '',
    description: course.description || '',
    price_ars: String(course.price_ars),
    price_usd: course.price_usd ? String(course.price_usd) : '',
    is_featured: course.is_featured,
    is_published: course.is_published,
  })
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null)

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontFamily: 'var(--font-body)',
    fontSize: '11px', color: 'rgba(247,247,242,0.35)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
  }
  const sectionStyle: React.CSSProperties = {
    borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.015)', padding: '28px', marginBottom: '24px',
  }

  async function saveCourse() {
    setSaving(true)
    setSavingMsg(null)
    const res = await fetch(`/api/admin/cursos/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: courseForm.title.trim(),
        subtitle: courseForm.subtitle.trim() || null,
        description: courseForm.description.trim() || null,
        price_ars: Number(courseForm.price_ars),
        price_usd: courseForm.price_usd ? Number(courseForm.price_usd) : null,
        is_featured: courseForm.is_featured,
        is_published: courseForm.is_published,
      }),
    })
    setSaving(false)
    setSavingMsg(res.ok ? '✓ Guardado' : '✗ Error al guardar')
    setTimeout(() => setSavingMsg(null), 2000)
  }

  async function addModule() {
    const title = prompt('Título del módulo:')
    if (!title?.trim()) return
    const res = await fetch(`/api/admin/cursos/${course.id}/modulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (!res.ok) return
    const newMod: Module = { ...(await res.json()), lessons: [] }
    setModules(m => [...m, newMod])
    setExpandedModules(s => new Set([...s, newMod.id]))
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return
    const res = await fetch(`/api/admin/modulos/${moduleId}`, { method: 'DELETE' })
    if (!res.ok) return
    setModules(m => m.filter(mod => mod.id !== moduleId))
  }

  async function moveModule(moduleId: string, direction: 'up' | 'down') {
    const idx = modules.findIndex(m => m.id === moduleId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === modules.length - 1) return
    const newModules = [...modules]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newModules[idx], newModules[swapIdx]] = [newModules[swapIdx], newModules[idx]]
    const updated = newModules.map((m, i) => ({ ...m, order_index: i }))
    setModules(updated)
    await Promise.all([
      fetch(`/api/admin/modulos/${updated[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: idx }) }),
      fetch(`/api/admin/modulos/${updated[swapIdx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: swapIdx }) }),
    ])
  }

  async function addLesson(moduleId: string) {
    const title = prompt('Título de la lección:')
    if (!title?.trim()) return
    const res = await fetch(`/api/admin/modulos/${moduleId}/lecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (!res.ok) return
    const newLesson: Lesson = await res.json()
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: [...mod.lessons, newLesson] } : mod))
    setExpandedLessons(s => new Set([...s, newLesson.id]))
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    const res = await fetch(`/api/admin/lecciones/${lessonId}`, { method: 'DELETE' })
    if (!res.ok) return
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) } : mod))
  }

  async function saveLesson(moduleId: string, lesson: Lesson) {
    const res = await fetch(`/api/admin/lecciones/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: lesson.title,
        description: lesson.description || null,
        is_free_preview: lesson.is_free_preview,
        duration_minutes: lesson.duration_minutes || null,
      }),
    })
    if (res.ok) {
      setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.map(l => l.id === lesson.id ? lesson : l) } : mod))
    }
  }

  async function moveLesson(moduleId: string, lessonId: string, direction: 'up' | 'down') {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    const idx = mod.lessons.findIndex(l => l.id === lessonId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === mod.lessons.length - 1) return
    const newLessons = [...mod.lessons]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newLessons[idx], newLessons[swapIdx]] = [newLessons[swapIdx], newLessons[idx]]
    const updated = newLessons.map((l, i) => ({ ...l, order_index: i }))
    setModules(m => m.map(mod2 => mod2.id === moduleId ? { ...mod2, lessons: updated } : mod2))
    await Promise.all([
      fetch(`/api/admin/lecciones/${updated[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: idx }) }),
      fetch(`/api/admin/lecciones/${updated[swapIdx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_index: swapIdx }) }),
    ])
  }

  async function uploadPdf(moduleId: string, lessonId: string, file: File) {
    if (file.type !== 'application/pdf') { alert('Solo se aceptan archivos PDF'); return }
    if (file.size > 50 * 1024 * 1024) { alert('El archivo no puede superar 50MB'); return }

    setUploadingLesson(lessonId)
    try {
      // 1. Get signed URL
      const signRes = await fetch('/api/admin/upload/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, lessonId }),
      })
      if (!signRes.ok) { alert('Error al obtener URL de subida'); return }
      const { signedUrl, publicUrl } = await signRes.json()

      // 2. Upload directly to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      })
      if (!uploadRes.ok) { alert('Error al subir el archivo'); return }

      // 3. Save pdf_url to lesson
      const patchRes = await fetch(`/api/admin/lecciones/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_url: publicUrl }),
      })
      if (!patchRes.ok) { alert('Error al guardar la URL del PDF'); return }

      setModules(m => m.map(mod => mod.id === moduleId ? {
        ...mod,
        lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, pdf_url: publicUrl } : l)
      } : mod))
    } finally {
      setUploadingLesson(null)
    }
  }

  function updateLessonField(moduleId: string, lessonId: string, field: keyof Lesson, value: unknown) {
    setModules(m => m.map(mod => mod.id === moduleId ? {
      ...mod,
      lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
    } : mod))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => router.push('/admin/cursos')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.3)', marginBottom: '8px', padding: 0 }}>
            ← Volver a cursos
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-1.5px', color: 'var(--color-text)', margin: 0 }}>
            {courseForm.title || 'Sin título'}
          </h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.2)', marginTop: '4px' }}>/{course.slug}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {savingMsg && <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: savingMsg.startsWith('✓') ? 'var(--color-teal)' : 'var(--color-coral)' }}>{savingMsg}</span>}
          <button
            onClick={saveCourse}
            disabled={saving}
            style={{ padding: '10px 20px', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)', color: 'var(--color-teal)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Course metadata section */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '24px' }}>
          Datos del curso
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input style={inputStyle} value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Subtítulo</label>
            <input style={inputStyle} value={courseForm.subtitle} onChange={e => setCourseForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Precio ARS</label>
              <input style={inputStyle} type="number" value={courseForm.price_ars} onChange={e => setCourseForm(f => ({ ...f, price_ars: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Precio USD</label>
              <input style={inputStyle} type="number" value={courseForm.price_usd} onChange={e => setCourseForm(f => ({ ...f, price_usd: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
              <input type="checkbox" checked={courseForm.is_featured} onChange={e => setCourseForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ accentColor: 'var(--color-teal)' }} />
              Destacado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text)' }}>
              <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm(f => ({ ...f, is_published: e.target.checked }))} style={{ accentColor: 'var(--color-teal)' }} />
              Publicado
            </label>
          </div>
        </div>
      </div>

      {/* Modules section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-teal)', margin: 0 }}>
            Módulos ({modules.length})
          </h2>
          <button
            onClick={addModule}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)', color: 'var(--color-teal)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Agregar módulo
          </button>
        </div>

        {modules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(247,247,242,0.2)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            Sin módulos. Agregá el primero.
          </div>
        )}

        {modules.map((mod, modIdx) => {
          const isExpanded = expandedModules.has(mod.id)
          return (
            <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Module header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                onClick={() => setExpandedModules(s => { const n = new Set(s); isExpanded ? n.delete(mod.id) : n.add(mod.id); return n })}>
                <span style={{ color: 'rgba(247,247,242,0.3)', fontSize: '12px', userSelect: 'none' }}>{isExpanded ? '▼' : '▶'}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                  {modIdx + 1}. {mod.title}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)' }}>
                  {mod.lessons.length} lección{mod.lessons.length !== 1 ? 'es' : ''}
                </span>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveModule(mod.id, 'up')} disabled={modIdx === 0} style={{ background: 'none', border: 'none', cursor: modIdx === 0 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '14px', padding: '2px 6px', opacity: modIdx === 0 ? 0.2 : 1 }}>↑</button>
                  <button onClick={() => moveModule(mod.id, 'down')} disabled={modIdx === modules.length - 1} style={{ background: 'none', border: 'none', cursor: modIdx === modules.length - 1 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '14px', padding: '2px 6px', opacity: modIdx === modules.length - 1 ? 0.2 : 1 }}>↓</button>
                  <button onClick={() => deleteModule(mod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,107,0.4)', fontSize: '18px', padding: '2px 6px', lineHeight: 1 }}>×</button>
                </div>
              </div>

              {/* Lessons */}
              {isExpanded && (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mod.lessons.map((lesson, lsnIdx) => {
                    const lsnExpanded = expandedLessons.has(lesson.id)
                    return (
                      <div key={lesson.id} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Lesson header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                          onClick={() => setExpandedLessons(s => { const n = new Set(s); lsnExpanded ? n.delete(lesson.id) : n.add(lesson.id); return n })}>
                          <span style={{ color: 'rgba(247,247,242,0.25)', fontSize: '11px' }}>{lsnExpanded ? '▼' : '▶'}</span>
                          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.75)' }}>
                            {modIdx + 1}.{lsnIdx + 1} {lesson.title}
                            {lesson.is_free_preview && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(78,205,196,0.1)', color: 'var(--color-teal)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(78,205,196,0.2)' }}>preview</span>}
                            {lesson.pdf_url && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(255,255,255,0.04)', color: 'rgba(247,247,242,0.3)', padding: '2px 8px', borderRadius: '100px' }}>PDF ✓</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => moveLesson(mod.id, lesson.id, 'up')} disabled={lsnIdx === 0} style={{ background: 'none', border: 'none', cursor: lsnIdx === 0 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '13px', padding: '2px 5px', opacity: lsnIdx === 0 ? 0.2 : 1 }}>↑</button>
                            <button onClick={() => moveLesson(mod.id, lesson.id, 'down')} disabled={lsnIdx === mod.lessons.length - 1} style={{ background: 'none', border: 'none', cursor: lsnIdx === mod.lessons.length - 1 ? 'default' : 'pointer', color: 'rgba(247,247,242,0.3)', fontSize: '13px', padding: '2px 5px', opacity: lsnIdx === mod.lessons.length - 1 ? 0.2 : 1 }}>↓</button>
                            <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,107,0.4)', fontSize: '16px', padding: '2px 5px', lineHeight: 1 }}>×</button>
                          </div>
                        </div>

                        {/* Lesson form */}
                        {lsnExpanded && (
                          <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={labelStyle}>Título</label>
                              <input style={inputStyle} value={lesson.title} onChange={e => updateLessonField(mod.id, lesson.id, 'title', e.target.value)} />
                            </div>
                            <div>
                              <label style={labelStyle}>Descripción</label>
                              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={lesson.description || ''} onChange={e => updateLessonField(mod.id, lesson.id, 'description', e.target.value)} />
                            </div>
                            <div>
                              <label style={labelStyle}>Duración (min)</label>
                              <input style={inputStyle} type="number" value={lesson.duration_minutes ?? ''} onChange={e => updateLessonField(mod.id, lesson.id, 'duration_minutes', e.target.value ? Number(e.target.value) : null)} />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)' }}>
                              <input type="checkbox" checked={lesson.is_free_preview} onChange={e => updateLessonField(mod.id, lesson.id, 'is_free_preview', e.target.checked)} style={{ accentColor: 'var(--color-teal)' }} />
                              Preview gratuita (visible sin suscripción)
                            </label>

                            {/* PDF upload */}
                            <div>
                              <label style={labelStyle}>PDF</label>
                              {lesson.pdf_url ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-teal)' }}>Ver PDF actual</a>
                                  <span style={{ color: 'rgba(247,247,242,0.2)', fontSize: '12px' }}>|</span>
                                  <label style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.4)' }}>
                                    Reemplazar
                                    <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadPdf(mod.id, lesson.id, e.target.files[0]); e.target.value = '' }} />
                                  </label>
                                </div>
                              ) : (
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: uploadingLesson === lesson.id ? 'wait' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)' }}>
                                  {uploadingLesson === lesson.id ? 'Subiendo...' : '+ Subir PDF'}
                                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} disabled={uploadingLesson === lesson.id} onChange={e => { if (e.target.files?.[0]) uploadPdf(mod.id, lesson.id, e.target.files[0]); e.target.value = '' }} />
                                </label>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                              <button
                                onClick={() => saveLesson(mod.id, lesson)}
                                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)', color: 'var(--color-teal)' }}
                              >
                                Guardar lección
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button
                    onClick={() => addLesson(mod.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.08)', color: 'rgba(247,247,242,0.3)', width: '100%', justifyContent: 'center' }}
                  >
                    + Agregar lección
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
