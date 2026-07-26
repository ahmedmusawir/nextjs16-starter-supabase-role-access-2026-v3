# Response Log — PHASE 2: Doc Fix Pass — EXECUTION COMPLETE

**Timestamp:** 2026-07-26 20:30
**Artifact type:** Execution report
**Authority:** operator's "PHASE 2 APPROVED — DOC FIX PASS" message
**Source of truth:** `agent_docs/RECON/RECON_starter-kit-v3_post-campaign_2026-07-26.md`

---

## Triad — all green

| Check | Result |
|---|---|
| `rm -rf .next && npm run build` | **EXIT 0**, 16 routes (unchanged) |
| `npx tsc --noEmit` | **EXIT 0** |
| `npx jest` | **76/76, 10 suites** |

No application code was touched, so this is a no-regression confirmation.

---

## 1. 🔴 SETUP.SQL FOSSIL — FIXED

Took the single-source path you preferred: **`docs/setup.sql` DELETED.** One schema file
(`supabase/setup.sql`), one truth. Syncing a duplicate would have left the drift mechanism
that caused this bug intact.

`docs/DATABASE_SETUP.md` rewritten in four places:
- `:7` → points at `supabase/setup.sql`, plus a new banner: the SQL blocks in the doc are
  **illustrative**, and if they ever disagree with the `.sql` file, the `.sql` file wins.
- `:23` → the "already have data?" callout now names `supabase/setup.sql`.
- `:30` → "Open `supabase/setup.sql` from this repo".
- **Step 4 (was `:104-130`) — the third stale copy.** The inline SQL still carried the dumb
  trigger. Replaced with the Mark IV body verbatim from `supabase/setup.sql:91-123`, plus
  prose describing the actual behavior (reads `role`, falls back to `member`, reads
  `full_name`, idempotent `ON CONFLICT`) and an explicit "there is no second-step
  `user_roles` update" note.
- Step 5 prose: "Every user starts as `member`" → accurate split between self-signup
  (always member) and portal-created users (get the selected role), with the console-only
  superadmin doctrine preserved.

**Grep verification:** zero live references to `docs/setup.sql` remain. The only surviving
mentions are historical records that *should* keep them — `docs/change_logs/v0.2.0`, the
dated recon report, session/plan logs.

**One claim I added and then verified rather than assumed:** the new Step 4 note says a
self-signup lands as `member` because it sends no `role` key. Confirmed against
`src/app/api/auth/signup/route.ts` — it passes `full_name` only.

## 2. 🔴 SHARP/LIBVIPS — REPORTED ONLY, NO CHANGES MADE

**No Next patch fixes this.** Every stable release through `latest` pins the vulnerable range:

| Next version | `optionalDependencies.sharp` |
|---|---|
| 16.2.6 (installed) | `^0.34.5` |
| 16.2.7 / 16.2.9 | `^0.34.5` |
| **16.2.12 (`latest`)** | `^0.34.5` |
| 16.3.0-canary.97 | **`^0.35.3`** ← fix is in 16.3, unreleased |

`^0.34.5` resolves `>=0.34.5 <0.35.0`, so it can never reach the patched line on its own.
Patched sharp is **0.35.0+**; current is **0.35.3**.

**Proposed override (NOT applied — awaiting your approval):**

```json
"overrides": {
  "sharp": "^0.35.3"
}
```

Note the repo already uses `overrides` (for `jest-mock`), so this is an established pattern
here, not a new mechanism.

**Two things worth weighing before you decide:**
1. `sharp` is an **optionalDependency** used for `next/image` optimization. The kit has
   `images.remotePatterns` configured for Cloudinary in `next.config.js`, but **no `<Image>`
   or `next/image` usage exists in `src/`** — so nothing currently exercises sharp. Real
   exposure today is low; it rises the moment someone adds an image.
2. Overriding a transitive optional dep across a minor boundary (0.34 → 0.35) carries a
   nonzero risk of a native-binary mismatch with Next's image pipeline. It should be smoke-
   tested with an actual optimized image, which the kit can't currently do.

Draft replacement text for `docs/SECURITY.md` is in the chat report — **not written to the
file**, since you asked me to draft against whichever path you approve. ⚠️ Note that the
file currently asserts `npm audit --omit=dev → found 0 vulnerabilities`, which is **false as
of today** (4 high). That stale claim is still sitting in the repo pending your decision.

## 3. 🟡 STALE TEST README — FIXED

`src/__tests__/superadmin/README.md`:
- The "Reality note" (`:123`) is rewritten to Mark IV reality: the trigger reads **both**
  metadata keys, applies the role at creation, defaults to `member` only when absent, and
  **no second-step `user_roles` update exists**. Reframed the assertion from "vestigial" to
  what it now is — a real regression guard, since dropping either key silently degrades user
  creation.
- Added the security framing so nobody reads this as a `user_metadata` authz pathway:
  `SECURITY DEFINER`, creation-time only, service-role client is the sole setter.
- **Line citations corrected:** `supabase/setup.sql:94-96` → `:91-123`. Verified by reading
  both endpoints (`91` = `CREATE OR REPLACE FUNCTION`, `123` = `$$;`). Same fix applied to
  the Critical Assertions Summary table at `:241`.

## 4. HUSKS & BOOKKEEPING — BLOCKED ON YOU

Your message left both brackets unfilled: `[DELETE / KEEP husks]`, `[DELETE / REFRESH
RECOVERY.md]`. I did not guess. Current state:
- **Husks:** already gone from the working tree (not by me — flagged in the 20:10 session
  entry). Tracked in HEAD as 0-byte blobs, so it's an unstaged deletion. Staging it =
  DELETE; `git checkout -- agent_docs/CURRENT_APP/` = KEEP.
- **RECOVERY.md:** already REFRESHED earlier this session. If you meant DELETE, say so —
  but doctrine requires it at the repo root, so I'd push back.

## 5. GENERAL /docs PASS — 4 STALE FACTS FIXED

Voice and structure untouched throughout; Receptionist / Vault Guard doctrine language
preserved verbatim.

| File | Fix |
|---|---|
| `docs/TESTING.md:171` | "4 test suites / 17 passing tests" → **10 suites / 76 tests**, with the actual suite list. Badly stale. |
| `docs/AUTHORIZATION.md:77` | "trigger automatically inserts a `member` role row" stated *generally* — false post-Mark-IV. Now: reads metadata `role`, falls back to `member`; public signup never sends one; the portal's admin path uses the same trigger; no second-step update. Added a note that this is not a `user_metadata` authz pathway. |
| `docs/AUTHENTICATION.md:81` | Was accurate *in its self-signup context*, so only clarified — added "the signup route sends no `role` key, so public signups always land as `member`". Deliberately minimal. |
| `docs/ARCHITECTURE.md:153` | Protected route groups omitted **`(account)`** (added Gate 7). Verified `protectPage([ADMIN, MEMBER])` in `(account)/layout.tsx` before adding. Also line 123 "Database triggers for default membership" → accurate description of role assignment at creation. |

**Verified clean, no changes needed:** `docs/LINTING.md`, `docs/MANUAL_TESTING.md` (`:72`
already Mark-IV-aware — "confirms the smart trigger read the role from metadata correctly").
All **13** file paths named across `docs/*.md` exist on disk. No Vitest references, no stale
version numbers, no `getStaticProps`, no dead `superadmin-add-user` references outside the
two docs that correctly record its Gate-6 removal.
