# DEFECT LEDGER — Starter Kit v2 (Part A of the v3 Upgrade)

> Every kit-level defect Run 001 (Cyber Pharma v1, Phase 1) surfaced, severity-sorted, each with evidence and the v3 fix. This is the harvest output — the *what* and *why*. The ordered *how* lives in `../workflow/`. Confirm each defect against disk during the Ground-Truth Sweep before acting; the handbook is a contract, not proof.

**Legend:** 🔴 Critical (breaks build / security) · 🟠 Major (forces workarounds) · 🟡 Cosmetic (annoyance/drift). Lesson refs are to `RUN_001_LESSONS.md`.

---

## 🔴 Critical — breaks the cold build or leaks server code

| # | Defect | Evidence | v3 Fix | Cluster |
|---|---|---|---|---|
| C1 | `(public)/demo/` creates a Supabase client at static prerender → cold `npm run build` fails with "URL and API key are required" when no env is set | L24 | Delete `/demo` (part of demo cascade); ensure no prerendered route creates a runtime client | 1, 5 |
| C2 | `AppRole` enum lives in server-only `get-user-role.ts` (imports `next/headers` via `supabase/server`). A client component value-importing `AppRole` would drag server code into the client bundle and break `next build`. v2 survives only by luck (all client uses are type-only) | L1 | Extract `AppRole` → `src/utils/app-role.ts` (server-free); re-export from `get-user-role.ts`; repoint value-import sites | 3 |
| C3 | No `.env.example` ships at all → operator can't know required vars; fail-closed env checks get authored against guessed names | L9, harvest §5 | Ship `.env.local.example` with Q4-2025 names (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) | 5 |
| C4 | `tsconfig.json` doesn't exclude `agent_docs/**` → FFM template `.ts` stubs (intentional unresolved placeholders) get pulled into `tsc`, failing type-check | L13 | Add `"agent_docs/**"` to `tsconfig` exclude | 5 |

---

## 🟠 Major — forces workarounds / silent-failure risk

| # | Defect | Evidence | v3 Fix | Cluster |
|---|---|---|---|---|
| M1 | `src/services/` ships an 11-file Posts/demo cascade under product directories (`postServices`, `jsonsrvPostServices`, 2 stores, `types/posts`, `components/posts/`, `components/jsonsrv/`, `utils/jsonSrv/`, `utils/common/` + 3 demo routes) | L31, harvest §2 | Delete the whole cascade; v3 ships `src/services/` clean | 1 |
| M2 | `src/app/api/ghl/hooktest/route.ts` — a year-old GoHighLevel webhook from an unrelated **QR project**. Pure clone-debt riding along through clone generations | L32, harvest §2B | Delete. Breaking this chain is the core argument for a clean v3 ancestor | 2 |
| M3 | Non-product routes `/demo`, `/template`, stray top-level `/profile` resolution; `layout-org.tsx`; stale `src/styles/global.scss` duplicate | L32, harvest §2/§2B | Delete all; v3 ships a clean route table | 1, 2 |
| M4 | `useAuthStore` does NOT expose `isAdmin/isSuperadmin/isMember` derived flags though the handbook says it does → code following the handbook reads `undefined` and silently fails role checks | L5 | Add all three flags (superadmin stays in v3) | 3 |
| M5 | `useAuthStore.user` typed `any` — forbidden-zone violation baked in since init; consumers of `user.email` get zero type safety | L6 | Type `SupabaseUser \| null` (option C — match the real API shape, no cast) | 3 |
| M6 | Numbered Tailwind colors in `ThemeToggler.tsx` (`bg-slate-700 text-white`), `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx`, and the `h1-h6` reset (`text-gray-900 dark:text-white`). `button.tsx` was clean, which is exactly why sample-then-trust missed the rest | L17 | Migrate all to semantic tokens; grep-at-close proves zero | 4 |
| M7 | Role color standard uses numbered colors and `admin → red` collides with `destructive → red` (money-lost) — a semantic collision | L17 + GDSH §10 | Convert to `--role-superadmin/admin/member` tokens; admin ≠ destructive hue | 4, 6 |
| M8 | `Logout.tsx` shaped as `DropdownMenuItem` only — unusable as a standalone button; forced inline reimplementation in Run 001 | L33, harvest §3 | Make flexible: render-as prop OR export a `useLogoutHandler()` hook OR two exports (`LogoutMenuItem` + `LogoutHandler`) | 3 |
| M9 | Design system never integrated into the kit — tokens, 4-mode themes, dark-mode readability all installed per-project from scratch every time | harvest §7 | Pre-integrate the **neutral** token contract + dark-mode fix + theme structure | 6 |
| M10 | Dark mode unreadable on real screens despite passing the style tile (background = card so panels vanish; muted-foreground too dim; borders too soft) | L16 | Bake the readability fix into the neutral default (background below card, muted-foreground lifted, borders firm) | 6 |

---

## 🟡 Cosmetic — naming / doc drift

| # | Defect | Evidence | v3 Fix | Cluster |
|---|---|---|---|---|
| K1 | Entry CSS is `.scss` (one Strapi-only Sass block from another project) when plain `.css` suffices | L14 | Ship `globals.css`; Strapi block goes with the demos; `@apply` works in plain CSS | 5 |
| K2 | `AuthTabs.tsx` had `"use Client"` typo (capital C) → rendered as a Server Component despite `useState` | L34 | Fix to `"use client"`; grep directive-case at version-up | 3 |
| K3 | Handbook naming drift: doc says `ThemeToggle`; disk ships `ThemeToggler` (dropdown) | naming-drift | v3 consolidates to one token-driven `ThemeToggle` (operator-confirmed default) | 4, 6 |
| K4 | Handbook §2 located `AppRole` in `get-user-role.ts` while §8 claimed it separated — internal contradiction | L1 + handbook | Resolved in handbook v1.1 (already authored); v3 disk matches | 3 |
| K5 | Handbook §8 "Theme Conventions" literally taught numbered colors (`bg-white dark:bg-slate-800`, etc.) — doc trained the defect | L17 + GDSH | Resolved in handbook v1.1 (semantic tokens); ships into v3 | 6 |
| K6 | Kit ships no proper home page — placeholder/demo as landing | harvest §8 | Ship a generic token-driven marketing landing | 7 |
| K7 | No `RECOVERY.md` / empty `SESSIONS/` bootstrap gap; common UX deps (`react-markdown`, `sonner`, `html-react-parser`) not shipped | STARTER_KIT_FEEDBACK | Ship `RECOVERY.md` stub; (deps = optional KIP, surface to operator) | 0, 8 |

---

## Not in this skill (handled elsewhere)

- **Vitest→Jest lie:** NOT in the kit handbook (it correctly says Jest). The lie lives in the FFM project `CLAUDE.md` template — fix in the product chat, not here (L8).
- **Coral / OwedBook / superadmin deletion:** Cyber-Pharma-specific. v3 stays neutral and KEEPS superadmin. Coral is a Stage-2 value swap.

---

## Severity Rollup

- 🔴 Critical: 4 (C1–C4) — all build/bundle breakers, fixed in clusters 1/3/5.
- 🟠 Major: 10 (M1–M10) — workaround-forcers, clusters 1–6.
- 🟡 Cosmetic: 7 (K1–K7) — drift, clusters 3–8.

**Engineer's one-line v3 verdict:** v2 is a working kit carrying a decade of clone-debt and an un-integrated design system; v3's value is a clean route table, a truth-telling handbook, and a neutral token contract that turns "re-do the design system every project" into a one-file value swap.
