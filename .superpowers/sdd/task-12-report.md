# Task 12 Report — Lesson Player

**Status:** DONE

**Commit:** 2fa2f66 — `feat: player de clases dos paneles con sidebar y progreso`

**Build result:** `✓ Compiled successfully` — 0 errors, all routes registered including `/aprender/[slug]` and `/aprender/[slug]/[leccion]`

**Files created (6):**
- `components/player/VideoPlayer.tsx`
- `components/player/LessonSidebar.tsx`
- `app/api/progress/route.ts`
- `app/aprender/[slug]/page.tsx`
- `app/aprender/[slug]/[leccion]/page.tsx`
- `app/aprender/[slug]/[leccion]/LessonPlayerLayout.tsx`

**Concerns:**
- One TS fix required: `slug_or_id` in `LessonSidebar.Lesson` made optional (field is declared but never used in render; `PlayerLesson` in `LessonPlayerLayout` omits it — making it optional resolves the conflict without changing behavior).
- Mobile layout: the two 70/30 panels do not stack on mobile — this is noted as a known limitation per spec; desktop is the priority.
- The `progressPercent` prop passed from the server is computed at load time; the displayed percentage updates client-side via `completed.length / allLessons.length` in `LessonPlayerLayout`, keeping them in sync after marking lessons complete.
