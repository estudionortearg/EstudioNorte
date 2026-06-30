'use client'

import { useState } from 'react'

interface Alumno {
  id: string
  user_id: string
  enrolled_at: string
  email: string
  courseTitle: string
  courseSlug: string
  note: string
}

export default function AlumnosClient({ alumnos, courses }: { alumnos: Alumno[]; courses: string[] }) {
  const [filter, setFilter] = useState('Todos')
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(alumnos.map(a => [a.user_id, a.note]))
  )
  const [savingNote, setSavingNote] = useState<string | null>(null)

  const filtered = filter === 'Todos' ? alumnos : alumnos.filter(a => a.courseTitle === filter)

  const copyEmails = () => {
    const emails = [...new Set(filtered.map(a => a.email))].join(', ')
    navigator.clipboard.writeText(emails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportCSV = () => {
    const rows = [
      ['Email', 'Curso', 'Inscripto el'],
      ...filtered.map(a => [a.email, a.courseTitle, new Date(a.enrolled_at).toLocaleDateString('es-AR')])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alumnos.csv'
    a.click()
  }

  const saveNote = async (userId: string) => {
    setSavingNote(userId)
    await fetch('/api/admin/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, note: notes[userId] || '' }),
    })
    setSavingNote(null)
  }

  const uniqueUsers = new Set(alumnos.map(a => a.user_id)).size

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Todos', ...courses].map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: filter === c ? 600 : 400,
              background: filter === c ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === c ? 'rgba(78,205,196,0.25)' : 'rgba(255,255,255,0.07)'}`,
              color: filter === c ? 'var(--color-teal)' : 'rgba(247,247,242,0.4)',
              transition: 'all 0.15s',
            }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copyEmails} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
            background: copied ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(78,205,196,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: copied ? 'var(--color-teal)' : 'rgba(247,247,242,0.5)',
            transition: 'all 0.2s',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 4V2.5A1.5 1.5 0 015.5 1h5A1.5 1.5 0 0112 2.5v5A1.5 1.5 0 0110.5 9H9" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {copied ? '¡Copiado!' : 'Copiar emails'}
          </button>
          <button onClick={exportCSV} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(247,247,242,0.5)', transition: 'all 0.2s',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3.5 6l3 3 3-3M1 10v1.5A.5.5 0 001.5 12h10a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Alumnos únicos', value: uniqueUsers, color: 'var(--color-teal)' },
          { label: 'Inscripciones', value: alumnos.length, color: 'var(--color-coral)' },
          { label: 'Mostrando', value: filtered.length, color: 'rgba(247,247,242,0.5)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '8px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color, letterSpacing: '-0.5px' }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Alumno', 'Curso', 'Inscripto el', 'Nota interna'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)', fontFamily: 'var(--font-body)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const initials = a.email.slice(0, 2).toUpperCase()
              return (
                <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(255,107,107,0.08))',
                        border: '1px solid rgba(78,205,196,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--color-teal)',
                      }}>
                        {initials}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)' }}>
                        {a.email}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.5)' }}>
                      {a.courseTitle || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.25)' }}>
                      {new Date(a.enrolled_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ padding: '10px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Ej: pagó por transferencia"
                        value={notes[a.user_id] || ''}
                        onChange={e => setNotes(prev => ({ ...prev, [a.user_id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && saveNote(a.user_id)}
                        style={{
                          flex: 1, padding: '6px 10px', borderRadius: '7px', fontSize: '12px',
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--color-text)', fontFamily: 'var(--font-body)', outline: 'none',
                          minWidth: 0,
                        }}
                      />
                      <button
                        onClick={() => saveNote(a.user_id)}
                        disabled={savingNote === a.user_id}
                        style={{
                          padding: '6px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '11px',
                          background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)',
                          color: 'var(--color-teal)', fontFamily: 'var(--font-body)',
                          opacity: savingNote === a.user_id ? 0.5 : 1,
                        }}
                      >
                        {savingNote === a.user_id ? '...' : 'Guardar'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'rgba(247,247,242,0.2)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                  Sin alumnos en este filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
