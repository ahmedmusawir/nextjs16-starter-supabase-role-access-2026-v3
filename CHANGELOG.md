# Changelog

> Documentation and playbook changes, newest first. `[CC]` = Claude Code, `[TS]` = Tony Stark
> manual edit. Per-release application changelogs live in `docs/change_logs/`.

## 2026-07-26 21:15 UTC — [CC] Claude Code — audit zero + README

- **Updated:** `package.json` / `package-lock.json` — `next ^16.2.12`, `postcss ^8.5.23`
  (devDependency and override in lockstep), `brace-expansion ^5.0.8`, `js-yaml ^5.2.2`.
  **`npm audit` and `npm audit --omit=dev` both now report 0 vulnerabilities.** The Next
  patch bump clears GHSA-955p-x3mx-jcvp (unauthenticated disclosure of internal Server
  Function endpoints).
- **Rewrote:** `README.md` — 7-line stub → full product README: badges, "Why This Exists"
  (receptionist / vault-guard doctrine), 2×2 screenshot grid, "What's Inside", docs index,
  quickstart, verify-the-build block. Every figure read from disk at write time.
- **Updated:** `docs/SECURITY.md` — audit table now reflects the cleared state.
- **Reason:** operator-approved final phase; the README asserts a clean audit, so the audit
  had to actually be clean first.
- **Note:** the requested Playwright E2E badge was **not** written — no config, no specs
  exist. Disclosed in the README's Dependency notes instead of claimed in a badge.

## 2026-07-26 20:50 UTC — [CC] Claude Code — sharp override + security disposition

- **Updated:** `package.json` — added `"sharp": "^0.35.3"` to `overrides` (operator-approved).
  Resolves 4 high libvips advisories that no Next.js release fixes: every stable Next pins
  `sharp ^0.34.5`, which cannot reach the patched 0.35.x line. Verified `sharp@0.35.3`
  installed; triad green (build EXIT 0 / 16 routes, tsc 0, jest 76/76).
- **Rewrote:** `docs/SECURITY.md` — the Gate 9 disposition ("18 moderate, ALL dev-only,
  `--omit=dev` → 0") was factually false as of today. Replaced with the verified current
  state (4 high / 3 prod), the sharp fix rationale, a residual-risk note on overriding a
  native transitive dep, and a **tested** path to `found 0 vulnerabilities`.
- **Reason:** recon red finding #2, plus the discovery that clearing sharp unmasked four
  further high advisories the aggregate count had been hiding.
- **NOT changed (awaiting approval):** the `next` / `postcss` / `brace-expansion` / `js-yaml`
  bumps that would reach audit-zero.

## 2026-07-26 20:30 UTC — [CC] Claude Code — Phase 2 Doc Fix Pass

- **Deleted:** `docs/setup.sql` — pre-Mark-IV fossil (hardcoded `'member'`, read the wrong
  metadata key). `supabase/setup.sql` is now the single schema source of truth.
- **Updated:** `docs/DATABASE_SETUP.md` — re-pointed at `supabase/setup.sql`; replaced the
  Step 4 inline trigger (a third stale copy) with the Mark IV body; added an
  "illustrative, the .sql file wins" banner; corrected the Step 5 default-role prose.
- **Updated:** `src/__tests__/superadmin/README.md` — "Reality note" and summary table
  rewritten to Mark IV reality; stale citations `supabase/setup.sql:94-96` → `:91-123`.
- **Updated:** `docs/TESTING.md` — inventory was "4 suites / 17 tests", actual is 10 / 76.
- **Updated:** `docs/AUTHORIZATION.md` — the trigger no longer "always inserts `member`";
  it reads the metadata role and falls back. Added a note that this is not a
  `user_metadata` authorization pathway.
- **Updated:** `docs/AUTHENTICATION.md` — clarified why public signup always lands as
  `member` (no `role` key sent).
- **Updated:** `docs/ARCHITECTURE.md` — added the `(account)` protected route group
  (Gate 7); corrected the trigger bullet.
- **Reason:** recon red finding #1 plus the general staleness sweep it prompted. Fresh
  clones following `DATABASE_SETUP.md` were provisioning a database that re-armed both
  Gate-10-fixed bugs, with no second-step safety net in the app.
- **NOT changed (awaiting approval):** `docs/SECURITY.md` disposition and any
  `package.json` override for the sharp/libvips advisories.

## 2026-07-26 20:05 UTC — [CC] Claude Code

- **Created:** `agent_docs/RESPONSES/` (3 logs) — retro-logged the session's three artifacts
  (recon headline, CLAUDE.md fix report, Docs Truth Pass plan) per the Response Logging
  Protocol; each is marked as retro-logged.
- **Updated:** `RECOVERY.md` — refreshed from the stale "campaign complete, merge pending at
  `c3692d5`" state to post-merge reality (`main` @ `8ff8913`); recorded the approved-but-
  unexecuted Docs Truth Pass as Pending, rewrote Next Step, added the session-path and
  response-logging standing rules.
- **Updated:** `agent_docs/SESSIONS/session_2026-07-26.md` — full session record + lessons.
- **Reason:** artifacts had been printed on screen without the mandatory `RESPONSES/` write;
  operator issued the recovery cue and asked for a clean handoff so the Docs Truth Pass can
  be executed together next session.

## 2026-07-26 19:55 UTC — [CC] Claude Code

- **Updated:** `CLAUDE.md` — session-file location corrected from the repo root to
  `agent_docs/SESSIONS/` in three places: the Session File Rules table, the Step 0 lookup
  path, and the Session File Template header. Clarified that `RECOVERY.md` is the only
  state file that stays at the repo root.
- **Moved:** `session_2026-06-09.md`, `session_2026-06-25.md`, `session_2026-07-26.md` —
  repo root → `agent_docs/SESSIONS/` (joining the five existing March/April logs).
- **Reason:** the Session File Rules table said "Keep in project root," which contradicted
  the actual convention (all agent-generated docs are filed under `agent_docs/`). The stale
  line caused today's session log to be created at the root. Operator flagged it as a
  deal breaker.
