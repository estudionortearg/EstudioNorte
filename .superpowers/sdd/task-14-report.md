# Task 14 Report — Admin Panel /admin

**Status:** DONE

**Commit:** fc4e01c — `feat: admin panel — métricas, cursos, alumnos, ventas`

**Build result:** ✓ 0 errors — all admin routes compiled as dynamic (ƒ) server-rendered pages

**Concerns:**
- Added `export const dynamic = 'force-dynamic'` to all four admin pages (not in original spec) — required because `createAdminClient()` reads env vars at module init time, which causes static prerender to fail at build time without Supabase credentials.
- The `e.courses as unknown as ...` double-cast was needed because Supabase infers the joined relation as an array type; the spec's single cast `as { title: string; slug: string } | null` fails TS strict overlap check — routing through `unknown` resolves it cleanly.
