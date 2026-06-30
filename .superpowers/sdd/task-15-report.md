# Task 15 Report — Resend Transactional Emails

**Status:** DONE

**Commit:** b3b448b — feat: Resend emails — bienvenida, recordatorio, certificado

**Build result:** ✓ 0 errors — 21 routes compiled successfully

**Concerns:**
- Resend client is instantiated per-call (via `getResend()`) using a fallback `'placeholder'` key when `RESEND_API_KEY` is absent, to avoid the build-time throw. At runtime, emails will silently fail if the env var is not set — the try/catch in webhooks handles this non-fatally.
- `courseTitle` passed to welcome email is currently the `courseSlug` string (as noted in task spec); a follow-up task should query the `courses` table for the real title before sending.
