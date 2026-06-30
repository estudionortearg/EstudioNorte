'use client'

import { useTransition } from 'react'
import { togglePublish } from './actions'

export default function TogglePublish({ courseId, published }: { courseId: string; published: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => togglePublish(courseId, published))}
      disabled={pending}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '8px', cursor: pending ? 'wait' : 'pointer',
        fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
        border: `1px solid ${published ? 'rgba(255,107,107,0.2)' : 'rgba(78,205,196,0.2)'}`,
        background: published ? 'rgba(255,107,107,0.06)' : 'rgba(78,205,196,0.06)',
        color: published ? 'var(--color-coral)' : 'var(--color-teal)',
        transition: 'opacity 0.15s',
        opacity: pending ? 0.5 : 1,
      }}
    >
      {pending ? '...' : published ? 'Despublicar' : 'Publicar'}
    </button>
  )
}
