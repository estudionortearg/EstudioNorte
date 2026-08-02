import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'

const CATEGORIES: Record<string, { label: string; emoji: string; desc: string }> = {
  general:   { label: 'General',         emoji: '💬', desc: 'Conversaciones libres' },
  branding:  { label: 'Branding',        emoji: '🎨', desc: 'Identidad visual y marca' },
  ia:        { label: 'IA & Herramientas', emoji: '🤖', desc: 'Herramientas y recursos con IA' },
  trabajos:  { label: 'Mis trabajos',    emoji: '✨', desc: 'Compartí tu portfolio' },
  dudas:     { label: 'Dudas',           emoji: '🙋', desc: 'Preguntas sobre los cursos' },
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category]
  return { title: cat ? `${cat.label} — Comunidad Estudio Norte` : 'Comunidad' }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  if (!CATEGORIES[category]) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, is_admin').eq('id', user.id).maybeSingle()
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'alumno'
  const cat = CATEGORIES[category]

  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, title, body, reply_count, reaction_count, solution_reply_id, is_pinned, created_at, profiles!user_id(full_name, avatar_url)')
    .eq('category', category)
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/comunidad" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
              Comunidad
            </Link>
            <span style={{ color: 'var(--en-border)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)' }}>{cat.emoji} {cat.label}</span>
          </div>
          <Link href={`/comunidad/nuevo?category=${category}`} style={{
            padding: '8px 16px', borderRadius: '9px', textDecoration: 'none',
            background: 'var(--en-green)', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
          }}>
            + Nuevo hilo
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          <StudentSidebar activeRoute="/comunidad" displayName={displayName} />

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', padding: '20px 24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.emoji}</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '4px' }}>{cat.label}</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>{cat.desc}</p>
            </div>

            {(!posts || posts.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--en-surface)', border: '1.5px dashed var(--en-border)', borderRadius: '16px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--en-text)', marginBottom: '8px' }}>
                  Todavía no hay hilos acá
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)', marginBottom: '20px' }}>
                  Sé el primero en abrir una conversación.
                </p>
                <Link href={`/comunidad/nuevo?category=${category}`} style={{
                  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                  background: 'var(--en-green)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                }}>
                  Crear primer hilo →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(posts as any[]).map(post => {
                  const author = (post.profiles as any)
                  const initials = (author?.full_name || '?').slice(0, 2).toUpperCase()
                  const isSolved = !!post.solution_reply_id
                  return (
                    <Link key={post.id} href={`/comunidad/post/${post.id}`} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px',
                      borderRadius: '12px', textDecoration: 'none',
                      background: 'var(--en-surface)', border: `1px solid ${isSolved ? 'var(--en-green-15)' : 'var(--en-border)'}`,
                      background: isSolved ? 'color-mix(in srgb, var(--en-green) 3%, var(--en-surface))' : 'var(--en-surface)',
                    } as any}>
                      {/* Avatar */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--en-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '12px', color: '#fff',
                        overflow: 'hidden',
                      }}>
                        {author?.avatar_url
                          ? <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          : initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          {post.is_pinned && (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📌 Fijado</span>
                          )}
                          {isSolved && (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--en-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Resuelto</span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                          {post.title}
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                          {author?.full_name || 'Alumno'} · {timeAgo(post.created_at)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>💬 {post.reply_count}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)' }}>❤️ {post.reaction_count}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
      <BottomNav activeRoute="/comunidad" />
    </div>
  )
}
