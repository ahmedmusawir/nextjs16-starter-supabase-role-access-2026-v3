# GLOBAL DESIGN SYSTEM HANDBOOK

> **What this is:** the stable doctrine for how the factory designs apps. It rarely changes. It pairs with two fast-moving companions — the **Theme Library** (named theme value-sets) and each project's **token file** (`globals.css`). Cyber Pharma is the worked example throughout; the rules are app-agnostic.
> **Who reads it:** the Designer agent (to know the method and deliverables) and Claudy (to know the contract).
> **Core thesis:** *concrete artifacts survive, abstract intentions decay.* The design system is **code that runs**, not a picture of a brand.
>
> **v1.1 reconciliation note (2026-06-08):** This handbook is the **authority** in the Starter Kit Handbook's v3 reconciliation. The kit handbook's §8 Theme Conventions and §2 Role Colors were migrated from numbered Tailwind classes onto the token contract defined here. The only contract change in this pass: **role identity tokens** were added (§2) so role colors stop being numbered classes. Everything else is unchanged.

---

## 1. The layers (engineer's framing)

A design system is shared constants + types, applied to the UI. Four layers, bottom-up:

| Layer | Engineer analogue | In this factory |
|---|---|---|
| **Tokens** | named constants / config | semantic CSS variables (`--primary`, `--destructive`…) in `globals.css` |
| **Components** | functions that read constants | shadcn primitives, themed by tokens |
| **Patterns** | reusable modules | recurring compositions (dashboard, data-table screen, admin pattern) |
| **Guidelines** | docs / lint rules | this Handbook, the UI_SPEC, the manifests |

If a layer hardcodes a value the layer below should own (e.g. a component using `bg-slate-800`), the system is broken. The whole job is keeping values flowing down from tokens.

---

## 2. The token contract

Every project defines **this canonical set** — no more, no less, unless the app earns an addition (resist sprawl):

`--background` `--foreground` · `--card(-foreground)` · `--popover(-foreground)` · `--primary(-foreground)` · `--secondary(-foreground)` · `--muted(-foreground)` · `--accent(-foreground)` · `--border` · `--input` · `--ring` · `--destructive(-foreground)` · `--success(-foreground)` · `--warning(-foreground)` · `--info(-foreground)` · `--chart-1..5` · `--radius`

**Earned addition — role identity tokens** *(added in v1.1; the RBAC kit "earns" these because role colors are a cross-cutting, fixed-meaning concern):*

`--role-superadmin` · `--role-admin` · `--role-member` (each with `-foreground` if used as a background)

Rules:
- **Light + dark are both mandatory** from day one (`:root` + `.dark`).
- **Format follows the kit's Tailwind major version** — confirm in `package.json`:
  - **Tailwind 3:** HSL, no `hsl()` wrapper, in `globals.css`, mapped in `tailwind.config.ts`.
  - **Tailwind 4:** `@theme inline` block, usually OKLCH, `--color-*` naming.
  - *(Cyber Pharma = TW 3.4 → HSL.)*
- **Semantic tokens carry fixed meaning across every theme.** `success` = good/recovered, `destructive` = bad/lost, `info` = neutral, `warning` = attention. The **brand `--primary` is never used for a status** — that's the orange/red collision trap; keep brand and meaning on separate tokens.
- **Role tokens are identities, not statuses.** `--role-admin` **must be visually distinct from `--destructive`** — an admin badge is not an error. Never render a role with a numbered class (`text-red-600`); use `text-role-admin` etc.
- **`--radius` is one knob** for the whole app's corner language (`0` = flat/Metro).
- Add `--success`/`--warning`/`--info`/`--chart-*` whenever the app shows status or data (shadcn ships only `destructive`).

---

## 3. The theming method

1. **Tokens live in `globals.css`; the Tailwind layer maps them** to utilities (`primary: hsl(var(--primary))`).
2. **Components read semantic utilities only** — `bg-primary`, `text-destructive`, `bg-card`, `border-border`. **Never** the numbered palette (`bg-slate-800`, `text-red-600`). Numbered classes ignore the token file and silently break theming. This single rule is what makes the system real.
3. **A theme is a value-set, not code.** Swap the variables (a class on `<html>`) and the whole app re-themes. Light/dark and any number of named or per-tenant themes are all the same move. (See Theme Library.)
4. **Reconcile the kit.** Starter kits often hardcode colors (`dark:bg-slate-800`, role labels in `text-red-600`). Migrating those onto tokens is a **foundational task**, because until it's done the "change one file, re-theme everything" promise is a lie. *(Done for Starter Kit v3: kit handbook §8 + §2 reconciled onto this contract; shadcn `dialog`/`dropdown-menu`/`toast` primitives migrated; role colors moved to `--role-*` tokens.)*

---

## 4. Component vocabulary

- **The parts list is the kit's shadcn primitives.** Build from them; don't invent a parallel component library.
- **Composition vs primitive.** Most "new components" are arrangements of existing primitives (a KPI tile is a styled `div`; a filter drawer is composition). Only call something a primitive if it's genuinely missing and reusable.
- **Missing primitives → Kit Improvement Proposals.** When a screen needs something the kit lacks, flag it as a KIP to build *first*, don't smuggle a one-off. *(Cyber Pharma's three: DataTable, MultiSelect, EmptyState.)*
- **Deliver a component manifest per project:** each screen → primitives used → KIPs. Kills mid-build surprises.

---

## 5. Layout & responsive (Rule Zero)

- **Mobile-first. Base design target 375px**, then scale up. Breakpoints map to Tailwind: `sm 640 / md 768 / lg 1024 / xl 1280`.
- **Canonical responsive transforms** (design these once, reuse everywhere):
  - **Sidebar/filter rail → slide-in drawer** below `lg`, behind a trigger with an active-count badge.
  - **Wide data table → stacked cards** on mobile — one card per row, the most important value as the hero number, the rest in a 2-col detail grid. *A 10+ column table cannot exist at 375px; this reflow is mandatory.*
  - **KPI row → 2×2** on mobile.
  - **Tabs → horizontal scroll strip.**
  - **Tablet (`md`) is a transition, not a bespoke layout** — no separate tablet artifact by default.
  - **Complex split heroes (copy + visual) transform at `lg` (1024), not `md` (768)** — at ~780px a two-column hero squishes. Reserve `md` for size-only steps (e.g. a headline bridge). *(Run 001 L18.)*
- Operations consoles (e.g. superadmin) may be desktop-oriented; say so explicitly in the spec.

---

## 6. Accessibility bar

- WCAG **AA** contrast minimum.
- Every form field labeled; every control has an accessible name; focus visible everywhere (drive it off `--ring`).
- **Status-color contrast is tuned per mode.** `success`/`destructive` appear as *small colored numbers* in dense tables — so their light values must clear contrast on light `--card` and their dark values on dark `--card`. Tune lightness per mode; never just reuse one value across both. (Verified on the style tile.)
- Keyboard path works on every interactive element.

---

## 7. The style-tile method

The style tile is **a token-driven HTML page**, not a static picture — so it can't drift from the app.

- It renders every constant in context: palette (with each token's *role* + value), the four theme modes, type scale, buttons, fields, KPI tiles, tabs, table, status badges.
- Render it **light and dark**; use it as a **live contrast proof** (status colors as real table numbers on both surfaces).
- It's a *view of the token file*, not a separate artifact to maintain. Lock the tile = lock the tokens.
- Deliver **both** HTML (executable bridge to the tokens) and PNG (human at-a-glance).
- **Necessary but not sufficient.** *(Run 001 L16.)* A passing style tile does NOT guarantee readable real screens. Before locking tokens, do a `npm run dev` walkthrough of the dark surfaces that the tile can't fully exercise: cards-on-background (background must sit *below* card so panels elevate), secondary text / placeholders (`--muted-foreground` lifted), and form-field borders (`--border` firm enough to delineate). Style tile **then** real-screen check, in that order.

---

## 8. The Designer's deliverables (per project)

| # | Deliverable | What it is |
|---|---|---|
| 1 | **Token file** (`globals.css` + Tailwind map) | the executable system — all modes. *Primary deliverable.* |
| 2 | **Style tile** (HTML + PNG) | the visual contract |
| 3 | **Screen artifacts** (HTML + PNG) | each screen in the canonical theme; HTML = build reference, PNG = QC target |
| 4 | **UI_SPEC.md** | component hierarchy, gating, empty/loading/error states, responsive rules, human checkpoints. *(Designer revises the Architect's draft.)* |
| 5 | **Component manifest** | primitives per screen + KIPs to build first |

Plus the **factory-level** docs that outlive any one project: **this Handbook** and the **Theme Library**.

**HTML is load-bearing for Claudy; PNG is the QC target.** Always ship both for tiles and screens.

---

## 9. Workflow (Canonical Page Method)

1. **Brief in** → identify the most representative screen.
2. **Lock tokens + build that one canonical screen** perfectly, token-driven.
3. **Render the style tile**, review light+dark, **then real-screen check, then lock**.
4. **Clone-and-adapt** the remaining screens from the canonical — change content, not structure. (Other themes/modes are pure token swaps.)
5. **Write/revise the UI_SPEC + component manifest.**
6. **Hand to Claudy** — HTML to build from, PNG to verify against, tokens to inherit.

Principles: design **one page per step**, never "design all screens at once" (that's where drift comes from). **Human approval gates** at the canonical-screen lock and the style-tile lock. Functional clarity first (Demo Mode); polish later.

---

## 10. Anti-patterns (stop signs)

- ❌ Numbered Tailwind colors in components (`bg-slate-800`) — breaks theming.
- ❌ Brand color used as a status color — semantic collision.
- ❌ Role color rendered as a numbered class, or a role reusing the `--destructive` hue — identity/status collision. Use `--role-*` tokens.
- ❌ Inventing components the kit can compose — flag a KIP instead.
- ❌ A partial theme (light only, or missing semantic tokens).
- ❌ Designing desktop-only then "making it responsive later" — Rule Zero is 375 first.
- ❌ Cramming Phase-2 polish into a Phase-1 foundation — respect the phasing; foundation *anticipates*, doesn't *build*.
- ❌ Treating the style tile as a static mockup that drifts from code.
- ❌ Locking tokens on a style-tile pass alone, skipping the real-screen dark-mode check.

---

## 11. New-project checklist (so future labs are fast)

When a new app brief lands, the Designer:

1. Reads the brief + confirms the **kit's Tailwind version** (`package.json`).
2. Identifies the **canonical screen**.
3. Asks the Architect for the **UI_SPEC draft** (or drafts the screen list with them).
4. Produces, in order: **token file → canonical screen → style tile → remaining screen artifacts → UI_SPEC revision → component manifest.**
5. Pulls theme values from the **Theme Library** (or derives a new family and adds it).
6. Hands Claudy the HTML + PNG + tokens + spec + manifest.

If anything's missing to start, the Designer says exactly what — usually just the brief and the Tailwind version.

---

## 12. The one-paragraph version

Tokens are the system. They live in `globals.css`, map through Tailwind, and components read them semantically — never numbered colors. Light + dark are mandatory; semantic colors hold their meaning across every theme while brand, neutrals, and role identities swap freely on their own tokens. Build from the kit's shadcn primitives, compose rather than invent, and flag genuine gaps as KIPs. Design mobile-first from 375, with the sidebar-to-drawer and table-to-cards transforms as standard. Prove it all on a token-driven style tile, confirm it on a real-screen dark-mode pass, and hand Claudy HTML to build from plus PNGs to check against. Do this once per project and the next one starts here, not from scratch.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.1 | 2026-06-08 | Added **role identity tokens** (`--role-*`) to the §2 contract as an earned addition, with the admin≠destructive collision rule; added the role anti-pattern (§10); folded Run 001 lessons L16 (real-screen dark check) and L18 (lg split-hero) into §5/§7/§9/§10; added the reconciliation note (this handbook is the authority the Starter Kit Handbook v1.1 defers to). Core doctrine unchanged. |
| 1.0 | (original) | Initial Global Design System Handbook. |

---

🥄 *Part of Stark Industries — App Factory doctrine. Pairs with the Theme Library and each project's `globals.css`.*
