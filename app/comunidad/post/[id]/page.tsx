import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import StudentSidebar from '@/components/layout/StudentSidebar'
import BottomNav from '@/components/layout/BottomNav'
import PostClient from './PostClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('community_posts').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — Comunidad Estudio Norte` : 'Comunidad' }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('community_posts')
    .select('id, title, body, category, lesson_id, solution_reply_id, is_pinned, is_locked, status, reply_count, reaction_count, created_at, user_id, profiles!user_id(full_name, avatar_url, is_admin)')
    .eq('id', id)
    .single()

  if (!post || post.status === 'hidden') notFound()

  const { data: replies } = await supabase
    .from('community_replies')
    .select('id, body, is_bot, reaction_count, created_at, profiles!user_id(full_name, avatar_url, is_admin)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // User's reactions
  const { data: myReactions } = await supabase
    .from('community_reactions')
    .select('post_id, reply_id')
    .eq('user_id', user.id)

  const myReactedPostIds = (myReactions || []).filter(r => r.post_id).map(r => r.post_id!)
  const myReactedReplyIds = (myReactions || []).filter(r => r.reply_id).map(r => r.reply_id!)

  const { data: profile } = await supabase.from('profiles').select('full_name, is_admin').eq('id', user.id).maybeSingle()
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'alumno'

  const backHref = post.category ? `/comunidad/${post.category}` : '/comunidad'
  const backLabel = post.category ? `${post.category.charAt(0).toUpperCase() + post.category.slice(1)}` : 'Comunidad'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)', paddingBottom: '80px' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: '8px', height: '60px' }}>
          <Link href={backHref} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            {backLabel}
          </Link>
          <span style={{ color: 'var(--en-border)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            {post.title}
          </span>
        </div>
      </header>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          <StudentSidebar activeRoute="/comunidad" displayName={displayName} />
          <main style={{ flex: 1, minWidth: 0 }}>
            <PostClient
              post={post as any}
              initialReplies={(replies || []) as any}
              userId={user.id}
              isAdmin={profile?.is_admin === true}
              myReactedPostIds={myReactedPostIds as string[]}
              myReactedReplyIds={myReactedReplyIds as string[]}
            />
          </main>
        </div>
      </div>
      <BottomNav activeRoute="/comunidad" />
    </div>
  )
}
