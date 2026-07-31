import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BadgeRow {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  condition_type: string
  condition_value: number
}

async function evaluateBadges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
  totalXp: number,
  currentStreak: number
): Promise<Array<{ slug: string; name: string; emoji: string; description: string }>> {
  const { data: allBadges } = await supabase
    .from('badges')
    .select('id, slug, name, emoji, description, condition_type, condition_value')
    .eq('is_active', true)

  if (!allBadges || allBadges.length === 0) return []

  const { data: existingGlobal } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .is('course_id', null)

  const { data: existingCourse } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)

  const globalEarned = new Set((existingGlobal || []).map((r: { badge_id: string }) => r.badge_id))
  const courseEarned = new Set((existingCourse || []).map((r: { badge_id: string }) => r.badge_id))

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .in('module_id', (
      await supabase.from('modules').select('id').eq('course_id', courseId)
    ).data?.map((m: { id: string }) => m.id) || [])

  const { count: completedLessons } = await supabase
    .from('progress')
    .select('lesson_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('lesson_id', (
      await supabase.from('lessons').select('id').in('module_id',
        (await supabase.from('modules').select('id').eq('course_id', courseId)).data?.map((m: { id: string }) => m.id) || []
      )
    ).data?.map((l: { id: string }) => l.id) || [])

  const { count: coursesCompleted } = await supabase
    .from('user_badges')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('badge_id', allBadges.find((b: BadgeRow) => b.slug === 'course_complete')?.id || '')

  const { count: totalProgressCount } = await supabase
    .from('progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const earned: Array<{ slug: string; name: string; emoji: string; description: string }> = []

  // I1 fix: track if course_complete badge is earned in this request so
  // courses_completed count is accurate when evaluated later in the same loop
  let courseCompleteEarnedThisRequest = 0

  // Evaluate course_complete badges first so the count is available for courses_completed
  const sortedBadges = [
    ...(allBadges as BadgeRow[]).filter(b => b.condition_type === 'course_complete'),
    ...(allBadges as BadgeRow[]).filter(b => b.condition_type !== 'course_complete'),
  ]

  for (const badge of sortedBadges) {
    let qualifies = false
    let isCourseScoped = false

    switch (badge.condition_type) {
      case 'first_lesson':
        qualifies = (totalProgressCount || 0) >= 1 && !globalEarned.has(badge.id)
        break
      case 'streak_days':
        qualifies = currentStreak >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'total_xp':
        qualifies = totalXp >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'courses_completed':
        // Add any course_complete badge earned in this same request to the count
        qualifies = ((coursesCompleted || 0) + courseCompleteEarnedThisRequest) >= badge.condition_value && !globalEarned.has(badge.id)
        break
      case 'course_complete':
        isCourseScoped = true
        qualifies = (totalLessons || 0) > 0 &&
          completedLessons === totalLessons &&
          !courseEarned.has(badge.id)
        break
    }

    if (qualifies) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        course_id: isCourseScoped ? courseId : null,
      })
      if (badge.condition_type === 'course_complete') {
        courseCompleteEarnedThisRequest++
      }
      earned.push({ slug: badge.slug, name: badge.name, emoji: badge.emoji, description: badge.description })
    }
  }

  return earned
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lesson_id } = await req.json()
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  // Obtener lección y su course_id
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, xp_value, module_id, is_free_preview, modules!inner(course_id)')
    .eq('id', lesson_id)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  // Plan guard — free users cannot record progress on non-preview lessons
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if ((profile?.plan ?? 'free') === 'free' && !lesson.is_free_preview) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const courseId = (lesson.modules as unknown as { course_id: string }).course_id
  const xpValue = lesson.xp_value || 10

  // Paso 1: Insertar progreso (atómico — evita race condition con ON CONFLICT DO NOTHING)
  const { data: insertedRows, error: insertError } = await supabase
    .from('progress')
    .upsert(
      { user_id: user.id, lesson_id, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
    )
    .select('id')

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Si no se insertó ninguna fila nueva → ya estaba completada
  const alreadyCompleted = !insertedRows || insertedRows.length === 0
  if (alreadyCompleted) {
    const { data: xpRow } = await supabase.from('user_xp').select('total_xp').eq('user_id', user.id).single()
    const { data: courseXpRow } = await supabase.from('user_course_xp').select('xp').eq('user_id', user.id).eq('course_id', courseId).single()
    const { data: streakRow } = await supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single()
    return NextResponse.json({
      xp_earned: 0,
      new_total_xp: xpRow?.total_xp || 0,
      new_course_xp: courseXpRow?.xp || 0,
      streak: { current: streakRow?.current_streak || 0, longest: streakRow?.longest_streak || 0 },
      badges_earned: [],
      already_completed: true,
    })
  }

  // Paso 2: Actualizar XP global
  const { data: xpRow } = await supabase.from('user_xp').select('total_xp').eq('user_id', user.id).single()
  const newTotalXp = (xpRow?.total_xp || 0) + xpValue
  await supabase.from('user_xp').upsert({ user_id: user.id, total_xp: newTotalXp, updated_at: new Date().toISOString() })

  // Paso 3: Actualizar XP del curso
  const { data: courseXpRow } = await supabase.from('user_course_xp').select('xp').eq('user_id', user.id).eq('course_id', courseId).single()
  const newCourseXp = (courseXpRow?.xp || 0) + xpValue
  await supabase.from('user_course_xp').upsert({ user_id: user.id, course_id: courseId, xp: newCourseXp })

  // Paso 4: Evaluar racha
  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single()

  let newStreak = 1
  let newLongest = streakRow?.longest_streak || 1
  let newFreezeUsedDate = streakRow?.freeze_used_date || null

  if (!streakRow || !streakRow.last_activity_date) {
    newStreak = 1
  } else if (streakRow.last_activity_date === today) {
    newStreak = streakRow.current_streak
    newLongest = streakRow.longest_streak
  } else if (streakRow.last_activity_date === yesterday) {
    newStreak = streakRow.current_streak + 1
    newLongest = Math.max(newStreak, streakRow.longest_streak)
  } else if (streakRow.last_activity_date === twoDaysAgo && streakRow.freeze_used_date !== yesterday) {
    // Freeze aplica: faltaste exactamente ayer y el freeze no fue usado ayer
    newStreak = streakRow.current_streak
    newLongest = streakRow.longest_streak
    newFreezeUsedDate = yesterday
  } else {
    // Reset: faltaste 2+ días o ya usaste el freeze ayer
    newStreak = 1
    newFreezeUsedDate = null
  }

  await supabase.from('user_streaks').upsert({
    user_id: user.id,
    current_streak: newStreak,
    longest_streak: newLongest,
    last_activity_date: today,
    freeze_used_date: newFreezeUsedDate,
  })

  // Paso 5: Evaluar badges (no bloquea si falla)
  let badgesEarned: Array<{ slug: string; name: string; emoji: string; description: string }> = []
  try {
    badgesEarned = await evaluateBadges(supabase, user.id, courseId, newTotalXp, newStreak)
  } catch (e) {
    console.error('Badge evaluation failed (non-fatal):', e)
  }

  return NextResponse.json({
    xp_earned: xpValue,
    new_total_xp: newTotalXp,
    new_course_xp: newCourseXp,
    streak: { current: newStreak, longest: newLongest },
    badges_earned: badgesEarned,
    already_completed: false,
  })
}
