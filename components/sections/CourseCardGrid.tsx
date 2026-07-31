'use client'

import Link from 'next/link'

interface Course {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image_url: string | null
}

export default function CourseCardGrid({ courses }: { courses: Course[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
      {courses.map(course => (
        <Link key={course.id} href={`/cursos/${course.slug}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--en-border)',
              boxShadow: 'var(--en-shadow-sm)',
              overflow: 'hidden', transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--en-shadow)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--en-shadow-sm)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            {course.cover_image_url ? (
              <div style={{ height: '140px', background: `url(${course.cover_image_url}) center/cover`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15))' }}/>
              </div>
            ) : (
              <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--en-green-light), var(--en-coral-light))' }}/>
            )}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--en-text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                {course.title}
              </h3>
              {course.description && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
