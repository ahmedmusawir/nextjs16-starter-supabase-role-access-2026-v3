# Lessons Bin — for the Gate-10 Handbook Rewrite

> **✅ HARVESTED 2026-06-28 → `agent_docs/STARTER_KIT/STARTER_KIT_HANDBOOK_v1.1.md`
> (Gate 10 Phase B, COMMIT 3).** Every entry below (Gates 1–8) was integrated into a
> handbook section: AppShellPage owns-`<main>` / breakpoints / `coarse:` variant /
> one-`Sheet` → §4 + §6; `KNOWN_ISSUES` pointer → §11; console-only superadmin →
> §2; `.next/types` cache + stale-docs reconcile → §9; shared `/profile` +
> shared-links-match-protection → §5; cookie mechanism-not-behavior + typing-not-cast
> + green-build≠proof → §1/§9. Retained as the harvest record.

> Running collection of doctrine-worthy lessons surfaced during the Starter Kit v3
> "Kit Perfection" campaign. **Purpose:** feed the Gate-10 handbook rewrite so
> lessons are captured at the moment they're learned, not reconstructed from memory
> at the end. **Append at every gate's close.**

---

## Seeded 2026-06-26 (Gates 1–5)

- **AppShellPage owns the `<main>`.** Pages adopting the shell must NOT bring their
  own `<main>` (nested `<main>` is invalid). Fixed in the members placeholder page
  during the Gate-3 adoption.
- **Breakpoint contract:** wide rails persist at **`xl` (1280)**, NOT `lg` — BUT
  per-component fit-breakpoints override a blanket rule. The public nav correctly
  goes full-horizontal at **`lg`** (3 short links fit at 1024); `xl` is the 25rem
  *rail's* fit rule, not a kit-wide law.
- **Touch-floor / Tailwind variants:** register the `coarse:` variant
  (`@media (pointer: coarse)`) for touch-only tap floors, and **ALWAYS verify the
  BUILT CSS** — `pointer-coarse:` *looked* like a real variant but isn't in TW 3.4;
  it silently generated **zero CSS** (a phantom) until grep'd in the output.
- **One mobile-menu pattern kit-wide:** the `Sheet` primitive (portals + public
  nav), not Cyber Pharma's older dropdown approach. "Match, don't invent" = match
  the kit's *own* blessed pattern.
- **`KNOWN_ISSUES.md` exists** (repo root) — the handbook should reference it for
  the 2 deferred bugs (`profiles.full_name` NULL at creation; superadmin role-drop).

## Gate 6 (2026-06-26)

- **DOCTRINE — superadmins are CONSOLE-ONLY.** Superadmins are created in the
  Supabase console ONLY, never from the app (carried into Cyber Pharma too). No
  app-side superadmin-creation surface should ever exist — it's an attack /
  privilege-escalation surface. The deleted fossil route
  `/api/auth/superadmin-add-user` violated this; Gate 6 removed it. (Corollary: a
  superadmin-created user landing as `member` is acceptable — promotion happens in
  the console; see `KNOWN_ISSUES.md` Issue 2.)
- **Stale docs to reconcile in Gate 10** (they still reference the now-deleted
  `/api/auth/superadmin-add-user` route as a live endpoint):
  - `docs/AUTHORIZATION.md`
  - `docs/TESTING.md`
  - `agent_docs/APP_FACTORY/AUTH_MANUAL_v1.1.md`
  - `agent_docs/STARTER_KIT/STARTER_KIT_HANDBOOK_v1.0.md`
  - `_SKILLS/starter-kit-cleaner-skill/references/STARTER_KIT_HANDBOOK_v1_1.md`
  (Historical session logs + `docs/change_logs/*` left as-is — point-in-time records.)
- **Stale `.next/types` cache → false tsc failures after file deletions.** Deleting a
  route leaves `.next/types/validator.ts` referencing the dead path → tsc throws
  TS2307. `rm -rf .next` and re-run before trusting a tsc error post-deletion.
- **`stark-frontend-first` "superadmin-add-user → DELETE" directive is now enforced
  in-kit.** Superadmin = console-only doctrine; no app-side superadmin-creation
  surface should ever exist.

## Gate 7 (2026-06-26)

- **Profile is ONE shared `/profile`** (admin + member) via a role-aware
  `components/profile/ProfileForm.tsx` + an `(account)` route group gated
  `[ADMIN, MEMBER]` (sidebar-less account page). No per-portal profile duplication.
- **Console-only doctrine extends to self-service:** superadmin has NO in-app profile
  by design; its Profile link is hidden (render-time `isSuperadmin` gate) and
  `/profile` bounces superadmins cleanly via the `[ADMIN, MEMBER]` gate.
- **Shared links must match route protection.** The shared Navbar Profile link pointed
  at an admin-only `/profile` → it bounced members to `/auth` (a live bug). When a
  link is shared across roles, its target route must accept all of those roles.

## Gate 8 (2026-06-26)

- **Modernize the MECHANISM, not the security BEHAVIOR.** Migrating the Supabase
  cookie adapter `get/set/remove` → `getAll/setAll` changes HOW cookies are written,
  not WHAT flags they carry. The kit's `secure` / `sameSite:'lax'` / `httpOnly:false`
  were preserved in `setAll` — dropping them to "match middleware" would have silently
  changed auth-cookie security (a bug that only shows up in a live session, never in a
  build). `httpOnly:false` is deliberate ("Supabase needs client-side session access").
- **A needed type annotation is NOT a moved cast.** Removing `(await cookies()) as any`
  is only real if you don't reintroduce `any` elsewhere. `setAll(cookiesToSet)` doesn't
  infer (TS7006) → annotate it `{ name; value; options: CookieOptions }[]` (same as
  `middleware.ts`), a precise type, not `any`. Verify with the real-app `as any` count.
- **A green build proves nothing for cookie/session changes** — the operator AUTH-WALK
  (login → nav-persist → hard-refresh → logout-bounce → role-resolve) is the real gate.

<!-- Append future-gate lessons below this line. -->
