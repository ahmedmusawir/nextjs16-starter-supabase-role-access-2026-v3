# Next.js 16 Enterprise Starter Kit

**A production-grade Next.js 16 + Supabase foundation with database-authoritative RBAC, a full test rig, and factory-standard documentation.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind%203.4-ShadCN-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Jest-76%20passing%20%2F%2010%20suites-C21325?logo=jest&logoColor=white)](#verify-the-build)
[![Audit](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-2EA043)](./docs/SECURITY.md)
[![Node](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs&logoColor=white)](.nvmrc)

---

## Why This Exists

Every new application started the same way: rebuild authentication, rebuild role checks, rebuild the test harness, rediscover the same edge cases. The work was never interesting and it was never quite the same twice, which is the worst combination — high cost, low reuse. This kit is that foundation built once, hardened through production use, and kept as the spawn point for every application in my App Factory, an AI-augmented delivery methodology where the groundwork is a solved problem and the actual product work starts on day one.

The core design decision is a division of responsibility this codebase treats as doctrine: **Next.js is the receptionist, Postgres with Supabase RLS is the vault guard.** The UI decides what a user *sees* — which nav links render, which portal loads, which buttons appear. The database decides what a user can *access*. Row Level Security is the final enforcement boundary, not a convenience layer stacked on top of client-side checks. If a permission model can be bypassed by opening DevTools, it is not a permission model.

---

## Screenshots

| | |
|---|---|
| ![Public landing page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785066122/image_2_x4lswz.png) | ![Admin Portal user management](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785066122/image_3_fddqsi.png) |
| *Public landing page. The marketing nav carries a theme toggle and a live auth-state region — a signed-in admin sees their identity and portal links instead of being stranded on a logged-out shell.* | *Admin Portal. Role-aware user management with color-coded role labels, edit and delete actions, and a command-palette sidebar. Superadmins are filtered out of the list by design.* |
| ![Shared profile page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785066122/image_5_ewbolg.png) | ![Add New Member form](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785066122/image_4_raecdc.png) |
| *One shared `/profile` route serving both admins and members. Email is deliberately read-only, the role is displayed from the database rather than client state, and password changes are self-service.* | *Member provisioning. Server-action backed form with inline field guidance and confirm-password validation; the created user's role and display name are applied by the database trigger at creation.* |

---

## What's Inside

- **Three-tier RBAC that the database owns.** `superadmin` / `admin` / `member` resolve from a dedicated `public.user_roles` table via `getUserRole()`, enforced server-side by `protectPage([...])` in every protected layout. Roles are never read from client state or `user_metadata` for authorization decisions.
- **Mark IV provisioning trigger.** `handle_new_user()` runs `SECURITY DEFINER` on every `auth.users` insert, reading the requested role and display name from `user_metadata` and writing both `user_roles` and `profiles` in one atomic step. Idempotent via `ON CONFLICT DO NOTHING`, so a re-run cannot double-insert. No second-step update to forget.
- **Six route groups, 16 routes.** `(public)`, `(auth)`, `(account)`, `(admin)`, `(members)`, `(superadmin)` — each protected group performs its role check in the layout, before any child renders.
- **Real test coverage on the security surfaces.** 76 Jest tests across 10 suites, targeting route protection, privilege-escalation denial, server actions, and role resolution — not component trivia.
- **Typed Zustand auth store.** `user` is a real `SupabaseUser | null`, with derived `isAdmin` / `isMember` / `isSuperadmin` flags. No `any` in the auth path.
- **Token-driven design system.** 66 HSL custom properties in `globals.css` with class-based dark mode, and a theme toggle reachable from every navbar including logged-out marketing pages. Swap the token values and the entire UI re-themes.
- **19 ShadCN-based UI primitives** plus 42 components total, including a kit-authored `Sheet` and an `AppShellPage` shell that gives every portal a persistent sidebar above `xl` and a hamburger slide-over below it.
- **Clean dependency audit.** `npm audit` and `npm audit --omit=dev` both report **0 vulnerabilities**, with the disposition and override rationale recorded in [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## Documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, trust boundaries, route-group structure, cache-invalidation model |
| [AUTHENTICATION.md](./docs/AUTHENTICATION.md) | Session handling, the SSR cookie adapter, login / signup / logout / confirm flows |
| [AUTHORIZATION.md](./docs/AUTHORIZATION.md) | The `AppRole` enum, role assignment, `getUserRole()`, and why authorization never lives in `user_metadata` |
| [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) | Schema walkthrough — enum, tables, RLS policies, the `handle_new_user()` trigger, first-superadmin promotion |
| [SECURITY.md](./docs/SECURITY.md) | Dependency audit disposition, override rationale, residual-risk notes |
| [TESTING.md](./docs/TESTING.md) | Jest configuration, mocking strategy, suite inventory, what the suite deliberately prioritizes |
| [MANUAL_TESTING.md](./docs/MANUAL_TESTING.md) | Operator walkthrough for verifying auth, roles, and provisioning against a live database |
| [LINTING.md](./docs/LINTING.md) | ESLint 9 flat-config setup and the project's rule dispositions |

---

## Quickstart

Requires **Node 22** (pinned in [`.nvmrc`](.nvmrc)) and a Supabase project.

```bash
git clone https://github.com/ahmedmusawir/nextjs16-starter-supabase-role-access-2026-v3.git
cd nextjs16-starter-supabase-role-access-2026-v3

nvm use            # reads .nvmrc → Node 22
npm install

cp .env.local.example .env.local
# then fill in the four values:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#   SUPABASE_SECRET_KEY
#   NEXT_PUBLIC_SITE_URL
```

Provision the database. **`supabase/setup.sql` is the one true schema file** — paste it into the Supabase SQL Editor and run it top to bottom. It creates the `app_role` enum, both tables, the RLS policies, and the trigger.

```bash
# Supabase Dashboard → SQL Editor → paste supabase/setup.sql → Run
```

Then promote your first superadmin once, by hand — no application surface can mint one:

```sql
UPDATE public.user_roles
SET role = 'superadmin'
WHERE user_id = '<your-auth-user-uuid>';
```

```bash
npm run dev        # http://localhost:3000
```

### Verify the build

```bash
npm run build      # → EXIT 0, 16 routes
npx tsc --noEmit   # → EXIT 0, no type errors
npm test           # → 76 passed, 10 suites
npm audit          # → found 0 vulnerabilities
```

The build is env-independent: it completes cleanly with no `.env.local` present, because client components defer Supabase client creation so static prerendering never breaks.

---

## Dependency notes

- **Stripe** (`stripe ^22.1.0`) — reserved for the payments phase (per-store
  subscriptions). Installed but intentionally not yet wired in `src/`. Do not remove.
- **Playwright** (`@playwright/test`) — installed with `test:e2e` scripts reserved for the
  E2E phase. No config or specs are committed yet; the suite above is Jest only.

---

Built by **Ahmed Musawir** — Software Architect & AI Engineer. This kit is the foundation layer of a larger AI-augmented delivery methodology. → [github.com/ahmedmusawir](https://github.com/ahmedmusawir)
