---
name: starter-kit-cleaner
description: >
  Harden a fresh clone of Starter Kit v2 into a clean, generic Starter Kit v3
  by replaying the documented Run 001 kit-level fixes — delete demo scaffolding
  and clone-debt, extract AppRole, migrate numbered colors to semantic tokens,
  ship the env example, integrate the neutral design-system token contract, and
  ship a generic home page. Triggers on "clean the starter kit", "build v3",
  "kit cleanup", "harden the kit", "starter-kit-cleaner". This is a REPLAY of
  known-good fixes, NOT a redesign. It KEEPS the superadmin portal and stays
  brand-neutral (NO coral — that's a downstream value swap). It does NOT build
  any project-specific feature, and it does NOT run against a Cyber Pharma clone.
allowed-tools: [bash, view, str_replace, create_file]
---

# Starter Kit Cleaner — v2 → v3 Methodology

## Role

You are the **Kit Cleanup Engineer**. You replay a fixed, evidence-backed set of changes onto a fresh Starter Kit v2 clone to produce a clean generic v3. You execute cluster by cluster, stopping for operator approval between each. You keep superadmin, you stay neutral, and you never invent a fix that isn't in `references/DEFECT_LEDGER.md`. Read `CLAUDE.md` first if you haven't — it holds the doctrine, the folder map, and the activation sequence. This file is the step-by-step spine.

> **Cadence reminder:** every phase ends with a **Stop Gate**. Propose → STOP → operator approves → execute → STOP for review → next. Never batch.

---

## Phase 0 — Ground Truth & Plan

**Goal:** Know the disk before touching it. Confirm this is clean v2, not Cyber Pharma.

1. Run the discovery in `CLAUDE.md` §2 (pwd, git, package.json, src tree, entry CSS).
2. Follow `workflow/00-ground-truth-sweep.md`: verify every handbook-named file exists, capture the route table from a build, run the baseline forbidden-zone greps (numbered colors, `any` types, `"use Client"` typo), and grep for project residue (`coral`, `owedbook`, `cyberize`, `cyberpharma`).
3. Cross-check findings against `references/DEFECT_LEDGER.md` — confirm which defects are present.

**Stop Gate:** Present the Plan — versions, confirmed defects, the cluster order (1→8), the baseline grep counts, and any disk-vs-ledger differences. End with **"Awaiting APPROVED."** Do not proceed without it.

**Output:** A confirmed defect inventory + approved execution plan. Write a `RECOVERY.md` at repo root from `templates/RECOVERY.md` (Last action / Pending / Next step) before any edits.

---

## Phase 1 — Delete the Demo Cascade

**Goal:** Remove the 11-file Posts/demo scaffolding that ships under product directories.

Follow `workflow/01-delete-demo-cascade.md`. The cascade (confirm each exists first): `postServices.ts`, `jsonsrvPostServices.ts`, `usePostStore.ts`, `useJsonsrvPostStore.ts`, `types/posts.ts`, `components/posts/`, `components/jsonsrv/`, `utils/jsonSrv/`, `utils/common/` (the demo-only parts), and the demo routes `(admin)/users/`, `(admin)/admin-booking/`, `(members)/booking/`, plus `(public)/demo/` + `DemoPageContent.tsx`.

- Delete in small batches. After each batch: `rm -rf .next` then `npx tsc --noEmit`.
- Tests for deleted code die with their source — that is correct, not a regression.
- Grep for surviving import sites and dead nav links to the deleted routes; fix or surface (L23).

**Stop Gate:** Show the deletion list, the post-batch tsc results, and any link-sites found. Await review.

**Output:** `src/services/` clean of demo code; demo routes gone; no orphaned imports.

---

## Phase 2 — Kill the Clone-Debt

**Goal:** Remove cross-project residue that rode along through clones. This is what makes v3 break the clone-of-a-clone chain.

Follow `workflow/02-kill-clone-debt.md`. Confirmed targets: `src/app/api/ghl/hooktest/route.ts` (a year-old GoHighLevel webhook from an unrelated QR project — pure clone-debt), `/template`, `layout-org.tsx`, and any stale `src/styles/global.scss` duplicate. Re-run the residue grep to prove zero project-foreign files remain.

**Stop Gate:** Show what was removed and the clean residue-grep. Await review.

**Output:** Zero cross-project fossils. The QR ghost dies at v3.

---

## Phase 3 — Structural Separations

**Goal:** Do the separations the kit handbook claimed but never shipped.

Follow `workflow/03-structural-separations.md` and `references/APPROLE_EXTRACTION.md`:
- Extract the `AppRole` enum to `src/utils/app-role.ts` (server-free). Re-export from `get-user-role.ts` for back-compat. Update every value-level import site to point at `app-role.ts` (the replay list is in the reference — ~9 sites; confirm each on disk first).
- Add derived flags `isAdmin`, `isSuperadmin`, `isMember` to `useAuthStore` (keep all three — superadmin stays in v3).
- Type `useAuthStore.user` as `SupabaseUser | null` (kill the `any`).
- Fix the `AuthTabs.tsx` `"use Client"` → `"use client"` directive-case typo (L34).

After edits: `rm -rf .next`, `npx tsc --noEmit`, `npm test`.

**Stop Gate:** Show the extraction diff summary, the import-site updates, and the green triad. Await review.

**Output:** Client/server boundary safe; store typed and flag-complete; directive fixed.

---

## Phase 4 — Forbidden-Zone Migration

**Goal:** Zero numbered Tailwind colors. Everything reads semantic tokens.

Follow `workflow/04-forbidden-zone-migration.md` and `references/COLOR_MIGRATION.md`. Migrate the numbered colors in `ThemeToggler`/`ThemeToggle`, `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx`, and the `h1-h6` reset in the entry CSS. Convert role colors to `--role-*` tokens (admin must NOT reuse the destructive hue). Use `str_replace` with care; for a className pattern repeated across files, batch it but verify the pattern is byte-identical first (L27).

**Stop Gate (grep-at-close):** Run the numbered-color grep across `src/` and show it returns **zero** hits. This is mandatory — no sample-then-trust (L17). Await review.

**Output:** Components and primitives fully token-driven; role colors tokenized.

---

## Phase 5 — Env, Build & Config

**Goal:** Cold `npm run build` passes with no env vars; ship the example; fix config.

Follow `workflow/05-env-build-config.md` and `references/ENV_AND_BUILD.md`:
- Ship `.env.local.example` (from `templates/env.local.example`) with the **Q4-2025** Supabase names (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).
- Convert the entry stylesheet `globals.scss` → `globals.css` (the Strapi-only Sass block is gone with the demos; `@apply` works in plain CSS).
- Add `"agent_docs/**"` to `tsconfig.json` exclude.
- Confirm no remaining route creates a Supabase client at prerender (the `/demo` breaker is already gone).

**Stop Gate:** Show a cold `npm run build` (no `.env.local`) completing clean, and the route table. Await review.

**Output:** Cold build green; env example shipped; config corrected.

---

## Phase 6 — Integrate the Design System (Neutral)

**Goal:** Ship the token *contract* with a *neutral* default and the dark-mode readability fix baked in. NO coral.

Follow `workflow/06-design-system-integrate.md`:
- Install `templates/globals.neutral.css` as `src/app/globals.css` — the full semantic token contract (`--primary`…`--destructive/--success/--warning/--info/--chart-*`, `--role-*`, `--radius`), light + dark, plus the `theme-bright` / `theme-deep` alternates. Brand values are **neutral**, not coral.
- Confirm `tailwind.config.ts` maps every token (including the new `--role-*` and status tokens).
- Wire one token-driven `ThemeToggle` (consolidate the `ThemeToggler` dropdown / `ThemeToggle` button split per the operator's standardization).
- Place the corrected docs into `agent_docs/`: `STARTER_KIT_HANDBOOK_v1_1.md`, and under `agent_docs/APP_FACTORY/design-system/` the design-system v1.1 docs.

**Stop Gate (real-screen check):** `npm run dev`, walk dark surfaces — cards must elevate above background, muted text readable, borders firm. Show the operator before locking. Await review.

**Output:** Neutral design system integrated and verified on real screens.

---

## Phase 7 — Generic Home Page

**Goal:** Ship a clean, token-driven marketing landing so new projects start with a real page, not a demo to delete.

Follow `workflow/07-home-page.md`. Generalize the proven landing structure (hero + CTA + trust row + feature grid) into neutral, content-swappable copy. Use the kit's `Page`/`Row`/`Box` primitives and the server-shell + client-island nav pattern (theme toggle on the marketing nav; mobile hamburger present; auth-aware region that reflects logged-in state without auto-redirect — L19/L20/L22). No project branding.

**Stop Gate:** Show the home page light + dark, mobile + desktop. Await review.

**Output:** A generic marketing home page as the kit default.

---

## Phase 8 — Verify & Tag

**Goal:** Prove v3 is clean and lock it.

Follow `workflow/08-verify-and-tag.md`:
- Run every grep-verifiable predicate one final time (numbered colors zero, no `any` in store, no residue, no dead links).
- Verification triad from cold: `npx tsc --noEmit` (exit 0), `npm test` (all pass), `npm run build` (clean, no env).
- Confirm superadmin intact; confirm neutral (no coral grep hits).
- Update repo `RECOVERY.md`. Tag `v3`.

**Stop Gate:** Present the close-out summary (per `CLAUDE.md` §6) + the two product-chat sync notes. Await operator's final confirmation, then tag.

**Output:** Tagged Starter Kit v3. Clean ancestor ready to clone.

---

## Worked Example (activation → first stop)

> **Operator:** "Read `starter-kit-cleaner/CLAUDE.md` and follow it."
>
> **You:** *[reads CLAUDE.md, runs discovery]* "On disk: Next 16.2.6, React 19.2.4, Tailwind 3.4.1, `"test": "jest"`, entry CSS is `src/app/globals.scss`. Residue grep for coral/owedbook/cyberize/cyberpharma → **zero hits**, so this is clean v2, good to proceed. Ground-truth sweep confirms 6 of the 6 ledger handbook-defects present (`app-role.ts` absent, no derived flags, `user: any`, `.scss` entry, `ThemeToggler` not `ThemeToggle`, numbered colors in 4 primitives + h1-h6). Route table shows `/demo`, `/template`, `/api/ghl/hooktest` present — all confirmed deletion targets. Numbered-color baseline grep: 23 hits across 6 files.
>
> Plan: 8 clusters in order — demo cascade → clone-debt → structural separations → color migration → env/build → design system (neutral) → home page → verify/tag. Superadmin stays. Neutral, no coral. I'll write `RECOVERY.md` before any edits and stop for your review after every cluster.
>
> **Awaiting APPROVED.**"
>
> *[STOPS — does not touch a file until the operator approves]*

---

## Anti-Patterns (skill-specific)

- ❌ **Copying Cyber Pharma to make v3.** It deleted superadmin and added coral — copying plants residue and removes what v3 needs most. v3 = fresh v2 + these fixes.
- ❌ **Reinventing a fix.** If it's not in `DEFECT_LEDGER.md`, it's out of scope. Surface it; don't smuggle it.
- ❌ **Baking coral / any brand values into v3.** Neutral only. Coral is a Stage-2 swap.
- ❌ **Removing superadmin.** That was project-specific; v3 keeps three-tier RBAC.
- ❌ **Sample-then-trust on a grep-verifiable gate.** Run the grep at close.
- ❌ **Batching clusters / skipping stop gates.** Destructive work; the operator reviews each step.
- ❌ **tsc smoke without `rm -rf .next` after deletions.** Stale cache = false alarms.
- ❌ **Locking tokens on a style-tile pass alone.** Real-screen dark check first.

## When You're Done

All Phase-8 criteria green and proven, v3 tagged, close-out summary delivered including the two product-chat sync notes. Hand back: the clean tagged repo, the grep proofs, the final triad output. Stop there — do not begin Stage 2 (Super Admin Portal) in this skill; that's a separate effort that clones v3.
