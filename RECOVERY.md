# Recovery State

## Project
Starter Kit v3 build — hardening a fresh v2 clone via the `starter-kit-cleaner` skill.

## Last action
2026-06-26 — **GATE 1 COMPLETE** (Kit Perfection campaign, branch `kit-hardening`; `main` untouched at `c3692d5`). Low-risk cleanup sweep verified green: true cold build EXIT 0, 81/81 tests, numbered-color grep = 0.

(Prior) 2026-06-25 — Proxy convention + security audit CLOSED; recon report written at `agent_docs/RECON/RECON_starter-kit-v3_kit-hardening_2026-06-26.md` (this is the campaign's ground truth).

(Prior) Phase 8 COMPLETE — v3 verified clean. All five grep gates ZERO. Superadmin intact. Verification triad from cold: tsc EXIT 0; npm test 11 suites / 81/81; cold `npm run build` with NO `.env.local` clean.

## Pending
None.

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

## Next step
**Awaiting Gate 2 instructions** (operator verifies Gate 1 first). Open recon-sourced candidates for later gates: the mobile-menu / Gate-M fix (Sheet vs port AppShellPage; wide 25rem rail → slide-over below `lg`); metadata key mismatch (`name` vs `full_name` at user creation — possible real bug); dual superadmin user-creation paths (API route vs server action); Stripe installed-but-unused; 18 moderate npm-audit vulns. KIP-1 (server.ts `getAll/setAll`) still parked.

## Invariants (do not violate)
- KEEP superadmin (three-tier RBAC).
- NEUTRAL design system — no brand colors / no project residue.
- Replay documented fixes only (see starter-kit-cleaner/references/DEFECT_LEDGER.md); new ideas are KIPs.
