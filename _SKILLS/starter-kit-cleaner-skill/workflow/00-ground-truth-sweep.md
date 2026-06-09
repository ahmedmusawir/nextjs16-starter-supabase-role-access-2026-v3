# Cluster 00 — Ground-Truth Sweep

**Goal:** Know disk before touching it. Confirm clean v2 (not Cyber Pharma). Capture baselines. Produces the Plan you stop on.

## Steps
1. **Environment:** `pwd`, `ls -la`, `git remote -v`, `git status`, `cat package.json` (confirm Next ~16.2.x, React ~19.x, `"test":"jest"`, Tailwind 3.4.x), `cat src/app/globals.scss 2>/dev/null || cat src/app/globals.css 2>/dev/null`.
2. **Wrong-base guard:** `grep -rniE "coral|owedbook|cyberize|cyberpharma" src/ public/ 2>/dev/null`. Any hit → **STOP**, tell operator they need a fresh v2 (see CLAUDE.md §5).
3. **Verify handbook-named files exist** (don't trust the doc — `find`): `src/utils/app-role.ts` (expected ABSENT on v2), `src/store/useAuthStore.ts`, `src/components/global/ThemeToggle*.tsx`, `src/services/*`, the route groups.
4. **Route table:** `rm -rf .next && npm run build` (env may be unset — note if it fails at prerender; that's defect C1, expected). Record the route list — look for `/demo`, `/template`, `/api/ghl/hooktest`, stray `/profile`.
5. **Baseline greps (record counts):**
   - numbered colors: see `references/COLOR_MIGRATION.md` grep
   - `any` in store: `grep -n "any" src/store/useAuthStore.ts`
   - directive typo: `grep -rn '"use Client"' src/`
   - derived flags present? `grep -n "isAdmin\|isSuperadmin\|isMember" src/store/useAuthStore.ts`
6. **Cross-check** every finding against `references/DEFECT_LEDGER.md`.
7. Write repo-root `RECOVERY.md` from `templates/RECOVERY.md`.

## Stop Gate
Present the Plan: versions, confirmed defects (with disk evidence), baseline grep counts, the 8-cluster order, any disk-vs-ledger deltas. End **"Awaiting APPROVED."** No edits until approved.

## Output
Approved execution plan + confirmed defect inventory + RECOVERY.md at root.
