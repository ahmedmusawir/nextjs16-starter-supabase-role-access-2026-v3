# RECON REPORT — Starter Kit v3, post-campaign (main @ `8ff8913`)

> **Run:** 2026-07-26 · `stark-recon` v1.1 · Engineer: Claudy (Claude Code)
> **Scope:** full mission (Sections 0–13), read-only. Prior recon: `RECON_starter-kit-v3_kit-hardening_2026-06-26.md` (pre-campaign). Since then: all 10 gates closed, `gate-2-app-shell` merged into `main`, operator cleanup commits (`8467785` → `8ff8913`, incl. "removed app factory docs").
> **Labels:** EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION per `EVIDENCE_DISCIPLINE.md`. Disk wins.

---

## Section 0 — Day-0 Ground-Truth Sweep

**S0.1 Handbook-named files.** All 12 `src/` paths named in `STARTER_KIT_HANDBOOK_v1.1.md` verified on disk — EVIDENCE (existence loop, 0 missing). The one "miss" (`src/services/authService.ts`) is the handbook's 🛑 DO-NOT-AUTHOR entry (handbook :53) — absence is *correct*, not drift.

**S0.2 Handbook-claimed shapes.** `useAuthStore` exposes `user: SupabaseUser | null`, `role: AppRole | null`, `isAuthenticated`, `isAdmin`, `isSuperadmin`, `isMember`, `isLoading`, `login`, `logout` — EVIDENCE: `src/store/useAuthStore.ts:5-16`. Typed user (no `any`), derived flags real. Matches handbook v1.1 claims. The pre-campaign `user: any` defect is gone.

**S0.3 Forbidden-zone greps (kit baseline).**
- `: any` / `as any` in app code: **1** — vendored `src/components/ui/command.tsx:35` (`{children as any}`) — EVIDENCE. All other hits are test mocks under `src/__tests__/` (accepted pattern). Unchanged from campaign close.
- `dangerouslySetInnerHTML`: **0** — EVIDENCE (grep empty).
- `user_metadata` role READS in app logic: **0** — EVIDENCE. All app-code hits are metadata *writes* at the two writers (`(superadmin)/superadmin-portal/actions.ts:138,175`; `(admin)/admin-portal/actions.ts:132,185`) and a display-name fallback read (`components/profile/ProfileForm.tsx:45` reads `full_name`, not role). Authorization still resolves via `user_roles` table only (`src/utils/get-user-role.ts`).

**S0.5 Test runner.** Jest — EVIDENCE: `package.json` `"test": "jest"`, `jest@^30.0.5`. (Global CLAUDE.md v3.1 now also says Jest — doc and disk agree; the old Vitest drift is dead.)

**S0.6 Env names.** `.env.local.example` ↔ code agree exactly — EVIDENCE. Four vars, Q4-2025 naming: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (grep `process.env.` in `src/` yields exactly these four). `.env.local` present in tree (as at prior recon).

**S0.7 Build route table (cold, `.next` wiped).** Build **EXIT 0**. **16 routes** — EVIDENCE:
`/` (static), `/_not-found`, `/auth` (static), `/error` (static), `/profile`, `/admin-portal`, `/admin-portal/add-member`, `/admin-portal/edit/[id]`, `/members-portal`, `/superadmin-portal`, `/superadmin-portal/add-user`, `/superadmin-portal/edit/[id]`, `/api/auth/{confirm,login,logout,signup}`.
Matches the Gate-7 close count (17→16). No fossil routes, no `/demo`, no `/api/ghl`.

---

## Section 1 — Stack Versions (EVIDENCE: `package.json`, `.nvmrc`)

- Next.js: `^16.2.1` (installed **16.2.6** — the May-2026 proxy-CVE-patched release, per `npm ls`)
- React / React-DOM: `^19.2.4`
- Tailwind: `^3.4.1` → token mechanic: **HSL vars + `tailwind.config.ts`** (NOT `@theme`/OKLCH)
- TypeScript: `^5` · Zustand: `^4.5.4` · Jest: `^30.0.5`
- Node: pinned — `.nvmrc` = `22`, `engines.node >= 22`
- Scripts: `build: next build`, `lint: eslint .` (flat config `eslint.config.mjs`), `test: jest`

## Section 2 — Kit Structure vs Handbook

- Route groups on disk: `(public)`, `(auth)`, `(account)`, `(admin)`, `(members)`, `(superadmin)` + `api/`, `providers/`, `error/` — EVIDENCE (`find src/app -maxdepth 1`). Matches handbook/registry.
- `src/proxy.ts` present; **no** `src/middleware.ts` at root (correct Next-16 convention); `src/utils/supabase/middleware.ts` is the SSR utility — EVIDENCE.
- `src/services/`: **absent** — correct per handbook doctrine (kit ships no service layer; it's reserved for project domain logic).
- `src/utils/`: `app-role.ts`, `get-user-role.ts`, `supabase/{actions,admin,client,fetchUserData,middleware,server}.ts` — EVIDENCE.
- `AppShellPage` lives at **`src/components/common/AppShellPage.tsx`** (not `layout/`) — EVIDENCE; registry :291 cites the same path. Registry and disk AGREE. (`layout/` holds the three sidebars; `ui/sheet.tsx` present.)
- **DRIFT FOUND: none in structure.** Registry v1.1 claims verified where sampled.

## Section 3 — Auth Pattern

- User read via: `useAuthStore` (Zustand, persisted `auth-store`) on the client; `protectPage([AppRole...])` in group layouts on the server — EVIDENCE: `(admin)/layout.tsx:13`.
- Role resolved via: `getUserRole(userId)` → `user_roles` table (`src/utils/get-user-role.ts`) — canonical source of truth. Enum `AppRole` in `src/utils/app-role.ts` (superadmin/admin/member).
- Auth service: **none, by design** (🛑 DO-NOT-AUTHOR).
- `user_metadata` role smells: **none** (see S0.3).
- Cookie adapter: `server.ts` uses modern `getAll`/`setAll` (Gate-8 fix intact, custom security options preserved) — EVIDENCE: `src/utils/supabase/server.ts:15-18`.
- Role *creation* flow: `addUser` writers pack `full_name` + `role` into `user_metadata`; the **Mark IV trigger consumes them** — no second-step `user_roles` update exists anymore — EVIDENCE: `(superadmin)/superadmin-portal/actions.ts:134-144` (in-code NOTE confirms).

## Section 4 — Design Reality

- Tokens: `src/app/globals.css` (plain `.css`, no Sass) + `tailwind.config.ts`; `darkMode: ["class"]` — EVIDENCE: `tailwind.config.ts:9`.
- Hardcoded numbered colors: **0 real**. The grep returns 3 hits, all FALSE POSITIVES — `translate-x-*` contains the substring `slate-` (`ui/toast.tsx:28`, `ui/dialog.tsx:41`, `ui/select.tsx:80`). ⚠️ Note for the mission template: the numbered-color grep needs a `translate-` exclusion.
- Font: `Inter` via `next/font/google` (`src/app/layout.tsx:2`).
- Theme toggle: present (`components/global/ThemeToggle.tsx`), wired into `PublicNav`, `Navbar`, `NavbarLoginReg` — every navbar surface — EVIDENCE (grep -l).
- Dark-mode real-screen pass: operator-run gate, N/A to this recon; campaign walks covered it (CLAIM from RECOVERY history).

## Section 5 — Database ⚠️ **HEADLINE DRIFT HERE**

- `supabase/setup.sql` (the shipped schema): **Mark IV smart trigger** — reads metadata `role` (defaults `'member'`), reads `'full_name'`, idempotent `ON CONFLICT DO NOTHING`, drops legacy triggers — EVIDENCE: `supabase/setup.sql:77-129`. Tables: `user_roles` (enum `app_role`), `profiles`; RLS enabled with own-row policies; service-role writes via admin client.
- 🔴 **`docs/setup.sql` is a STALE PRE-MARK-IV FOSSIL.** It still ships the dumb trigger: hardcodes `'member'` and reads `raw_user_meta_data ->> 'name'` (the wrong key) — EVIDENCE: `diff docs/setup.sql supabase/setup.sql` (trigger body differs exactly on the two Gate-10-fixed bugs). **And `docs/DATABASE_SETUP.md:7,30` directs fresh-clone operators to run `docs/setup.sql`** — meaning a new clone that follows the official setup doc reintroduces BOTH resolved KNOWN_ISSUES bugs (NULL `full_name` + silent role-drop) on a fresh database. Worse: with the dumb trigger live, the current app code **no longer does the second-step `user_roles` update**, so a UI-created admin would be silently created as member with *no* correction path. This is the #1 fix candidate.
- No `supabase/migrations/` dir — `supabase/` contains only `setup.sql`; `docs/migration_add_profiles.sql` is historical — EVIDENCE (GAP vs typical Supabase layout, but consistent with the kit's "DDL is backend state" doctrine, handbook :250).

## Section 6 — Skills / Security / Env

- Skills: **no root `.claude/skills/`** — GAP (expected location). Skills live at `agent_docs/.claude/skills/` (stark-frontend-first) and `_SKILLS/` (stark-recon v1.1, etc.). Launch CWD = repo root. Skills under `_SKILLS/` are pointed-at manually, so this works, but note the split-brain locations.
- 🔴 **Security audit DRIFT:** `docs/SECURITY.md` claims "18 moderate, ALL dev-only; `--omit=dev` → 0" — CLAIM, now FALSE. Fresh run: **`npm audit --omit=dev` → 4 HIGH severity** — `sharp@0.34.5` (< 0.35.0) via `next@16.2.6`, libvips CVE-2026-33327/-33328/-35590/-35591 (GHSA-f88m-g3jw-g9cj) — EVIDENCE: `npm ls sharp` → `next@16.2.6 └── sharp@0.34.5`. New advisory landed after Gate 9. Production dependency chain, not dev-only. Needs a disposition pass (likely a Next patch bump or `overrides`), NOT fixed during recon.
- Env vars: the 4 listed in S0.6. `.env.local` present.

## Section 8 — Demo / Tutorial Scaffolding

- Demo features: **none**. Third-party demo APIs (`jsonplaceholder`/`dummyjson`/etc.): **0 hits**. Cross-project residue (`ghl`/`gohighlevel`/`hooktest`): **0 hits** — EVIDENCE.
- API route inventory: only `api/auth/{signup,login,logout,confirm}` — all kit baseline.
- `TODO`/`FIXME`/`Acme`/`lorem ipsum` in `src/`: **0 hits** — EVIDENCE. The kit is clean.

## Section 9 — FFM Packaging & Compile Scope

- `tsconfig.json` excludes `node_modules`, **`agent_docs/**`**, **`_SKILLS/**`** — EVIDENCE. ✅
- Jest scope: `roots: ['<rootDir>/src']` → agent_docs/_SKILLS never enter test scope — EVIDENCE. ✅
- `.ts` files under `agent_docs/`: 3 template stubs (`agent_docs/.claude/skills/stark-frontend-first/templates/*.template.ts`) — safely excluded. ✅

## Section 11 — Nav & Auth-State Patterns

- `PublicNav`: 44px hamburger via `PublicMobileNav` (+ `Sheet`) below `lg`, links inline at `lg+`; `ThemeToggle` + auth-state region (`PublicNavAuthSection`) at top level, outside the menu — EVIDENCE: `PublicNav.tsx:7-10,26,32,60`. L19/L20/L21/L22 all satisfied.
- Portal shells: `AppShellPage` — rail persistent ≥ `xl` (1280), hamburger slide-over < `xl` (Gate-2 round-2 fix inherited) — EVIDENCE: `(admin)/layout.tsx:15-17` comment + registry :266.

## Section 12 — Verification Predicates (fresh, this run)

| Predicate | Result |
|---|---|
| Cold `npm run build` (`.next` wiped first) | **EXIT 0**, 16 routes |
| `npx tsc --noEmit` | **EXIT 0** |
| `npx jest` (fresh baseline) | **76/76, 10 suites** — matches Gate-9/10 close |
| Numbered-color grep | 0 real (3 `translate-` false positives) |
| Forbidden greps (`any`/`dangerously`/`user_metadata`-role) | clean (1 vendored `command.tsx` known) |

## Section 10/13 — Surprises (the gold)

1. 🔴 **Two `setup.sql` files that disagree** — `docs/setup.sql` (dumb trigger, wrong metadata key) vs `supabase/setup.sql` (Mark IV). The setup guide points at the stale one. Full detail in Section 5. *This silently re-arms both bugs the campaign's Gate 10 killed.*
2. 🔴 **Prod audit no longer clean** — 4 high (sharp/libvips) via `next@16.2.6`; `docs/SECURITY.md` disposition is stale (it was written against an 18-moderate-dev-only world).
3. 🟡 **`src/__tests__/superadmin/README.md:123-129` is stale** — its "Reality note (corrected)" still asserts the trigger hardcodes `'member'` (`supabase/setup.sql:94-96`) and that role is applied via a second-step `user_roles` update. Both statements are now false post-Mark-IV (and the cited line numbers point into the Mark IV body). Same stale claim at :241. A reader would "correct" working code from it.
4. 🟡 **Empty husk docs:** `agent_docs/CURRENT_APP/{APP_BRIEF,DATA_CONTRACT,UI_SPECS}.md` are all **0 bytes** — EVIDENCE (`wc -c`). INFERENCE: leftovers of the operator's "removed app factory docs" commit (`5490047`) — contents deleted, files kept. Cleanup candidates (or intentional placeholders for the next app? → QUESTION).
5. 🟡 **`RECOVERY.md` is stale** — still says "`main` untouched at `c3692d5`; merge pending." Disk: `main` @ `8ff8913`, 44 commits, campaign content present (Mark IV, `(account)`, `PublicMobileNav`, 16 routes). INFERENCE: operator merged + cleaned up on 2026-06-29→07-26. Also `git log -- src/components/common/AppShellPage.tsx` on `main` returns empty despite the file existing — INFERENCE: the merge/cleanup rewrote or squashed history for that path ("Starter Kit v3 — clean ancestor" commit suggests a history graft). Cosmetic, but means per-file archaeology must use the `gate-2-app-shell`/`kit-hardening` remote branches.
6. `cn()` helper present + standard (`clsx` + `twMerge`, `src/lib/utils.ts`) — EVIDENCE. ✅
7. Mission-template improvement: numbered-color grep needs `grep -v "translate-"` (see Section 4).

## Recommendation to Architect

**Author against these verified facts (no re-verification needed):** Next 16.2.6 / React 19.2.4 / TS 5 / Tailwind 3.4 (HSL tokens, class dark-mode) / Zustand 4.5 / Jest 30 / Node 22. 16 routes; groups `(public)(auth)(account)(admin)(members)(superadmin)`; auth complete (store + `protectPage` + `getUserRole` on `user_roles`); `AppShellPage` at `components/common/`; env = the 4 publishable/secret-era names; triad green (build 0 / tsc 0 / 76/76); zero demo residue.

**Fix-pass candidates (NOT fixed during recon — each needs authorization):**
1. **`docs/setup.sql` → replace with (or symlink to) the Mark IV content, and/or point `docs/DATABASE_SETUP.md` at `supabase/setup.sql`.** Highest value: prevents fresh clones from resurrecting the role-drop bug with no second-step safety net.
2. **sharp/libvips high vulns:** check for a Next patch release bumping sharp ≥ 0.35.0 (or add an `overrides` entry); then rewrite `docs/SECURITY.md`'s disposition.
3. **Stale superadmin test README** (:123-129, :241) — rewrite the "Reality note" to Mark IV reality.
4. **Empty `CURRENT_APP` docs** — delete the 0-byte husks or repopulate (QUESTION for operator intent).
5. **`RECOVERY.md`** — refresh to post-merge reality (bookkeeping, not source).

**Handbook claims that proved FALSE:** none in `STARTER_KIT_HANDBOOK_v1.1`/`COMPONENT_REGISTRY_v1.1` where sampled — the Gate-10 doc harvest held. The false claims live in the *satellite* docs: `docs/DATABASE_SETUP.md`+`docs/setup.sql`, `docs/SECURITY.md`, `src/__tests__/superadmin/README.md`, `RECOVERY.md`.

---

*Recon left the repo byte-for-byte unchanged apart from this report file. Zero git operations run.*
