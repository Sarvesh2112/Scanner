# CLAUDE.md

## Workflow for changes

When making any code changes, follow this order — do **not** skip steps:

1. **Make the change**, then ensure it runs on the **local dev server** (`npm run dev`).
   Verify it builds/type-checks (`npx tsc -b`) and works locally before involving the user.
2. **Wait for the user's approval.** Show what changed and let them confirm the change
   is good. Do not push on your own initiative.
3. **Only after the user approves**, push to GitHub (`git push`).

Never push to GitHub before the user has approved the change.

## Running on a phone

To test on a phone, run `npm run dev` and open the **Network** URL it prints
(e.g. `http://192.168.29.4:5173/`) on the phone. The phone must be on the same
Wi-Fi network as this machine. This is plain-HTTP LAN access, so the
`crypto.randomUUID()` secure-context caveat below applies.

## Project notes

- Card Wallet: a business-card scanner PWA. Card photos are sent directly to the
  Gemini API (`gemini-2.5-flash`) for structured field extraction (see `src/gemini.ts`).
- The Gemini API key lives in `.env.local` as `VITE_GEMINI_API_KEY` (gitignored — never commit it).
- Secrets (`.env*.local`) and local Claude settings (`.claude/`) are gitignored; keep them out of commits.
- `crypto.randomUUID()` requires a secure context (HTTPS/localhost); over plain-HTTP LAN
  access use the `newId()` fallback in `src/components/ReviewForm.tsx`.
