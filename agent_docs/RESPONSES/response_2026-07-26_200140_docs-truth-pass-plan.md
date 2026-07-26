# Response Log — PLAN: Docs Truth Pass (setup.sql fossil + DATABASE_SETUP + README)

**Timestamp:** 2026-07-26 20:01
**Artifact type:** Implementation plan — APPROVED, execution DEFERRED to next session
**Plan file (harness):** `/home/moose/.claude/plans/purrfect-swinging-breeze.md`
**Status:** approved 2026-07-26 as *bookkeeping-only for this turn*; the fix itself is NOT yet executed.

---

# Docs Truth Pass — `setup.sql` fossil + DATABASE_SETUP + README

> **THIS TURN: bookkeeping only.** Write the response logs, session file, and RECOVERY.md
> so the execution below can be run cleanly in the next session. **Do NOT execute the fix
> now** — operator's call (2026-07-26 20:0x).

## Context

The recon (red finding #1) caught a live footgun. `supabase/setup.sql` ships the **Mark IV
smart trigger** — it reads the metadata `role` (honoring a requested admin) and reads the
`'full_name'` key the app writers actually write. But `docs/setup.sql` is a **pre-Mark-IV
fossil**: it hardcodes `user_roles.role = 'member'` and reads `raw_user_meta_data ->> 'name'`
(a key nothing writes).

`docs/DATABASE_SETUP.md:7,30` — the official setup guide — points fresh-clone operators at
**the fossil**. Anyone following the documented path provisions a database that re-arms both
bugs Gate 10 Phase A killed:

- `profiles.full_name` lands NULL at creation.
- A UI-created "admin" is silently created as a **member** — and because the app no longer
  does the old second-step `user_roles` update (`(superadmin)/superadmin-portal/actions.ts:134-144`
  now relies on the trigger), there is **no correction path**. Silent privilege downgrade.

Root cause: Gate 10 Phase A updated `supabase/setup.sql` and `docs/migration_add_profiles.sql`
but missed the two `docs/` copies. Verified this run: the migration file is already Mark IV
(lines 85-129), so the live-DB upgrade path is safe — only the fresh-provision path is broken.

Scope was widened by the operator to include the README, which is a 7-line stub on an
otherwise fully-hardened kit.

## Findings that shape the fix

- `docs/setup.sql` (129 lines) and `supabase/setup.sql` (147 lines) are the **same artifact**,
  byte-identical except the STEP 4 trigger block. A synced duplicate re-drifts — it just did.
- `docs/DATABASE_SETUP.md` Step 4 (lines 104-130) embeds the dumb trigger inline as a **third
  copy**, with matching stale prose at :15, :102, :138.
- `README.md` is 7 lines: a title, a one-line description, and a Stripe reserve note. It does
  not mention setup, env vars, the three-tier RBAC model, scripts, or the docs tree.
- Docs already pointing at the correct file (leave alone): handbook :172, :250;
  `docs/MANUAL_TESTING.md:8` (references the migration — correct).

## Execution plan (NEXT SESSION)

**1. Delete `docs/setup.sql`.**
Single source of truth becomes `supabase/setup.sql`. Overwriting the duplicate with Mark IV
content would fix today's symptom and leave the drift mechanism intact — two copies of the
same DDL is exactly what produced this bug. Deleting the copy makes the failure impossible
rather than merely corrected.

**2. Rewrite `docs/DATABASE_SETUP.md`:**
- `:7` and `:30` → point at `supabase/setup.sql`.
- `:23-25` "already have data?" callout → keep (still correct), re-point the filename mention.
- Step 4 inline SQL (`:104-130`) → replace with the Mark IV function body, verbatim from
  `supabase/setup.sql:92-129`, including the `DECLARE assigned_role`, the metadata-role
  branch, both `ON CONFLICT DO NOTHING` clauses, and the two `DROP TRIGGER IF EXISTS` lines.
- Add a banner under Step 4: this block is **illustrative**; the runnable source of truth is
  `supabase/setup.sql`. (Keeps the teaching structure without letting the doc masquerade as
  the artifact.)
- Fix stale prose: `:15` and `:102` ("default `member`") → describe metadata-role honoring;
  `:138` ("Every user starts as `member`") → true only when no metadata role is supplied,
  and the first superadmin is still a manual console promotion.

**3. Write a real `README.md`.** Content drawn from verified recon facts only:
stack + exact versions (Next 16.2.6 / React 19.2.4 / TS 5 / Tailwind 3.4 HSL tokens /
Zustand 4.5 / Jest 30 / Node 22); quick start (clone → `.env.local` from the example's 4
vars → run `supabase/setup.sql` → promote first superadmin → `npm run dev`); the three-tier
RBAC model (`user_roles` is authority, never `user_metadata`; superadmin is console-only);
the 16-route surface map; scripts (`dev`/`build`/`test`/`lint`); a docs index pointing at
`docs/` and `agent_docs/STARTER_KIT/`; keep the existing Stripe reserve note verbatim.

**4. `src/__tests__/superadmin/README.md:123-129, :241`** — same trigger lie-class (recon
yellow #3). Its "Reality note (corrected)" still claims the trigger hardcodes `'member'` and
that role is applied via a second-step `user_roles` update; both false post-Mark-IV, and the
cited line numbers now point into the Mark IV body. Severable if you want the pass kept to
`docs/` + README only.

**5. `CHANGELOG.md`** — add the `[CC]` entry for the above (Changelog Protocol).

## Files

- **DELETE:** `docs/setup.sql`
- **MODIFY:** `docs/DATABASE_SETUP.md`, `README.md`, `CHANGELOG.md`,
  `src/__tests__/superadmin/README.md` (item 4)
- **NOT TOUCHED:** `supabase/setup.sql` (already correct — it is the reference source),
  `docs/migration_add_profiles.sql` (already Mark IV), the handbook (already correct),
  `docs/MANUAL_TESTING.md`, all application code. No SQL is run against any database.

## Verification

- `grep -rn "docs/setup.sql" .` (excluding `docs/change_logs/` historical entries and the
  dated recon report) → zero live references.
- Spot-check the doc's Step 4 trigger body against `supabase/setup.sql` — must match.
- Every factual claim in the new README re-checked against disk before it ships (versions,
  route count, env var names, script names) — no claim written from memory.
- Triad from cold: `rm -rf .next && npm run build` (expect EXIT 0, 16 routes),
  `npx tsc --noEmit` (expect 0), `npx jest` (expect 76/76). SQL and Markdown are outside
  compile and test scope, so this is a no-regression confirmation, not a proof of the fix.
- The real proof is operator-run and out of scope: provision a scratch Supabase from
  `supabase/setup.sql`, create a user with `{ role: 'admin', full_name: 'X' }`, confirm
  `user_roles.role = 'admin'` and `profiles.full_name = 'X'`. Gate 10 Phase A already ran
  exactly this against the live CP-v1 instance on 2026-06-28.

## Risk

Low. Documentation-only; no application code, no schema applied anywhere. The deletion is
the sole irreversible step and `git checkout docs/setup.sql` restores it. Per standing rule,
I run no git commands — I hand over the staging list.
