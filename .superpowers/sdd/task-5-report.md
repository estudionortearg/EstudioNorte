# Task 5 Report

**Status:** DONE

**Commit:** 0fee80a — `feat: landing page — hero animado, secciones, copy real`

**Build result:** ✓ 0 errors — static page `/` generated successfully

**Concerns:**
- framer-motion v12 requires `ease` to be typed as `const` (not plain string) — fixed with `'easeOut' as const` and explicit `Variants` typing.
- `npm install framer-motion` produced audit warnings (unrelated vulnerabilities in dev deps); no action needed.
