# Cluster 08 — Verify & Tag (close-out)

**Goal:** Prove v3 is clean; lock it.

## Steps
1. **Final grep sweep (all must pass):**
   - numbered colors → zero (COLOR_MIGRATION grep)
   - `any` in `useAuthStore` → none
   - residue `coral|owedbook|cyberize|cyberpharma|ghl|hooktest` → none
   - `"use Client"` typo → none
   - dead nav links → none
2. **Verification triad from cold:** `rm -rf .next`; `npx tsc --noEmit` (exit 0); `npm test` (ALL remaining pass — criterion is "all pass," not "≥ old count"); `npm run build` (clean, NO env).
3. **Invariants:** superadmin intact (routes/layout/sidebar/tests present); design system neutral (no coral); cold build clean.
4. Update repo `RECOVERY.md` (Last action / Pending: none / Next: clone for Super Admin Portal — Stage 2, separate effort).
5. `git add -A && git commit` then `git tag v3`.

## Stop Gate
Present close-out summary (CLAUDE.md §6): per-cluster changes, grep proofs, final triad output, and the **two product-chat sync notes** (which 🏛️ doctrine lessons landed in the v1.1 handbook, so the FFM Playbook rewrite stays in sync). Await operator's final confirmation, THEN tag.

## Output
Tagged Starter Kit v3 — clean, generic, truth-telling ancestor. Done. Do NOT start Stage 2 here.
