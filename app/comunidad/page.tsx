import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = { title: 'Comunidad — Estudio Norte' }

const CATEGORIES = [
  { key: 'general', label: 'General', emoji: '💬', desc: 'Conversaciones libres del mundo del diseño y los negocios' },
  { key: 'branding', label: 'Branding', emoji: '🎨', desc: 'Identidad visual, tipografía, paletas y marca personal' },
  { key: 'ia', label: 'IA & Herramientas', emoji: '🤖', desc: 'Midjourney, ChatGPT, Canva IA y otros recursos' },
  { key: 'trabajos', label: 'Mis trabajos', emoji: '✨', desc: 'Compartí tu portfolio, logotipos y proyectos' },
  { key: 'dudas', label: 'Dudas', emoji: '🙋', desc: 'Preguntas sobre los cursos y el proceso de aprendizaje' },
]

export default async function ComunidadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle()
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'alumno'

  // Recent posts across all categories
  const { data: recentPosts } = await supabase
    .from('community_posts')
    .select('id, title, category, reply_count, reaction_count, created_at, profiles!user_id(full_name)')
    .eq('status', 'published')
    .not('category', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8)

  // Stats
  const { count: totalPosts } = await supabase
    .from('community_posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: totalMembers } = await supabase
    .from('enrollments')
    .select('user_id', { count: 'exact', head: true })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
              Dashboard
            </Link>
            <span style={{ color: 'var(--en-border)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)' }}>Comunidad</span>
          </div>
          <Link href="/comunidad/nuevo" style={{
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
            {/* Heading */}
            <div style={{ background: 'var(--en-surface)', border: '1px solid var(--en-border)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-1.5px', color: 'var(--en-text)', marginBottom: '8px' }}>
                Comunidad
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--en-text-soft)' }}>
                Tu espacio para aprender, preguntar y compartir con otros emprendedores.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
                  <strong style={{ color: 'var(--en-text)' }}>{totalPosts || 0}</strong> publicaciones
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)' }}>
                  <strong style={{ color: 'var(--en-text)' }}>{totalMembers || 0}</strong> miembros
                </span>
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '12px' }}>
                Categorías
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {CATEGORIES.map(cat => (
                  <Link key={cat.key} href={`/comunidad/${cat.key}`} style={{
                    display: 'block', padding: '16px 18px', borderRadius: '12px', textDecoration: 'none',
                    background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ fontSize: '22px', marginBottom: '8px' }}>{cat.emoji}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--en-text)', marginBottom: '4px' }}>{cat.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', lineHeight: 1.4 }}>{cat.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent posts */}
            {recentPosts && recentPosts.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--en-text)', letterSpacing: '-0.3px', marginBottom: '12px' }}>
                  Publicaciones recientes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentPosts.map((p: any) => {
                    const cat = CATEGORIES.find(c => c.key === p.category)
                    const ago = timeAgo(p.created_at)
                    return (
                      <Link key={p.id} href={`/comunidad/post/${p.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                        borderRadius: '12px', textDecoration: 'none',
                        background: 'var(--en-surface)', border: '1px solid var(--en-border)',
                      }}>
                        <span style={{ fontSize: '18px', flexShrink: 0 }}>{cat?.emoji || '💬'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            {p.title}
                          </p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>
                            {(p.profiles as any)?.full_name || 'Alumno'} · {ago}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            💬 {p.reply_count}
                          </span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ❤️ {p.reaction_count}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <BottomNav activeRoute="/comunidad" />
    </div>
  )
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
