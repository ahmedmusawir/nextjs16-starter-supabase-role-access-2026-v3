# Lessons Bin — for the Gate-10 Handbook Rewrite

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

<!-- Append future-gate lessons below this line. -->
