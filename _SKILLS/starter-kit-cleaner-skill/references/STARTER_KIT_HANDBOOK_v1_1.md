# STARTER KIT HANDBOOK

> **Canonical answer to: "What does the kit already provide?"**
>
> **🛑 READ THIS BEFORE AUTHORING ANY SERVICE, COMPONENT, OR ROUTE.**
>
> If the kit provides what you're about to build, you DO NOT build it. You consume the kit's primitive directly.

**Kit:** Stark SaaS Starter (Pro RBAC Next.js Starter Kit)
**Targets:** Starter Kit **v3** (clean ancestor)
**Handbook Version:** v1.1 (v3 reconciliation pass)
**Framework:** Next.js 16.2.1 (App Router) + React 19.2.4
**Last Updated:** 2026-06-08 (Run 001 reconciliation — every confirmed handbook-vs-disk gap closed)
**Maintained by:** Stark Industries — App Factory

---

## ⚠️ v3 Reconciliation Change-Log (read first)

This handbook was previously **aspirational in places** — it described what the kit *should* be, not what was on disk. Run 001 (Cyber Pharma v1, Phase 1) surfaced the gaps. This version closes them. Each correction is tagged inline as **🔧 RECONCILED** with its lesson reference so the diff is auditable.

| # | What changed | Old (v1.0) | New (v1.1 / v3) | Lesson |
|---|---|---|---|---|
| 1 | **§8 Theme Conventions** | Taught numbered colors (`bg-white dark:bg-slate-800`, `dark:bg-zinc-900`, `bg-slate-100 dark:bg-slate-500`) | Semantic tokens only (`bg-popover`, `bg-muted`, `border-border`) — matches the Global Design System Handbook | L17 |
| 2 | **§2 Role Color Standard** | Numbered colors; `admin → red` collided with `destructive → red` | Dedicated `--role-*` tokens; admin no longer reuses the destructive hue | L17 + GDSH §10 |
| 3 | **AppRole location** | §2 said `get-user-role.ts`; §8 said separated — contradiction | `AppRole` lives in `src/utils/app-role.ts` (server-free), re-exported from `get-user-role.ts` | L1 |
| 4 | **`useAuthStore` derived flags** | Claimed `isAdmin/isSuperadmin/isMember` exist (they didn't on v2 disk) | v3 ships all three flags implemented; claim is now true | L5 |
| 5 | **`useAuthStore.user` type** | Doc implied typed; v2 disk shipped `any` | v3 ships `SupabaseUser \| null` | L6 |
| 6 | **Theme toggle naming** | Named `ThemeToggle`; v2 disk shipped `ThemeToggler` (dropdown, numbered colors) | v3 ships one token-driven `ThemeToggle` ⚑ *(naming pending operator confirm)* | naming-drift lesson |
| 7 | **§13 cross-refs** | No link to the design-system doctrine | Added Global Design System Handbook + Theme Library | — |

**Not changed (already correct):** the test runner. This handbook already says **Jest** (§7). The "doctrine says Vitest" lie lives in the FFM project `CLAUDE.md` template, **not here** — fix it there (L8).

**Meta-lesson, now permanent doctrine:** *the handbook is a contract, not an aspiration.* Every file/flag/path it names must exist on disk. Ground-truth before trust.

⚑ = a flagged operator decision (see the two ⚑ notes in §2 and §4).

---

## 🚨 The First Rule

**Every Factory run begins by reading this handbook in Phase 0.** No exceptions.

**Why this exists:** In Factory Run 001 (Cyberize), the agent almost authored a redundant `authService.ts` wrapping the kit's already-complete Supabase auth stack. The kit's capabilities weren't documented in one canonical place, so the agent followed the module's generic DATA_CONTRACT literally. This handbook prevents that failure mode permanently.

**The principle:** If the kit provides it as wired infrastructure, **components consume it directly**. The service layer is reserved for what the kit does NOT provide — domain operations specific to the project (chat, agent profiles, agent instructions, etc.).

---

## Table Of Contents

1. [Auth — Already Wired](#1-auth--already-wired)
2. [RBAC & RLS — Already Wired](#2-rbac--rls--already-wired)
3. [Database — Schema & Patterns](#3-database--schema--patterns)
4. [Components — Inventory](#4-components--inventory)
5. [Routing — Conventions](#5-routing--conventions)
6. [State Management — Patterns](#6-state-management--patterns)
7. [Tests — Baseline & Conventions](#7-tests--baseline--conventions)
8. [Build & Framework Notes](#8-build--framework-notes)
9. [Common Gotchas](#9-common-gotchas)
10. [What's NOT In The Kit (Build Yourself)](#10-whats-not-in-the-kit-build-yourself)
11. [Quick Reference — "Should I Author This?"](#11-quick-reference--should-i-author-this)
12. [Handbook Maintenance](#12-handbook-maintenance)
13. [Cross-References](#13-cross-references)

---

## 1. Auth — Already Wired

### 🛑 DO NOT AUTHOR

- `src/services/authService.ts` — **forbidden.** The kit's auth is complete. Components consume the kit's auth primitives directly.
- Custom session refresh logic — middleware handles it.
- Custom login/logout API routes — they exist already.

### What The Kit Provides

The kit ships with a complete Supabase SSR auth stack. Three client types, request-level session refresh, three working portals.

**Supabase Clients (three flavors, use the right one):**

| Client | File | When To Use | RLS Bypass? |
|---|---|---|---|
| Server (anon) | `src/utils/supabase/server.ts` | Server Components, API routes — own-user ops | NO — respects RLS |
| Browser | `src/utils/supabase/client.ts` | Client Components, browser auth flows | NO — respects RLS |
| Middleware | `src/utils/supabase/middleware.ts` | Session refresh in middleware/proxy | NO |
| Admin (service role) | `src/utils/supabase/admin.ts` | Portal admin operations | **YES — bypasses RLS** |

**Auth API Routes (`src/app/api/auth/`):**

- `login/route.ts` — email/password login
- `logout/route.ts` — clears session
- `signup/route.ts` — public signup, creates `member` role; **metadata key MUST be `full_name`**
- `confirm/route.ts` — email confirmation callback
- (the `superadmin-add-user/route.ts` fossil was removed; admin-side user creation is via the `addMember`/`addUser` server actions)

**Client Auth State:**

- `src/store/useAuthStore.ts` — Zustand store managing current user, derived role flags, authenticated state, login/logout actions
- **Use this in client components** — do NOT create a parallel auth store
- 🔧 **RECONCILED (L6):** `useAuthStore.user` is typed `SupabaseUser | null` in v3 (v2 shipped `any` — a forbidden-zone violation). Consumers get real type safety on `user.email`, etc.
- 🔧 **RECONCILED (L5):** v3 ships the derived flags `isAdmin`, `isSuperadmin`, `isMember`. On v2 they were documented but absent on disk; following the doc would have read `undefined` and silently failed role checks. They now exist.

**Server-Side Page Protection:**

- `src/utils/supabase/actions.ts` exports `protectPage([AppRole.X])`
- Use as the FIRST call in any protected layout's `RootLayout` async function
- Returns the authenticated user or redirects to `/auth`

### How To Consume Auth (The Right Way)

**In a Server Component (e.g., a portal layout):**

Use `protectPage([AppRole.ADMIN])` at the top of the layout. No service wrapper needed. See `src/app/(admin)/layout.tsx` for the canonical pattern.

**In a Client Component (e.g., a sidebar showing user email):**

Read from `useAuthStore`. Do NOT call `supabase.auth.getUser()` from the client directly.

**In an API Route (e.g., POST to do a thing):**

Create the server client via `createClient()`, call `supabase.auth.getUser()`, check the user exists, then proceed.

**For login/logout from a form:**

Submit the form to `/api/auth/login` or `/api/auth/logout`. Use `.catch()` chains, NOT `try/catch` (see Common Gotchas).

### Auth Pattern Decision Tree

```
Need to know "is the user logged in?" in a Server Component?
  → const { data: { user } } = await supabase.auth.getUser()
  → Or use protectPage([role]) if it's a protected route

Need to know "is the user logged in?" in a Client Component?
  → useAuthStore() — read the state

Need to log in / log out?
  → POST to /api/auth/login or /api/auth/logout

Need to know the user's role?
  → Server: await getUserRole() from src/utils/get-user-role.ts
  → Client: useAuthStore() derived flags (isAdmin, isSuperadmin, isMember)
```

---

## 2. RBAC & RLS — Already Wired

### 🛑 DO NOT AUTHOR

- Custom role-checking logic in components — use `useAuthStore` flags or `protectPage`
- Custom RLS policies for `profiles` or `user_roles` — they exist
- New role tables — the two-table pattern is locked

### Roles

Three roles, defined in the `AppRole` enum at **`src/utils/app-role.ts`**:

- `superadmin` — full platform access
- `admin` — restricted user management
- `member` — own profile only

> 🔧 **RECONCILED (L1):** The enum lives in its own **server-free** module, `src/utils/app-role.ts`, and is re-exported from `get-user-role.ts` for backward compatibility. v1.0 §2 incorrectly located it in `get-user-role.ts` while §8 claimed it was separated — a doc-internal contradiction. The reason it must be server-free: a `"use client"` component that *value*-imports `AppRole` would otherwise drag `next/headers` (via `getUserRole()`'s `supabase/server` import) into the client bundle and break `next build`. v3 ships the extraction; v2 only got away with it by luck (every client usage happened to be a type-only import).

### The Two-Table Pattern (CRITICAL)

Roles and profiles live in **two sibling tables** — both FK to `auth.users(id)`, with NO direct FK between them:

```sql
public.profiles
  id         uuid PK → auth.users(id) ON DELETE CASCADE
  full_name  text
  email      text
  created_at timestamptz

public.user_roles
  id         uuid PK
  user_id    uuid → auth.users(id) ON DELETE CASCADE
  role       text  -- 'superadmin' | 'admin' | 'member'
```

**🛑 PostgREST nested selects DO NOT WORK across sibling tables.**
- ❌ NEVER use `profiles(user_roles(role))`
- ✅ ALWAYS use the two-query merge pattern (fetch profiles, then fetch roles separately, merge in JS)

### The DB Trigger (Mark IV)

`handle_new_user()` fires atomically on every `auth.users` INSERT:

- Reads `full_name` from `raw_user_meta_data`
- Reads `role` from `raw_user_meta_data` — defaults to `'member'` if absent
- Inserts into BOTH `user_roles` AND `profiles`

**🛑 Never manually insert into `user_roles` or `profiles` when creating users via `auth.admin.createUser()`.** The trigger handles it. Manual inserts will cause duplicate-key errors.

### How To Check Roles

**In a Server Component or API Route:**

```typescript
import { getUserRole } from "@/utils/get-user-role";
import { AppRole } from "@/utils/app-role";

const role = await getUserRole();
if (role === AppRole.ADMIN) { /* ... */ }
```

**In a Client Component:**

```typescript
import { useAuthStore } from "@/store/useAuthStore";
const isAdmin = useAuthStore((s) => s.isAdmin);
if (isAdmin) { /* ... */ }
```

**In a Protected Layout:**

```typescript
// src/app/(admin)/layout.tsx
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

await protectPage([AppRole.ADMIN]);
```

### Role Color Standard (Token-Driven)

> 🔧 **RECONCILED (L17 + Global Design System Handbook §10):** v1.0 specified role colors as **numbered Tailwind classes** (`text-purple-600`, `text-red-600`, `text-green-600`). Two problems: (1) numbered colors bypass the token file and break theming — the exact anti-pattern the design system forbids; (2) `admin → red` **collides** with `destructive → red` ("money lost"), a semantic collision. v3 defines role colors as **dedicated semantic tokens**.

Role identity colors are theme-safe semantic tokens, defined in `globals.css` and mapped through Tailwind:

```
text-role-superadmin   /* distinct brand-ish hue */
text-role-admin        /* MUST NOT reuse the --destructive hue */
text-role-member       /* may align with --success */
```

Rules:
- **Never** render a role with a numbered class (`text-red-600`).
- **`--role-admin` must be visually distinct from `--destructive`** — admin is an identity, not an error.
- Values live in the token file per the **Theme Library**; light + dark are both mandatory; tune contrast on the style tile (AA against `--card`).

> ⚑ **OPERATOR DECISION:** This adds `--role-superadmin / --role-admin / --role-member` to the token contract. The Global Design System Handbook permits earned additions. If you would rather keep numbered role colors as a *single documented exception* to the no-numbered-colors rule, say so and this reverts to a one-paragraph exception note instead. Until confirmed, v3 treats role colors as tokens.

---

## 3. Database — Schema & Patterns

### Tables Already In The Kit

| Table | Purpose | RLS |
|---|---|---|
| `auth.users` (Supabase managed) | All users | Supabase-managed |
| `public.profiles` | Display names, email, created_at | Per-user policies pre-applied |
| `public.user_roles` | Role assignments | Per-user policies pre-applied |

### RLS Patterns (Pre-Applied On Kit Tables)

Standard pattern — users see/edit their own data:

```sql
-- Users see only their own profile
CREATE POLICY "Users see own profile"
ON profiles FOR SELECT USING (auth.uid() = id);

-- Users update only their own profile
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);
```

Service role bypasses RLS — used in admin API routes.

### When You Add New Tables (Project-Specific)

- **Always enable RLS:** `ALTER TABLE <new_table> ENABLE ROW LEVEL SECURITY;`
- **Always FK to `auth.users(id)` with `ON DELETE CASCADE`** when scoping to users
- **Always document RLS policies** in `_project/CLAUDE.md` for the run
- **Use service role client** for admin operations, anon client for user-facing
- **Test with both role contexts** (admin + member) before declaring done

---

## 4. Components — Inventory

### 🛑 BEFORE AUTHORING ANY COMPONENT

1. Check `COMPONENT_REGISTRY.md` (sibling file) — does a primitive exist?
2. Check `src/components/common/` for layout primitives
3. Check `src/components/ui/` for Shadcn primitives
4. Check the manual at `agent_docs/APP_FACTORY/UI-UX-BUILDING-MANUAL.md`
5. Only if NONE of those provide it, author the new component

### Common Layout Primitives (`src/components/common/`)

| Primitive | Purpose | When To Use |
|---|---|---|
| `Page` | Responsive content-flow wrapper | Marketing pages, forms, doc pages |
| `Row` | Full-width section with `p-5` padding | Stacked content sections |
| `Box` | Bare content block | Bubbles, cards, content blocks |
| `Container` | Page variant for nested sections | Sub-pages |
| `Main` | `<main>` semantic element with `flex-grow` | Wrapping main content |
| `AppShellPage` | Full-bleed app shell with sidebar + main | Chat, mission control, dashboards, ops consoles |
| `PaginationControls` | Shared pagination with `useTransition` | Any portal list view |

### AppShellPage (Born In Run 001 Phase 5.4)

Mobile-first built-in. Sidebar collapses to slide-over at `<md`.

```typescript
<AppShellPage
  sidebar={<MySidebar />}
  mobileTitle="MY APP"
  mobileTopBarRight={<ThemeToggle />}
>
  {/* main column content */}
</AppShellPage>
```

**Heavy in-file JSDoc** at `src/components/common/AppShellPage.tsx` documents the decision tree, mobile behavior contract, theme conventions, accessibility notes, and promotion path.

### Layout Decision Tree

```
Is this a full-bleed app surface (sidebar + scrolling main / sticky input)?
  YES → AppShellPage
        (chat, mission control, dashboards, ops consoles)
  NO  → Is this content-flow (marketing, doc, list, form)?
          YES → Page + Row + Box
                (home, demo, settings forms, marketing)
          NO  → Is it a dense data table portal?
                  YES → plain <div className="container mx-auto p-6">
                        (admin-portal precedent — kit allows this)
```

### Global Components (`src/components/global/`)

| Component | Purpose |
|---|---|
| `Navbar` | Default site navbar |
| `NavbarHome` | Home page navbar variant |
| `NavbarSuperadmin` | Superadmin portal navbar |
| `ThemeToggle` | Light/dark mode toggle — **token-driven** (see note) |

> 🔧 **RECONCILED (naming-drift lesson):** v2 disk shipped this component as **`ThemeToggler`** (a dropdown with Light/Dark/System) carrying **numbered colors** (`bg-slate-700 text-white`) — both a naming mismatch with the handbook and a forbidden-zone violation. A second, cleaner `ThemeToggle` (icon button) was added project-side in Cyber Pharma. v3 consolidates to **one** token-driven component named **`ThemeToggle`**, with zero numbered colors.
>
> ⚑ **OPERATOR DECISION:** confirm the canonical name. Default = `ThemeToggle` (matches the handbook and the cleaner icon-button form). If you prefer to keep the `ThemeToggler` dropdown name/shape, say so and the kit standardizes on that instead — either way it ships token-driven.

### Layout Components (`src/components/layout/`)

| Component | Purpose |
|---|---|
| `Sidebar` | Default sidebar |
| `AdminSidebar` | Admin portal sidebar |
| `SuperadminSidebar` | Superadmin portal sidebar |

### Auth Components (`src/components/auth/`)

| Component | Purpose |
|---|---|
| `LoginForm` | Login UI — wired to `/api/auth/login` |
| `RegisterForm` | Signup UI — wired to `/api/auth/signup` |
| `AuthTabs` | Tab switcher between login/register |

> 🔧 **RECONCILED (L34):** v2's `AuthTabs.tsx` shipped with a `"use Client"` typo (capital C), which silently rendered it as a Server Component despite using `useState`. v3 ships the correct `"use client"` directive. Directive-case is grep-checked at every kit version bump.

### Shadcn UI Components (`src/components/ui/`)

Standard Shadcn primitives installed and themed:

- `Button`, `Input`, `Label`, `Textarea`
- `Card` (and CardHeader, CardContent, CardFooter)
- `Alert` (with variants)
- `Dialog`, `Sheet` (slide-over)
- `DropdownMenu`, `Select`
- `Skeleton`, `Spinner` (lucide `Loader2`)
- `Sonner` (toast) — configured globally
- `ScrollArea`
- `Separator`
- `Tabs`
- `Form` (with `react-hook-form` + `zod`)

> 🔧 **RECONCILED (L17):** v2's `dialog.tsx`, `dropdown-menu.tsx`, and `toast.tsx` carried numbered colors despite `button.tsx` being clean. v3 ships **all** primitives token-driven (zero numbered colors), verified by grep at version-up. Do not assume a sampled-clean primitive means the rest are clean.

If you need a Shadcn primitive that's NOT installed, use `npx shadcn@latest add <name>` rather than authoring from scratch.

---

## 5. Routing — Conventions

### App Router Only

- ✅ Use App Router patterns exclusively
- ❌ NEVER use Pages Router (`getStaticProps`, `getServerSideProps`)
- All routes are in `src/app/`

### Route Groups (Current Kit Baseline)

```
src/app/
  (public)/                — Public routes (home)
    layout.tsx             — No auth required
    page.tsx               — Home (token-driven marketing landing; v3 ships clean, not a demo)

  (auth)/                  — Auth pages
    layout.tsx
    auth/                  — Login + register (AuthTabs)
      page.tsx

  (superadmin)/            — Superadmin portal
    layout.tsx             — protectPage([AppRole.SUPERADMIN])
    superadmin-portal/     — Full CRUD user management

  (admin)/                 — Admin portal
    layout.tsx             — protectPage([AppRole.ADMIN])
    admin-portal/          — Restricted CRUD user management
    profile/               — Admin's own profile

  (members)/               — Member portal
    layout.tsx             — protectPage([AppRole.MEMBER])
    members-portal/        — Member dashboard + profile

  api/auth/                — Auth API routes (login, logout, signup, etc.)
```

> 🔧 **RECONCILED (L24, L31, L32):** v2 shipped demo/fossil routes that DON'T belong in a clean baseline — `(public)/demo/` (created a Supabase client at prerender and **broke the cold build**), `/template`, `/api/ghl/hooktest` (a year-old GoHighLevel webhook from an unrelated QR project — pure clone-debt), and a stray top-level `/profile` resolution. v3 ships a **clean route table** with only the groups above. The superadmin group is **kept** in v3 (generic kits want full three-tier RBAC; its removal in Cyber Pharma was project-specific). Cold `npm run build` must pass with no env vars set.

When adding NEW route groups for project-specific portals (e.g., `(cyberize)/`), use the same pattern:

- Group folder in parentheses
- `layout.tsx` with `protectPage([role])` at the top
- Subroutes under it

### Page Composition Pattern (CRITICAL)

**Rule:** `page.tsx` is a thin wrapper (3-8 lines). Content lives in a **co-located** `<Feature>PageContent.tsx`.

```typescript
// src/app/(cyberize)/chat/page.tsx
import { ChatPageContent } from "./ChatPageContent";

export default function ChatPage() {
  return <ChatPageContent />;
}
```

```typescript
// src/app/(cyberize)/chat/ChatPageContent.tsx
"use client";
// ... actual page content here
```

### File Naming Conventions

| File Type | Location | Naming |
|---|---|---|
| Page wrapper | `src/app/<group>/<route>/page.tsx` | `page.tsx` |
| Page content | Same folder as `page.tsx` | `<Feature>PageContent.tsx` |
| Page-specific subcomponent | Same folder as `page.tsx` | `<Name>.tsx` (e.g., `DeleteUserButton.tsx`) |
| Shared cross-page component | `src/components/<feature>/` | `<Name>.tsx` |
| Common layout primitive | `src/components/common/` | PascalCase |

**🛑 Page-specific components do NOT live in `src/components/`.** They co-locate with their `page.tsx`. The `src/components/<feature>/` folder is for **cross-page** components ONLY.

### loading.tsx Placement

Must be INSIDE the portal subdirectory, not at route group level:

- ✅ `(admin)/admin-portal/loading.tsx`
- ❌ `(admin)/loading.tsx` — wraps entire layout including Navbar

### proxy.ts vs middleware.ts (Next.js 16 Note)

**🛑 IMPORTANT:** Next.js 16 renamed the middleware convention.

- The kit ships `src/proxy.ts` — **this is correct for Next.js 16+**
- Older docs (including some kit docs) may reference `middleware.ts` — **the on-disk code is the source of truth**
- DO NOT propose renaming `proxy.ts` to `middleware.ts` — that's the Run 001 Lesson 1 trap

### Nav Surfaces — Server Shell + Client Island

> 🔧 **RECONCILED (L11, L12, L19, L20, L22):** When a nav needs an interactive widget (theme toggle, hamburger, user menu), do NOT make the whole nav `"use client"`. Keep the nav a **Server Component shell** rendering small **client islands** (`<ThemeToggle />`, `<MobileNav />`, `<UserMenu />`). Additional defaults learned the hard way:
> - **Marketing nav needs a mobile hamburger** (the Log-in link is a critical destination); **portal nav** only needs one if it has real destinations.
> - **Theme toggle belongs on *every* navbar surface**, including marketing.
> - "No auto-redirect on a public route" does **not** mean "no auth state" — a public page must still reflect logged-in state (portal link + logout) or it strands the user.

---

## 6. State Management — Patterns

### Zustand For App-Level State

- `src/store/useAuthStore.ts` — auth state (kit-provided; `user: SupabaseUser | null`, role, `isAuthenticated`, `isLoading`, derived `isAdmin/isSuperadmin/isMember`, `login`, `logout`)
- New stores live in `src/store/use<Feature>Store.ts`
- Stores are singletons — survive across component renders
- Use selectors to avoid unnecessary re-renders: `useStore((s) => s.field)`

### useState For Local UI State

- Form inputs (until you move to react-hook-form)
- Dropdown open/closed states
- Tabs current selection
- Any state confined to a single component tree

### Server Components — Server State

- Use Server Components for data that comes from the database
- Pass data down to Client Components via props
- Don't fetch in Client Components if a Server Component could do it

### When To Reach For Each

```
Auth state, current user, role flags?
  → useAuthStore (kit-provided, do NOT duplicate)

App-level state used by 2+ components (chat messages, agent selection)?
  → New Zustand store in src/store/

Form input values?
  → useState OR react-hook-form (preferred for forms with validation)

Single-component UI state (open/closed, hover, etc.)?
  → useState

Data from the database for initial render?
  → Server Component, pass via props
```

---

## 7. Tests — Baseline & Conventions

### Baseline

> 🔧 **RECONCILED (L26, §2 harvest):** v2's documented baseline was **81 tests / 11 suites** (table below). Tests for deleted code die with their source — that is correct, NOT a regression. After a cleanup that removes demo/superadmin source, the gate criterion is **"all remaining tests pass,"** never "≥ the old count." Don't predict post-deletion counts from historical session logs (they drift); run the baseline fresh.

**v2 baseline: 81 tests, 11 suites, 0 failures.**

| Suite | Tests |
|---|---|
| `actions.test.ts` (protectPage) | 7 |
| `get-user-role.test.ts` | 4 |
| `proxy.test.ts` | 3 |
| `superadmin/actions.test.ts` | 14 |
| `superadmin/AddUserForm.test.tsx` | 6 |
| `superadmin/EditUserForm.test.tsx` | 6 |
| `superadmin/SuperadminPortalPageContent.test.tsx` | 6 |
| `admin/actions.test.ts` | 11 |
| `admin/AddMemberForm.test.tsx` | 6 |
| `member/ProfileForm.test.tsx` | 8 |

> v3 keeps the superadmin suites (superadmin stays in the generic kit).

### Running Tests

```bash
npm test
```

### The Ironman Rule

> **Do not merge changes that break any test. Fix the test or fix the code — never comment out tests.**

### Test Conventions

- Tests live in `src/__tests__/` mirroring the source structure
- Component tests: `*.test.tsx`
- Logic tests: `*.test.ts`
- **Use Jest + React Testing Library** *(not Vitest — see note)*
- Pagination elements are `role="button"` (NOT `role="link"`)
- For impossible-to-mock APIs (clipboard, etc.), use **behavior-based assertions** (test the visible UI state, not the implementation) — see Run 001 Phase 5.5 lesson

> 🔧 **RECONCILED (L8):** The kit runs **Jest** (`package.json: "test": "jest"`, with `ts-jest` + `jest-environment-jsdom`). The "doctrine says Vitest" defect is **not in this handbook** — it lives in the FFM project `CLAUDE.md` template, which must be corrected to reference Jest. Recon must grep `package.json scripts.test` rather than trust any doc's runner claim. NOTE: adding ESM-only UI deps (e.g. `react-markdown` v10+) requires patching both `jest.config.js` (transform + `transformIgnorePatterns`) and `jest.setup.ts` (browser-API polyfills) — the kit's default config handles neither.

### When You Add New Tests

- Mirror the source path under `src/__tests__/`
- Test intent, not implementation (Rule K9)
- A test that can't fail when business logic changes is wrong
- If mocking gets ugly, switch to behavior-based assertions

---

## 8. Build & Framework Notes

### Framework Versions

- **Next.js:** 16.2.1 (App Router)
- **React:** 19.2.4
- **TypeScript:** strict mode, no `any`

### Build Commands

```bash
npm run dev          # Development
npm test             # Run test suite (Jest)
npm run build        # Production build
npx tsc --noEmit     # Type check only
```

### Verification Triad (Run Before Phase Boundaries)

1. `npx tsc --noEmit` — must exit zero
2. `npm test` — must pass all baseline + new tests
3. `npm run build` — must complete cleanly **with no env vars set** (cold build)

> 🔧 **RECONCILED (L13, L25):** v3's `tsconfig.json` excludes `agent_docs/**` so FFM template `.ts` stubs (intentional unresolved placeholders) don't get pulled into `tsc`. Also: between route-deletion batches, run `rm -rf .next` before any `tsc --noEmit` smoke — a stale `.next/types/validator.ts` cache references already-deleted routes and produces false failures indistinguishable from real orphaned imports.

### Environment Variables

> 🔧 **RECONCILED (L9, harvest §5):** v3 ships **`.env.local.example`** with the **current** Supabase var names (Q4-2025 naming): `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` — **not** the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`. v2 shipped no example file at all. For any env validation, read `.env.local.example` AND grep `process.env.*` in `src/` to ground-truth what the code actually reads — never trust doc-specified env names.

### Entry CSS

> 🔧 **RECONCILED (L14, harvest §5/§7):** v3 ships the entry stylesheet as **`globals.css`** (plain CSS), not `.scss`. v2's `.scss` existed only to carry one Strapi-specific block from an unrelated project; the `@apply` directives work identically in plain CSS. The token contract (light + dark, all semantic tokens) ships pre-installed in `globals.css` — see the Global Design System Handbook and Theme Library.

### Server / Client Component Boundary

**🛑 CRITICAL LESSON FROM RUN 001:**

When a `"use client"` component imports a runtime value (enum, const, function) from a module, the ENTIRE module gets bundled for the client. If that module has server-only imports (`next/headers`, `supabase/server`, server actions), they leak into the client bundle and **`next build` fails**.

**To cross the boundary safely:**

- Extract shared values (enums, consts, types) to a module with ZERO server-only deps
- Example: `AppRole` enum lives in its own file (`src/utils/app-role.ts`), NOT mixed with `getUserRole()` which imports `next/headers`
- `import type { Foo }` is always safe (erased at runtime); a value-level `import { Foo }` loads the whole source module — verify it has no server-only imports first

**Files Already Properly Separated (v3):**

- `src/utils/get-user-role.ts` — exports `getUserRole()` (server-only); re-exports `AppRole`
- `src/utils/app-role.ts` — exports `AppRole` enum (universal — safe in client components)

### Login Error Handling

**Use `.catch()` chains, NOT `try/catch`:**

```typescript
// ❌ Wrong — Next.js dev overlay intercepts thrown errors before try/catch
try {
  await login(...)
} catch (e) { /* ... */ }

// ✅ Right
login(...).catch((e) => { /* ... */ })
```

### Edit Form Redirect Pattern

Use `router.refresh()` BEFORE `router.push()`:

```typescript
router.refresh();   // bust Next.js router cache
router.push("/admin-portal");
```

Without `router.refresh()`, dashboards show stale data after redirect.

### Theme Conventions (Semantic Tokens Only)

> 🔧 **RECONCILED (L16, L17 + Global Design System Handbook §2/§3/§10):** v1.0 of this section **taught numbered colors** (`bg-white dark:bg-slate-800`, `bg-white dark:bg-zinc-900`, `bg-slate-100 dark:bg-slate-500`). That is the single rule the design system exists to prevent — numbered classes ignore the token file and silently break theming. Corrected below. The replacement values are the ones the proving-ground project actually shipped (inputs on `bg-muted`, surfaces on `bg-popover`/`bg-card`).

**Never use numbered Tailwind colors in components.** Read semantic utilities that resolve through the token file:

| Surface | ❌ Old (numbered) | ✅ v3 (semantic token) |
|---|---|---|
| Dialog / Dropdown / Popover | `bg-white dark:bg-slate-800` | `bg-popover text-popover-foreground border-border` |
| Card / elevated panel | `bg-white dark:bg-zinc-800` | `bg-card text-card-foreground` |
| Toast (Sonner) | `bg-white dark:bg-zinc-900` | inherits tokens via Sonner's `theme` integration — no numbered classes |
| Input | `p-6 bg-slate-100 dark:bg-slate-500 dark:text-white` | `p-6 bg-muted text-foreground` |
| Borders | `border-gray-200 dark:border-gray-700` | `border-border` |
| Secondary text | `text-gray-500 dark:text-white` | `text-muted-foreground` |

**Dark-mode readability (L16):** a style-tile pass is **necessary but not sufficient**. Before locking tokens, do a real-screen `npm run dev` check of cards-on-background, secondary text, and form fields with placeholders. v3's default tokens already bake in the readability fix (background darker than card so panels elevate; muted-foreground lifted; borders firmed). Full doctrine: Global Design System Handbook §6/§7; values: Theme Library.

---

## 9. Common Gotchas

### Gotcha 1: PostgREST Nested Selects Across Sibling Tables

**🛑 Don't:**
```typescript
supabase.from("profiles").select("*, user_roles(role)") // Will silently return empty role
```

**✅ Do:**
```typescript
const [{ data: profiles }, { data: roles }] = await Promise.all([
  supabase.from("profiles").select("*"),
  supabase.from("user_roles").select("user_id, role"),
]);
// Merge in JS
```

### Gotcha 2: Don't Manually Insert Into `user_roles` Or `profiles`

The DB trigger handles it. Manual inserts cause duplicate-key errors.

### Gotcha 3: NavigationLoadingProvider — PERMANENTLY DELETED

Was deleted in v0.4.1. Rendered `fixed inset-0 z-[9999] bg-white` on every `<a>` click, covering the Navbar. **Do NOT recreate.**

### Gotcha 4: Signup Metadata Key

When creating users via `auth.admin.createUser()`, the metadata key MUST be `full_name` (not `name`, `fullName`, etc.). The DB trigger reads this exact key.

### Gotcha 5: Service Role Bypasses RLS

Using `createAdminClient()` (service role) bypasses ALL RLS policies. Use ONLY in API routes that need elevated permissions. Never use service role from the client.

### Gotcha 6: Stale Kit Docs Vs Live Code

When kit docs reference framework conventions (file names, exports) that don't match on-disk code, **the on-disk code is the source of truth** (especially for framework conventions like `proxy.ts` vs `middleware.ts`). Surface the doc-vs-code conflict to the operator; don't silently "fix" the code. *(This handbook's v1.1 reconciliation is the inverse case: where the **handbook** was wrong about good-intent design, the **code** was brought up to match — see the change-log.)*

### Gotcha 7: Client Directive Case

`"use client"` is case-sensitive. A `"use Client"` typo (capital C) silently renders the file as a Server Component — it may "work" only because the client state is trivial. Grep for directive-case at every version-up.

---

## 10. What's NOT In The Kit (Build Yourself)

These are project-specific and the kit does NOT provide them. The service layer is for these things:

- **Domain-specific data services** (chat messages, agent profiles, agent instructions, products, orders, etc.)
- **Domain-specific UI screens** (chat interface, mission control, dashboards specific to a project)
- **Project-specific Zustand stores** (chatStore, agentStore, etc.)
- **Domain database tables and RLS policies** (anything beyond `profiles` and `user_roles`)
- **External API integrations** (Stripe, third-party APIs, custom wrappers)
- **Background jobs, cron, webhooks** (not in the kit)
- **Email sending** (Supabase handles auth emails; nothing else)
- **Real-time subscriptions** (Supabase realtime is available but not wired)

These belong in the service layer (`src/services/`) and project-specific stores (`src/store/use<Feature>Store.ts`).

> 🔧 **RECONCILED (L31):** v2's `src/services/` shipped an 11-file **demo cascade** (`postServices.ts`, `jsonsrvPostServices.ts`, the matching stores/types/components/utils, and demo routes) — tutorial filler under product directories, inherited by every clone. v3 ships `src/services/` **clean**. If a future kit version wants to retain examples, isolate them to a gitignored `examples/` folder, never under product paths.

---

## 11. Quick Reference — "Should I Author This?"

| If you're about to author... | The kit already provides... | Verdict |
|---|---|---|
| `authService.ts` | Complete Supabase SSR auth stack | 🛑 DO NOT BUILD |
| Custom role checker | `useAuthStore` flags + `getUserRole()` | 🛑 DO NOT BUILD |
| Custom session refresh | `src/proxy.ts` + middleware utils | 🛑 DO NOT BUILD |
| User CRUD | Three working portals (superadmin/admin/member) | 🛑 DO NOT BUILD (extend if needed) |
| Login/signup UI | `LoginForm` and `RegisterForm` in `src/components/auth/` | 🛑 DO NOT BUILD |
| App shell layout | `AppShellPage` primitive | 🛑 DO NOT BUILD |
| Sidebar/navbar | `Sidebar`, `AdminSidebar`, `SuperadminSidebar`, `Navbar` variants | 🛑 DO NOT BUILD (use as base, extend) |
| Pagination | `PaginationControls` in `common/` | 🛑 DO NOT BUILD |
| Theme toggle | `ThemeToggle` in `global/` (token-driven) | 🛑 DO NOT BUILD |
| Toast notifications | Sonner pre-configured | 🛑 DO NOT BUILD |
| Form with validation | Shadcn `Form` + `react-hook-form` + `zod` | 🛑 DO NOT BUILD wrappers |
| Project-specific chat service | Not in kit | ✅ Build in `src/services/` |
| Project-specific data store | Not in kit | ✅ Build in `src/store/` |
| Project-specific UI screens | Not in kit | ✅ Build in `src/app/<group>/` |

---

## 12. Handbook Maintenance

This handbook is a **living document**. Updates happen at three triggers:

1. **After every Factory run** — Phase 8 retrospective surfaces lessons; structural ones land here
2. **When kit baseline changes** — version bumps update relevant sections (e.g., framework upgrades)
3. **When the operator promotes a kit-level change** — accepted Kit Improvement Proposals land here

### Update Discipline

- Mark version bumps at the top with date
- **Ground-truth before publishing:** every file/flag/path the handbook names must exist on disk. A claim that isn't true on disk is a bug, not documentation. (This is the meta-lesson of the v1.1 reconciliation.)
- Add new sections rather than rewriting where possible (preserve doctrine history)
- Cross-reference Run lessons in the relevant section
- If something becomes obsolete, mark it as such — don't delete (history is doctrine)

---

## 13. Cross-References

This handbook is the **canonical entry point** for kit knowledge. It cross-references but does NOT duplicate:

- **`agent_docs/APP_FACTORY/AUTH_MANUAL.md`** — full auth implementation details (deep dive)
- **`agent_docs/APP_FACTORY/DATABASE_MANUAL.md`** — full DB setup, RLS policy templates
- **`agent_docs/APP_FACTORY/UI-UX-BUILDING-MANUAL.md`** — full UI patterns, Rule Zero (mobile-first)
- **`agent_docs/APP_FACTORY/STATE_MANAGEMENT_MANUAL.md`** — Zustand patterns deeper
- **`agent_docs/APP_FACTORY/design-system/GLOBAL_DESIGN_SYSTEM_HANDBOOK.md`** — the token contract, theming method, anti-patterns (the authority §8 and §2 role colors defer to)
- **`agent_docs/APP_FACTORY/design-system/THEME_LIBRARY.md`** — named theme value-sets (Mist / Slate / Bright / Dark-deep) and how to add more
- **`agent_docs/STARTER_KIT/COMPONENT_REGISTRY.md`** — scannable component lookup (sibling file)
- **`agent_docs/STARTER_KIT_FEEDBACK.md`** — Run-specific lessons (some promote into this handbook)

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.1 | 2026-06-08 | **v3 reconciliation pass.** Closed every confirmed handbook-vs-disk gap from Run 001: §8 Theme Conventions migrated from numbered colors to semantic tokens (L17); §2 role colors converted to `--role-*` tokens, admin/destructive collision resolved (L17 + GDSH §10); `AppRole` location made consistent at `app-role.ts` (L1); derived flags + `user` typing marked v3-implemented (L5, L6); `ThemeToggle` naming + token migration flagged (naming-drift); clean route table + cold-build + `.env.local.example` + `globals.css` entry + tsconfig exclude documented (L9, L13, L14, L24, L31, L32); nav server-shell/client-island defaults added (L11/12/19/20/22); directive-case gotcha added (L34); design-system cross-refs added. Two ⚑ operator decisions pending: role-token vs numbered-exception, and the canonical theme-toggle name. |
| 1.0 | 2026-05-31 | Initial handbook authored from Run 001 lessons + kit v0.4.1 evidence (partially aspirational — corrected in 1.1). |

---

🥄 *Part of Stark Industries — App Factory v1.1 doctrine.*
