# Cluster 03 — Structural Separations (C2/M4/M5/M8/K2)

**Goal:** Do the separations the handbook claimed but never shipped.

## Steps
1. **AppRole extraction** — follow `references/APPROLE_EXTRACTION.md` exactly. Create `src/utils/app-role.ts`, re-export from `get-user-role.ts`, repoint value-import sites (grep to find them). (C2 / L1)
2. **Derived flags** — add `isAdmin`, `isSuperadmin`, `isMember` to `useAuthStore`. KEEP all three (superadmin stays). (M4 / L5)
3. **Type the user** — `useAuthStore.user: SupabaseUser | null` (import the type from `@supabase/supabase-js`; no cast). (M5 / L6)
4. **Logout flexibility** — make `src/components/auth/Logout.tsx` reusable: add a render-as prop OR export `useLogoutHandler()` + `LogoutMenuItem`. Pick one, keep it simple. (M8 / L33)
5. **Directive typo** — fix `AuthTabs.tsx` `"use Client"` → `"use client"`; grep `grep -rn '"use Client"' src/` returns zero. (K2 / L34)
6. Verify: `rm -rf .next`, `npx tsc --noEmit` (0), `npm test` (all pass).

## Stop Gate
Show: app-role.ts created + re-export, import-site list updated, store flags + typing diff, Logout refactor shape, directive grep clean, green triad. Await review.

## Output
Client/server boundary safe; store typed + flag-complete; Logout reusable; directive fixed.
