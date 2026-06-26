# RECON REPORT — Starter Kit v3 · kit-hardening

> **Run by:** Claudy (Engineer), 2026-06-26, for the Architect grounding the kit-hardening work (incl. the mobile-menu / Gate-M task).
> **Skill:** `stark-recon` v1.1. **Mode:** read-only of the inspected codebase. No source changes, no git. The only write is this report file.
> **Governing law:** disk wins. Every doc-vs-disk mismatch is flagged. Findings labeled EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION.
> **Repo:** `nextjs16-starter-supabase-role-access-2026-v3` @ branch `main`. Build cold (no `.env.local`) → **EXIT 0**.

---

## Section 0 — Day-0 Ground-Truth Sweep

**S0.1 — COMPONENT_REGISTRY-named files vs disk (the #1 lie class):**
- **MISSING (registry claims they exist):**
  - `src/components/common/AppShellPage.tsx` — **GAP.** Registry decision-tree's answer for "sidebar + main app shell (built-in mobile drawer)". Does **not** exist here. EVIDENCE: `ls → MISSING`.
  - `src/components/ui/sheet.tsx` — **GAP.** Registry's "mobile slide-over" primitive. Does **not** exist. EVIDENCE: `ls → MISSING`.
  - `src/components/global/NavbarHome.tsx`, `NavbarSuperadmin.tsx` — **GAP.** Registry + UI-UX-manual name these nav variants; neither on disk. EVIDENCE: `ls → MISSING`.
- **Naming drift:** registry + UI-UX-manual call it `ThemeToggler`; disk has **`ThemeToggle.tsx`** — DRIFT. EVIDENCE: `src/components/global/ThemeToggle.tsx` exists, `ThemeToggler.tsx` MISSING.
- **Confirmed present** as claimed: `Page/Row/Box/Container/Main/BackButton/Spinner/PaginationControls`, `Navbar`, `Sidebar/AdminSidebar/SuperadminSidebar`, `LoginForm/RegisterForm/AuthTabs/Logout`, `dialog.tsx`. EVIDENCE: `ls → EXISTS`.
- The registry is for **"Stark SaaS Starter v0.4.1"** — a richer baseline than this v3 kit. Treat its primitive list as **aspirational** for this repo. INFERENCE.

**S0.3 — Forbidden-zone greps:**
- `dangerouslySetInnerHTML` = **0**. EVIDENCE.
- `user_metadata.(is_|role)` (role-READ smell) = **0**. EVIDENCE. (Authz never reads role from metadata — see §3 / Surprises.)
- `: any` / `as any` = **55 total**, but **only 2 in real app code**: `src/utils/supabase/server.ts:6` `(await cookies()) as any`; `src/components/ui/command.tsx:35` `{children as any}`. The other 53 are test-mock casts under `src/__tests__/`. EVIDENCE.

**S0.4 — Route paths by `find`:** `(superadmin)` group **EXISTS** (kept tier — NOT deleted; do not confuse with the skill's Cyber-Pharma example where it was removed). EVIDENCE: `find src/app -maxdepth 1 -type d "(*)"` → `(admin) (auth) (members) (public) (superadmin)`.

**S0.5 — Test runner:** `"test": "jest"`, `jest@^30.0.5`, plus `jest-mock` pinned `30.4.1` (override). NOT Vitest. EVIDENCE: `package.json`.

**S0.6 — Env names (example + code agree):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (Q4-2025 Supabase naming — NOT legacy anon/service_role). EVIDENCE: `.env.local.example` ∩ `grep process.env src/` match exactly.

**S0.7 — Build route table:** cold `npm run build` EXIT 0, 18 routes, all prerenders pass. Static (○): `/`, `/_not-found`, `/auth`, `/error`. Dynamic (ƒ): the 3 portals + nested + `/profile` + 5 `api/auth/*` + Proxy middleware. **No** `/demo`, `/template`, `/api/ghl`, `/booking`, `/users`. EVIDENCE.

---

## Section 1 — Stack Versions

| Layer | Version (spec → resolved) | Note |
|---|---|---|
| Next.js | `^16.2.1` → **16.2.6** | App Router; **`proxy.ts`** (not middleware.ts); 16.2.6 = patched for the May-2026 middleware CVEs. EVIDENCE. |
| React / react-dom | `^19.2.4` | EVIDENCE. |
| TypeScript | `^5` (resolved 5.5.4) | strict. EVIDENCE. |
| Tailwind | `^3.4.1` | → token mechanic = **HSL + `tailwind.config.ts`** (NOT @theme/OKLCH). EVIDENCE. |
| Test | `jest@^30.0.5` + `jest-mock 30.4.1` (override) | NOT Vitest. EVIDENCE. |
| Stripe | `^22.1.0` | **installed but UNUSED in `src/`** — see Surprises. EVIDENCE. |
| Zustand / Zod | `^4.5.4` / `^3.23.8` | EVIDENCE. |
| Node | **not pinned** (no `.nvmrc`, no `engines`) | GAP. |

---

## Section 2 — Kit Structure vs Handbook

- `src/services/` — **ABSENT.** No service layer. Auth/data consumed directly via server actions + supabase clients. EVIDENCE: `ls src/services → ABSENT`.
- `src/store/useAuthStore.ts` — present. `src/lib/utils.ts` — standard `cn()` (clsx+twMerge). EVIDENCE.
- `src/types/` — only `tailwind-grid-auto-fit.d.ts` + `tailwind-merge.d.ts` (ambient module decls). **No domain types here**; `AppRole` lives in `src/utils/app-role.ts:1` (enum), `UserWithRole` is inline in superadmin actions. INFERENCE/EVIDENCE.
- `src/utils/`: `app-role.ts`, `get-user-role.ts`, `supabase/`. `AppRole` exported from `app-role.ts`, re-exported by `get-user-role.ts:4`. EVIDENCE.
- Route groups: `(admin) (auth) (members) (public) (superadmin)`. `src/proxy.ts` present (`export async function proxy` + `config`), `middleware.ts` absent — correct for Next 16. EVIDENCE.
- **Component inventory** (actual): `common/{BackButton,Box,Container,Main,Page,PaginationControls,Row,Spinner,SpinnerLarge}`; `global/{Navbar,NavbarLoginReg,PublicNav,PublicNavAuthSection,ThemeToggle}`; `layout/{Sidebar,AdminSidebar,SuperadminSidebar}`; `auth/{AuthTabs,LoginForm,Logout,RegisterForm}`; `ui/{18 shadcn primitives}`; plus `admin/AdminBookingList`, `members/MemberEventList`, `dashboard/DashboardCard`. EVIDENCE.

---

## Section 3 — Auth Pattern

- **User read:** `useAuthStore` (client) + `supabase.auth.getUser()` (server actions/routes). EVIDENCE.
- **Role resolved:** `getUserRole(userId)` → `public.user_roles` table; `AppRole` enum @ `src/utils/app-role.ts`. EVIDENCE.
- **Auth service:** **NONE** — `src/services/` absent, zero `authService` refs. **Do NOT author a wrapper.** EVIDENCE.
- **Route gates:** `protectPage([AppRole.X])` at line 12 of each portal layout — `(members)` MEMBER, `(admin)` ADMIN, `(superadmin)` SUPERADMIN. Defined at `src/utils/supabase/actions.ts:8`. EVIDENCE.
- **`useAuthStore` shape (full):** `{ user: SupabaseUser|null, role: AppRole|null, isAuthenticated, isAdmin, isSuperadmin, isMember, isLoading, login, logout }` — **all three role flags present (incl. `isSuperadmin`)**, persisted via `persist` (`name: "auth-store"`). EVIDENCE: `src/store/useAuthStore.ts`. (No `: any` in the store — clean.)
- **`user_metadata`:** role-READ smell = 0 (authz reads `user_roles`). BUT role is *written* into `user_metadata` at user creation — vestigial; see Surprises #2. EVIDENCE.

---

## Section 4 — Design Reality

- **Tokens:** `src/app/globals.css` (**CSS**, not SCSS — no extension-mismatch task). HSL-no-wrapper `:root` + `.dark`, mapped via `tailwind.config.ts`. `darkMode: ["class"]`. EVIDENCE.
- **Brand:** **NEUTRAL placeholder** tokens (`globals.css:36 "/* brand — NEUTRAL placeholder (swap per project) */"`); custom `--nav-bg`/`--nav-foreground` nav tokens. EVIDENCE.
- **Font:** **Inter** via `next/font/google` (`src/app/layout.tsx:2`). (NOT Saira — that was Cyber Pharma; don't carry it over.) EVIDENCE.
- **Theme toggle:** `ThemeToggle` on `Navbar`, `PublicNav`, `NavbarLoginReg` (3 navbar surfaces — all covered); `ThemeProvider` at `src/app/providers/ThemeProvider.tsx` (next-themes). EVIDENCE.
- **Numbered/literal colors = 2 real sites** (broad grep's "5" included 3 false positives on shadcn animation fragments): `MemberEventList.tsx:52` (`divide-gray-200`, `bg-white`) + `:75` (`divide-gray-200`) — **and this file is an orphan** (see Surprises); plus `dialog.tsx:24` `bg-black/80` (standard shadcn modal scrim). EVIDENCE. **DRIFT** vs prior session/RECOVERY claim of "numbered-color grep ZERO."

---

## Section 5 — Database

- **No `supabase/migrations/`** — single `supabase/setup.sql`. EVIDENCE.
- **Tables:** `public.user_roles`, `public.profiles`. Enum `public.app_role ('superadmin','admin','member')`. EVIDENCE.
- **Trigger:** `handle_new_user()` SECURITY DEFINER (setup.sql:87) — inserts **hardcoded `'member'`** into `user_roles`, and a `profiles` row with `full_name = NEW.raw_user_meta_data ->> 'name'`. EVIDENCE.
- **RLS:** enabled both tables; own-role SELECT, own-profile SELECT/UPDATE; inserts via trigger/service-role only. setup.sql:22 states plainly: *"This is the source of truth for authorization — NOT user_metadata."* EVIDENCE.

---

## Section 6 — Skills / Security / Env

- **Launch CWD = repo root** (`pwd` confirmed). Skills resolve from `agent_docs/.claude/skills/` (`frontend-design`, `skill-creator`, `stark-frontend-first`, `webapp-testing`) — scoped to work under `agent_docs/`. `_SKILLS/` holds `stark-recon-skill-v1.1`, `stark-repo-security-skill-v1.1`, `starter-kit-cleaner-skill`. No `.claude/skills` at repo root. EVIDENCE.
- **Security:** no `agent_docs/security/` ledger. `npm audit` = **18 moderate** (dev toolchain — eslint/jest tree). EVIDENCE.
- **Root files:** `CLAUDE.md` (Stark v3.0), `WINDSURF.md`. **No** `AGENTS.md` / `GEMINI.md` / `PROJECT_POINTER.md`. EVIDENCE.
- **Env (verified):** the 4 vars in §0.6. EVIDENCE.

---

## Section 8 — Demo / Tutorial Scaffolding & Residue

- Third-party demo APIs (jsonplaceholder/etc.) = **0**. Cross-project residue (`coral|owedbook|cyberize|cyberpharma|ghl|hooktest`) = **0**. EVIDENCE. (The v3 clean-ancestor work held.)
- API routes: only `auth/{confirm,login,logout,signup,superadmin-add-user}`. EVIDENCE.
- **BUT — 3 orphan components, 0 importers** (likely demo/dashboard residue): `dashboard/DashboardCard.tsx`, `members/MemberEventList.tsx`, `admin/AdminBookingList.tsx`. See Surprises #1.

---

## Section 9 — FFM Packaging & Compile Scope

- `tsconfig.json exclude: ["node_modules", "agent_docs/**"]` ✓. EVIDENCE.
- 3 `.ts` template stubs under `agent_docs/.claude/skills/stark-frontend-first/templates/` — all inside the excluded tree, no tsc-trip risk. EVIDENCE.
- Jest `roots: ['<rootDir>/src']` — scoped to src, won't pick up agent_docs/_SKILLS. EVIDENCE.
- **Minor:** `_SKILLS/**` is **not** in tsconfig `exclude`. No `.ts/.tsx` lives there today (no active risk), but a future `.ts` under `_SKILLS/` would enter compile scope. Defensive flag. INFERENCE.

---

## Section 10 — Surprises (the gold)

1. **3 orphan components (0 importers).** EVIDENCE (`grep -rln` excl. self/tests → no hits):
   - `members/MemberEventList.tsx` — booking/event demo; carries the kit's **only literal colors** (`gray-200`, `bg-white`) **and** a `<img>` (no-img-element). Deleting it zeroes the numbered-color count.
   - `admin/AdminBookingList.tsx` — booking demo; also carries an `<img>`.
   - `dashboard/DashboardCard.tsx` — unused dashboard starter pattern.
   - **QUESTION:** delete all three as demo residue, or keep `DashboardCard` as a Phase-2 dashboard starter?

2. **"Smart trigger" doc-vs-disk DRIFT (security-flavored).** `src/__tests__/superadmin/README.md:96/109` CLAIMS *addUser packs role into `user_metadata` so the "smart trigger receives both values."* The **actual** `handle_new_user()` (setup.sql:94-96) **hardcodes `'member'`** and never reads role from metadata — role is set in a **second step** (the app updates `user_roles` after creation). So the `role` packed into `user_metadata` is **vestigial/unconsumed**. **No auth vuln** (authz reads `user_roles`, per setup.sql:22), but the README's claim is **FALSE** against the SQL. EVIDENCE.

3. **Metadata key mismatch — potential real bug.** Trigger reads `raw_user_meta_data ->> 'name'`; admin/superadmin `addUser` write `user_metadata: { full_name, role }`. If the signup/create paths write **`full_name`** (not `name`), `profiles.full_name` is **NULL at creation** (only fixed later by a profile update). **QUESTION/INFERENCE:** verify the exact metadata key each creation path writes vs the trigger's `'name'` read.

4. **Dual superadmin user-creation paths.** Both an **API route** `api/auth/superadmin-add-user/route.ts` AND a **server action** `superadmin-portal/actions.ts:addUser` exist; build surfaces `/api/auth/superadmin-add-user` AND `/superadmin-portal/add-user`. **QUESTION:** is the API route live or superseded by the server action? EVIDENCE.

5. **Profile implemented twice:** `(admin)/profile/` (route `/profile`) and `(members)/members-portal/profile/` (route `/members-portal/profile`) — separate `ProfileForm.tsx` each; no superadmin profile. Route-placement inconsistency. EVIDENCE.

6. **Stripe `^22.1.0` installed but UNUSED** in `src/` — dead dep or payments-phase prep. EVIDENCE.

7. **18 moderate `npm audit` vulns** (dev toolchain). EVIDENCE.

8. **2 real `as any` (latent risk):** `server.ts:6 (await cookies()) as any` — Next-16-cookies vs `@supabase/ssr@0.6.1` type workaround (already parked as **KIP-1**: modernize to `getAll/setAll`); `command.tsx:35 {children as any}` (shadcn primitive). EVIDENCE.

9. **COMPONENT_REGISTRY drift (consolidated):** names `AppShellPage`, `Sheet`, `NavbarHome`, `NavbarSuperadmin` (none exist) and `ThemeToggler` (actual `ThemeToggle`). EVIDENCE.

---

## Section 11 — Nav & Auth-State

- **4 nav-ish surfaces:** `Navbar` (portal top), `PublicNav` (marketing), `NavbarLoginReg` (auth pages), `PublicNavAuthSection` (auth-state island). ThemeToggle on the 3 navbars. EVIDENCE.
- **NO mobile menu anywhere** — zero hamburger/`Sheet`/`md:hidden` nav toggling. EVIDENCE (`grep → NONE`).
- **🔴 Gate M / Rule Zero VIOLATION (the headline for the mobile-menu task):** all **3 portal layouts** render the sidebar as `hidden md:block h-auto flex-shrink-0 border-4 w-[25rem]` with **no hamburger/trigger** → the `25rem` (wide) rail **vanishes below `md` with no way to open it**. EVIDENCE: `(admin)/layout.tsx:18`, `(members)/layout.tsx:18`, `(superadmin)/layout.tsx:18`. Per UI-UX Rule Zero + FFM §13.1 Gate M this is an automatic failure; a wide (≥20rem) rail should slide-over **below `lg`**, not be hidden at `md` with no trigger.
- **Public nav:** portal links reflow via `flex-wrap`/`order-*` (no hamburger) — functional but not a real mobile menu. EVIDENCE: `PublicNav.tsx`.

---

## Section 12 — Verification Predicates

| Predicate | Result |
|---|---|
| Numbered/literal colors | **2 real** (`MemberEventList` orphan) + 1 scrim (`dialog bg-black/80`). EVIDENCE. |
| `: any` in real app code | **2** (`server.ts:6`, `command.tsx:35`); 53 more in test mocks. EVIDENCE. |
| `user_metadata` role-READ smell | **0**. EVIDENCE. |
| `"use Client"` typo | **0**. EVIDENCE. |
| Tests | 11 suites (81/81 per prior verify this session). EVIDENCE. |
| Cold build | EXIT 0, 18 routes. EVIDENCE. |

---

## Section 13 — `src/` Tree (2 levels)

`app/{(admin),(auth),(members),(public),(superadmin),api,error,providers}` · `components/{admin,auth,common,dashboard,global,layout,members,ui}` · `lib` · `store` · `types` · `utils/supabase` · `__tests__/{admin,member,superadmin}`. `cn()` standard shadcn. EVIDENCE.

---

## Recommendation to Architect

**Write against these VERIFIED facts (no re-verification needed):**
Next 16.2.6 / React 19.2.4 / TS 5 strict / **Tailwind 3.4.1 HSL+config** / **Jest** (never "Vitest"); token system = `globals.css` (CSS, HSL, `darkMode:["class"]`, **Inter** font, **NEUTRAL placeholder** brand); auth = `useAuthStore` + `supabase.auth.getUser()` + `getUserRole`→`user_roles` + `protectPage` — **NO service layer (`src/services/` absent), do not author a wrapper**; `useAuthStore` exposes all 3 role flags incl. `isSuperadmin`; DB = 2 tables + `handle_new_user` trigger + RLS, **`user_roles` is the authz source of truth**; **env names verbatim** (URL / PUBLISHABLE_KEY / SECRET_KEY / SITE_URL); `proxy.ts` (Next 16, CVE-patched); 18 routes; **superadmin is a KEPT tier**.

**Doctrine DRIFT to reconcile (still wrong on disk):**
- COMPONENT_REGISTRY (v0.4.1 baseline) names `AppShellPage` / `Sheet` / `NavbarHome` / `NavbarSuperadmin` (none exist) and `ThemeToggler` (actual `ThemeToggle`). **The registry's mobile-menu answer assumes primitives this kit lacks** → the mobile-menu task is partly a **KIP** (build `Sheet`; optionally port `AppShellPage`), not a consume.
- `__tests__/superadmin/README.md` "smart trigger reads role from `user_metadata`" — false against `setup.sql`.

**Cleanup candidates (kit-hardening backlog):**
3 orphans (`DashboardCard`, `MemberEventList`, `AdminBookingList`); the only literal colors live in the `MemberEventList` orphan (delete → numbered-colors hit zero); Stripe dep (unused); 18 moderate audit vulns; vestigial `role`-in-`user_metadata` write; `_SKILLS/**` → tsconfig `exclude` (defensive).

**Open QUESTIONS before authoring:**
1. **Gate-M fix approach** (the decision pending pre-recon): Sheet-only drawer vs port `AppShellPage`; wide-rail breakpoint (keep `25rem`→slide-over below `lg`, or narrow the rail to persist at `md`); scope (portal sidebars only vs + public nav).
2. **Metadata key mismatch** (`name` vs `full_name`) — real bug at user creation?
3. **Dual superadmin user-creation paths** (API route vs server action) — which is canonical?
4. **`DashboardCard`** — delete as orphan, or keep as a dashboard starter?

---

🛑 Recon complete. No source changes. No git. Pure inspection.
