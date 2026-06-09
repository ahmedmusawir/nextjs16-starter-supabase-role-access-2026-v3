# Cluster 05 — Env, Build & Config (C3/C4/K1 / L9,L13,L14,L24,L25)

**Goal:** Cold build passes with no env; ship env example; fix the two config defects.

## Steps
1. Follow `references/ENV_AND_BUILD.md`.
2. **Env example:** install `templates/env.local.example` at root; grep `process.env` in `src/` to confirm exact names (Q4-2025: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`). (C3/L9)
3. **scss→css:** rename `src/app/globals.scss` → `globals.css`; update the `layout.tsx` import; `grep -rn "globals.scss" src/` returns zero; drop `sass` dep if unused. (K1/L14)
4. **tsconfig:** append `"agent_docs/**"` to `exclude`. (C4/L13)
5. **Cold build:** `rm -rf .next`; with NO `.env.local`, `npm run build` completes; route table clean (no /demo, /template, /api/ghl). (C1/L24)

## Stop Gate
Show cold `npm run build` clean + the route table + the env example contents. Await review.

## Output
Cold build green; `.env.local.example` shipped; `globals.css` entry; tsconfig excludes agent_docs.
