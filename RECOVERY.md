# Recovery State

## Project
Starter Kit v3 build — hardening a fresh v2 clone via the `starter-kit-cleaner` skill.

## Last action
2026-06-29 — **★ GATE 10 CLOSED — KIT PERFECTION CAMPAIGN COMPLETE (all 10 gates closed). ★** FINAL gate. Phase B docs harvest done: COMPONENT_REGISTRY v1.1 (drift fixed, AppShellPage/Sheet real), stale-debt purged (`superadmin-add-user`, `ThemeToggler`→`ThemeToggle`), STARTER_KIT_HANDBOOK v1.0→v1.1 (LESSONS_BIN HARVESTED), AUTH_MANUAL v1.2, UI-UX v1_3, APP_ARCHITECTURE v1.2, FRONTEND_FIRST v1.1.2; teaching examples re-pointed to live files; stale test count (81→76) + `next/head`→App-Router `metadata` fixed. Verified: cold build EXIT 0, 76/76, re-greps clean. Phase B commits `6163c17`/`572d447`/`8d1a418`/`4dd8151`/`1c0881c` + the final two-fix commit (81→76 + next/head) + this close-log — **all committed AND pushed by the operator (2026-06-29)** on branch `gate-2-app-shell`. Working tree clean. `main` untouched at `c3692d5` (merge/tag pending operator). BACKLOG (none blocking): doctrine-sync to MissionControl/CP-v1 (`DOCTRINE_SYNC_MANIFEST`); canonical doctrine repo + skill-management design sessions.

(Prior) 2026-06-28 — **GATE 10 PHASE A CLOSED.** Upgraded `setup.sql` trigger to **Mark IV** (`71ad14e`): honors metadata role, reads `full_name`, idempotent; no writer changes. **RESOLVES both KNOWN_ISSUES bugs** (no longer deferred — FIXED in shipped schema). **LIVE PROOF** on the CP v1 Supabase: schema matches; live trigger was **already Mark IV** (dumb trigger only ever existed in the kit's old `setup.sql`, never live); create-then-delete test → `full_name='Mark IV Test'` (not null) + `role='admin'` (not downgraded) → both fixed live; test user deleted clean, DB back to 4 / zero residue. Resolves the inventory's headline conflict (setup.sql now matches handbook + migration + live DB). NOTE: CP v1 + MissionControl share this Supabase — both already on Mark IV; the fix protects FUTURE clones. Repo: cold build EXIT 0, 76/76, `main` untouched at `c3692d5`.

(Prior) 2026-06-26 — **GATE 9 CLOSED** (Tier E hygiene, no behavior change → no walk). 5 commits: Node pinned `.nvmrc=22` + `engines >=22` (env v22.14.0); Stripe KEPT + README reserve note; role-in-metadata NOTE at both writers → `KNOWN_ISSUES`; 18 audit vulns ALL dev-only (`--omit=dev`=0) documented in `docs/SECURITY.md`, NOT force-fixed; **de-flaked `AddMemberForm` test** (pending mock promise leaked a `router.push` into a later test — fixed with waitFor drains, **proven 3/3 deterministic**). Verified: tsc 0, cold build EXIT 0, **76/76 ×3**. Commits `ade9904`/`c182108`/`5a9d8c6`/`7c75c46`/`f30bd76`. `main` untouched. **Gate-4 flaky backlog RESOLVED — suite fully deterministic.**

(Prior) 2026-06-26 — **GATE 8 CLOSED** (operator AUTH-WALK passed — all 5: fresh login, nav-persist, refresh held, logout cleared+bounced, role resolved). **KIP-1 resolved** (parked since Gate 0): `server.ts` cookie adapter `get/set/remove` → `getAll/setAll` (matches `middleware.ts`); `(await cookies()) as any` removed via a real typed annotation (NOT a moved cast); custom security options preserved (`secure`/`sameSite:lax`/`httpOnly:false`). Verified: tsc 0, cold build EXIT 0, 76/76 (flaky `AddMemberForm` aside), real-app `as any` **2→1** (only vendored `command.tsx`). 1 commit (`606d8f6`). `main` untouched at `c3692d5`. **🔴 MILESTONE: all auth-adjacent gates (5–8) COMPLETE — red zone cleared.**

(Prior) 2026-06-26 — **GATE 7 CLOSED** (operator walk passed). Consolidated profile-implemented-twice into ONE shared role-aware `components/profile/ProfileForm.tsx` at a single `/profile` (new `(account)` group, gated `[ADMIN, MEMBER]`, sidebar-less). **Killed a live bug** (member's shared-Navbar Profile link bounced to `/auth`). Retired nested `/members-portal/profile` (removed + Sidebar repointed). Hid Profile from superadmins (render-time `isSuperadmin` gate — console-only doctrine extends to self-service). Verified: cold build EXIT 0, routes **17→16**, tsc 0, **76/76**. 3 commits (`e05e3ac`/`6d72f53`/`74894aa`). `main` untouched at `c3692d5`.

(Prior) 2026-06-26 — **GATE 6 CLOSED.** Deleted the dead `superadmin-add-user` fossil route + its 5 dead-route tests (zero live callers; `AddUserForm` uses the `addUser` server action). Preserved the route's correct `user_roles` 2nd-step pattern in `KNOWN_ISSUES.md` (lower-role reference; superadmin = **console-only** doctrine). Verified: cold build EXIT 0, routes **18→17**, tsc 0 (after clearing a stale `.next` false-failure), **76/76 (10 suites)**, no auth-walk. 2 commits (`e7feea2` preserve · `5035187` delete). `main` untouched at `c3692d5`. 5 stale docs deferred to Gate 10 (listed in `LESSONS_BIN.md`).

(Prior) 2026-06-26 — **GATE 5 CLOSED — RESOLVED AS DOCUMENTED** (not fixed; deferred to real project — trigger is backend state, portals are proof-of-concept). Verified BOTH bugs real: (1) `profiles.full_name` NULL at creation (trigger reads `'name'`, all writers write `'full_name'`); (2) 🔴 superadmin role-drop (trigger hard-codes `'member'`, live `addUser` role silently discarded). Shipped `KNOWN_ISSUES.md` + killed the lying "smart trigger" comment in live `actions.ts`. Doc+comment only, no logic change. 1 commit `bff0ad7`. Also started `LESSONS_BIN.md` (handbook-rewrite lessons, seeded with 5). `main` untouched at `c3692d5`.

(Prior) 2026-06-26 — **GATE 4 CLOSED** (operator walk passed: touch ≥44px mobile, desktop density unchanged, public nav both auth states). Doctrine compliance sweep + public-nav menu: (1) Pre-Write JSDoc on 17 factory files (vendored `ui/` clean); (2) touch-target floor via a **registered real `coarse` Tailwind variant** — caught + fixed a phantom `pointer-coarse:` (not a TW3.4 built-in) in verify; touch-only so desktop density intact; (3) `PublicMobileNav` (hamburger + Sheet, `lg` breakpoint) + `PublicNav` wired `hidden lg:flex`/`lg:hidden`, Login/auth stay top-level. 4 commits (history kept, not squashed): `ecb33bc` · `d8d1991` · `1e3a462` · `a228086`. Verified: cold build EXIT 0, tsc 0, 81/81 (1 pre-existing flaky test, NOT a regression). `main` untouched at `c3692d5`.

(Prior) 2026-06-26 — GATE 3 CLOSED: AppShellPage rolled to members + superadmin; mobile-nav spine COMPLETE across the kit. `f5611d9`/`b4dcbcf`/`24972ff`.

(Prior) 2026-06-26 — GATE 2 CLOSED: built `Sheet` + `AppShellPage` (blessed reusable, 4 CP scars), adopted in `(admin)`; round-2 `lg`→`xl` (1280). 4 commits (`91efd97`/`b85bf58`/`d13a797`/`d7dec9d`).

(Prior) 2026-06-26 — GATE 1 COMPLETE: low-risk cleanup sweep (orphans + empty dirs, README fix, tsconfig exclude), verified green.

(Prior) 2026-06-25 — Proxy convention + security audit CLOSED; recon report written at `agent_docs/RECON/RECON_starter-kit-v3_kit-hardening_2026-06-26.md` (this is the campaign's ground truth).

(Prior) Phase 8 COMPLETE — v3 verified clean. All five grep gates ZERO. Superadmin intact. Verification triad from cold: tsc EXIT 0; npm test 11 suites / 81/81; cold `npm run build` with NO `.env.local` clean.

## Pending
**None — campaign complete, all committed + pushed (2026-06-29).** Working tree clean. Branch `gate-2-app-shell` is the merge/tag candidate; `main` still at `c3692d5` until the operator merges/tags.

## Current session
2026-06-25 — KIT hardening underway (v3 is now the generic base, not "spawned off superadmin").
- STEP 0 COMPLETE (commit `c43b70e`): ESLint setup ported from DockBloxx → Next 16 flat config (`eslint.config.mjs`), `scripts/lint-check.sh`, `lint` script `next lint`→`eslint .`, deps `eslint@9`+`eslint-config-next@16`.
- STEP 2 COMPLETE (commit `95e22d3`): all 7 errors fixed, unused-vars walked, demo GET fossil + dead imports/test-vars removed, Logout swallowed-error bug fixed. Superadmin kept as a normal tier.
- Collateral: STEP 0 eslint install skewed the jest tree → fixed via `overrides: jest-mock 30.4.1`. Renamed lint script → `scripts/run_lint.sh`.
- Stragglers cleaned (commit `c3692d5`): `req`→`_req`, `actionTypes` disabled; added `docs/LINTING.md`. **LINT KIT DONE.**
- **Kit lands green:** tsc EXIT 0, jest 81/81, `npm run lint` exit 0 — 0 errors, **59 warnings-only** (0 unused-vars).
- Lint commits: `c43b70e` setup · `95e22d3` triage · `c3692d5` stragglers+notes.
- KIP-1 parked: modernize `supabase/server.ts` cookies to `getAll/setAll` (drops the `any`) — own task.
- **Proxy item CLOSED (read-only audit, no changes):** already on `src/proxy.ts` (new Next 16 convention, exports `proxy`); `src/utils/supabase/middleware.ts` is the SSR utility (keeps its name). Installed Next **16.2.6** = patched release for the May 2026 middleware/proxy CVEs (GHSA-267c/-26hh/-36qx/-492v). No `proxyDir` needed; kit doesn't use proxy for authz (uses `protectPage` in layouts). Nothing to migrate/upgrade.

### 2026-06-26 — Kit Perfection campaign (branch `kit-hardening`, main untouched)
Ground truth = recon report `agent_docs/RECON/RECON_starter-kit-v3_kit-hardening_2026-06-26.md`.
- Pre-step `c3b46f8`: doctrine reshuffle + recon report + `_SKILLS/` working-tree save (pristine tree).
- **GATE 1 COMPLETE** — 3 commits: `ccbd576` delete 3 orphan components (DashboardCard/MemberEventList/AdminBookingList — 0 importers/0 tests, empty dirs removed; zeroed the kit's numbered-color count) · `4c1b7bd` correct false "smart trigger reads role from user_metadata" claim in superadmin test README (doc-only; reality: trigger hardcodes 'member', role set via 2nd-step user_roles update) · `c36e806` tsconfig exclude `_SKILLS/**`.
- Verified: true cold build EXIT 0 (`/` ○ static, 18 routes) · 81/81 tests · numbered-color grep = 0 (only allowed `dialog.tsx:24 bg-black/80` modal scrim).
- Flags: `.env.local` now present in repo root (appeared post-recon — recon/prior close-outs assumed no-env tree); `_SKILLS/` (41 files) committed in pre-step to reach pristine tree (split/gitignore on branch if undesired).
- **GATE 2 COMPLETE** — 3 commits: `91efd97` add `Sheet` slide-over primitive (shadcn canonical on Radix dialog; native outside-tap/Esc) · `b85bf58` add `AppShellPage` (registry API verbatim `{sidebar,children,mobileTitle?,mobileTopBarRight?}`; persist ≥`lg`, hamburger slide-over <`lg`; 44px tap; reuses `--nav-bg/--nav-foreground`; 4 CP scars: close-on-nav, passable `close` for terminal actions, ~25rem capped to 85vw, native dismiss) · `d13a797` refactor `(admin)/layout.tsx` onto AppShellPage (dropped debug `border-4`→`border-r border-border`; Navbar + protectPage unchanged).
- Verified: cold build EXIT 0 · 81/81 tests · tsc EXIT 0. **`(members)`/`(superadmin)` deliberately UNTOUCHED** — they still carry the old `hidden md:block` rail; the AppShellPage rollout to them is Gate 3.
- **Round-2 fix `d7dec9d`:** breakpoint `lg`→`xl` in AppShellPage (rail persists ≥`xl` 1280; hamburger + drawer <`xl`) + admin card grid `grid-cols-1 md:2 lg:3` → `grid-cols-1 xl:grid-cols-2`. Operator-diagnosed: rail persisted too early (1024) → user-card Edit+Delete overflow. Fixed in the blessed primitive so Gate 3 inherits it. NOTE: superadmin's `SuperadminPortalPageContent.tsx` carries the same `md:2/lg:3` card grid → needs the same `xl` treatment in Gate 3.

## Next step — WHEN WE RETURN, START HERE
**★ CAMPAIGN COMPLETE — all 10 gates closed, committed + pushed. ★** Nothing in flight; working tree clean. Pick up from the BACKLOG (none blocking), operator chooses order:
1. **Merge/tag decision** — `gate-2-app-shell` → `main` (e.g. tag `v3`). `main` is still at `c3692d5`.
2. **Doctrine-sync** to MissionControl / CP-v1 (see `DOCTRINE_SYNC_MANIFEST`) — propagate the hardened docs (handbook v1.1, registry v1.1, AUTH_MANUAL v1.2, UI-UX v1_3, APP_ARCHITECTURE v1.2, FRONTEND_FIRST v1.1.2) to the live projects.
3. **Canonical doctrine repo** + skill-management design sessions.

**Standing rule (active):** the operator owns git — I edit files + verify, then hand over commands. I do NOT run git unless explicitly told.

## Invariants (do not violate)
- KEEP superadmin (three-tier RBAC).
- NEUTRAL design system — no brand colors / no project residue.
- Replay documented fixes only (see starter-kit-cleaner/references/DEFECT_LEDGER.md); new ideas are KIPs.
