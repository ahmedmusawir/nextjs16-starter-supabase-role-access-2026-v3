# FABLE CODE REVIEW
## Stark Industries Factory Starter Kit

**Repository:** `nextjs16-starter-supabase-role-access-2026-v3`
**Branch:** `fable-code-review-13sep2026` · **Pinned SHA:** `0b1c060adfc4f0f7db7522e99acf5696075ca7e8`
**Date:** 2026-09-13 · **Review type:** source + controlled execution (production build run locally against a fake Supabase; no live database, no deployment).

---

## 1. Executive Assessment

This starter kit is well-organized, cleanly typed, and its **page-render** authorization (`protectPage` in each route-group layout) is correct and genuinely tested. The design slogan — "Next.js is the receptionist, Postgres/RLS is the vault guard" — is the right instinct.

But the kit does not implement the model it documents. Two independent, critical authorization holes sit at the exact trust boundaries a starter kit exists to get right:

1. **The privileged server actions have no authorization of their own.** `addUser`, `addMember`, `editUser`, and `deleteUser` all instantiate the **service-role** admin client (which bypasses RLS) and perform privileged mutations, while relying entirely on the layout's `protectPage` — which guards *page rendering*, not *action invocation*. I proved by controlled execution that an **unauthenticated** HTTP client can invoke `addUser` and create an **admin** account. The action IDs needed to do this are shipped in the public JavaScript bundle.

2. **The database trigger derives the authorization role from user-writable input.** `handle_new_user()` reads `role` from `raw_user_meta_data` (the user-controlled `data` field of Supabase sign-up) and writes it straight into `public.user_roles`. Because the publishable key ships to the browser and Supabase's `/auth/v1/signup` is public, anyone can self-register with `data.role = "superadmin"` and be minted a superadmin. `user_roles` is described as "the source of truth for authorization — NOT user_metadata," yet its contents are seeded from user_metadata.

Either hole alone is a full administrative-takeover path. They are not exotic; they are the textbook failure modes for App-Router server actions and for Supabase metadata-role triggers. The kit's own documentation actively asserts protections that the code does not contain (a "verify the caller is a superadmin … returns 403" step that exists nowhere), which makes the gap more dangerous, not less — downstream engineers will copy the pattern believing it is covered.

Two supporting problems compound this: the ESLint gate **crashes on a clean install** (so the "lint-green" claim is unverifiable and false today), and `npm audit` reports a **critical** Next.js RCE plus five other advisories, contradicting the README's "0 vulnerabilities" badge.

Because this is the baseline for many future applications, the multiplier risk is high. My recommendation: treat F1 and F2 as **P0**, do not spawn new Factory apps from this snapshot until both are fixed at the kit level, and correct the documentation that describes controls which do not exist.

What was actually verified: source of the whole app; a real Next.js production build; **real unauthenticated dispatch of two server actions** against a fake Supabase (E3 for F1). The database trigger / RLS / signup-escalation path (F2) was verified at source + SDK-transport level (E1) but **not** against a live Supabase — stated plainly so severity is not overread.

---

## 2. Snapshot and Review Boundary

- **Repository / branch / SHA:** as above; HEAD equals the pinned SHA; branch never switched.
- **Environment:** Windows 10; Node v24.14.1 (repo pins `>=22`); npm 11.13.0; Next 16.2.12; React 19.2.4; TypeScript 5.5.4; `@supabase/ssr` 0.6.1; `@supabase/supabase-js` 2.106.1.
- **Permissions / access:** local filesystem only. No `.env.local`, no live Supabase, no deployment, no cloud.
- **Review limitations:** RLS, the SQL trigger, and email-confirmation behavior could not be exercised against a real Postgres. ESLint could not run (crashes). See §12.
- **Change boundary:** only the three authorized files under `fable-review/` were created. No application code, test, migration, config, dependency, or git state was modified (confirmed in §15).

---

## 3. Architecture and Trust Map

**Roles:** `superadmin` / `admin` / `member`, as a Postgres enum `public.app_role` and a mirrored TypeScript `AppRole` enum.

**Role source of truth (claimed):** `public.user_roles` (one row per user). Read-side is correct: `getUserRole()` queries `user_roles` server-side; `protectPage()` gates each protected layout.

**Auth:** Supabase Auth via SSR cookies. `src/proxy.ts` → `updateSession()` refreshes the session on each request (it only refreshes; it does **not** authorize or redirect). Login/logout/signup/confirm are Route Handlers under `src/app/api/auth/*`.

**Supabase clients — three, with very different authority:**
| Client | Key | RLS | Where used |
|---|---|---|---|
| `client.ts` (browser) | publishable | enforced | client components |
| `server.ts` (SSR) | publishable | enforced | server components, `protectPage`, `getUserRole` |
| `admin.ts` (`createAdminClient`) | **secret / service-role** | **bypassed** | the four privileged server actions |

**Privileged operations (all in server actions, all using the service-role client):**
- `(superadmin)/superadmin-portal/actions.ts`: `getUsers`, `getUserById`, `addUser`, `editUser` (name **and role**), `deleteUser`.
- `(admin)/admin-portal/actions.ts`: `getUsers`, `getUserById`, `addMember`, `editUser` (name only), `deleteUser`.

**Page-level protection (correct):** `(admin)`, `(members)`, `(superadmin)`, `(account)` layouts each call `protectPage([...roles])` before rendering. This is real and tested — but it protects *rendering*, not the server actions those pages import.

**Database authority:** `user_roles` and `profiles` have RLS with **read-own** SELECT policies (plus `docs/migration_add_profiles.sql` adds superadmin-wide profile SELECT/UPDATE — note the two SQL files disagree, see F9). Crucially, `user_roles` has **no INSERT/UPDATE policy for users**, so a logged-in user cannot escalate by writing the table directly through PostgREST — good. All role writes flow through either the service-role client or the `SECURITY DEFINER` trigger.

**State store:** `useAuthStore` (Zustand, `persist` to `localStorage` key `auth-store`) holds `user`, `role`, and `isAdmin/isMember/isSuperadmin` flags. It is used for the `login`/`logout` fetch wrappers and to hide the Profile link from superadmins. It does not gate any server-side decision.

**The two holes, on this map:**
- **F1** sits on the "server actions" row: the callable boundary is unguarded while wielding the service-role client.
- **F2** sits on the "database authority" row: the trigger seeds `user_roles.role` from user-writable metadata, so the "source of truth" is downstream of user input at creation time.

---

## 4. Verification Baseline

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) |
| Lint | `npx eslint .` | **CRASH** (exit 2) — `TypeError: expand is not a function` (finding V1) |
| Tests | `npx jest` | **PASS** — 76/76, 10 suites |
| Build | `npx next build` | **PASS** — 16 routes |
| Audit | `npm audit` | **7 vulns: 1 critical, 4 high, 1 moderate, 1 low** (finding F5) |
| Audit (prod) | `npm audit --omit=dev` | **6 vulns: 1 critical, 3 high, 1 moderate, 1 low** |
| **Exploit probe** | `next start` + unauthenticated `curl` to server actions | **`addUser` and `addMember` executed with no auth** (finding F1, E3) |

Typecheck, tests, and build match the repo's recorded state. Lint and audit **do not** — both are asserted green/zero in README/docs and are neither today.

---

## 5. Findings Summary

| ID | Title | Classification | Severity | Confidence | Evidence | Root cause | Inheritance risk |
|---|---|---|---|---|---|---|---|
| **F1** | Privileged server actions have no caller authorization; reachable unauthenticated with service-role client | DEFECT | **CRITICAL** | HIGH (local + deployed) | **E3** (proven) | RC-1 | **Very high** |
| **F2** | `handle_new_user()` trusts user-writable `user_metadata.role` → self-signup superadmin escalation | DEFECT | **CRITICAL** (cond.) | HIGH local / MODERATE deployed | E1 | RC-2 | **Very high** |
| **F3** | Server actions accept caller-controlled target ID and role with no target/enum authorization | DEFECT | HIGH | HIGH | E1/E2 | RC-1 | High |
| **F4** | Docs describe a caller-verification / "403" step that does not exist in code | CONTRACT DRIFT / DEFECT | HIGH | HIGH | E1 | RC-1/RC-3 | High |
| **F5** | `npm audit` not zero (critical Next RCE); README + SECURITY.md claim "0 vulnerabilities" | CONDITIONAL RISK + VERIFICATION DEFECT | HIGH (cond.) | HIGH | E1 | RC-3 | Medium |
| **V1** | ESLint crashes on clean install (brace-expansion@5 override vs vendored minimatch) | TOOLING DEFECT | MEDIUM | HIGH | E3 | RC-3 | Medium |
| **F6** | Session cookies `httpOnly:false` + login returns full session JSON + user persisted to localStorage | TRADEOFF / RISK | MEDIUM | HIGH | E1 | RC-4 | Medium |
| **F7** | Persisted Zustand auth state survives session expiry / account switch | OPTIONAL IMPROVEMENT / RISK | LOW | MODERATE | E1 | RC-4 | Medium |
| **F8** | `next.config.js` disables caching globally (`Cache-Control: no-store` on every route) | TRADEOFF | LOW | HIGH | E1 | — | Medium |
| **F9** | `supabase/setup.sql` and `docs/migration_add_profiles.sql` ship different RLS policy sets | CONTRACT DRIFT | MEDIUM | HIGH | E1 | RC-3 | Medium |

Defect count (excluding optional improvements and tradeoffs): **F1, F2, F3, F4, F9, V1**. F5 is a live-dependency risk plus a false verification claim. F6/F7/F8 are tradeoffs/improvements.

---

## 6. Detailed Findings

### F1 — Privileged server actions execute with no caller authorization; reachable unauthenticated

- **Classification:** DEFECT (missing authorization at a callable trust boundary)
- **Severity:** **CRITICAL**, conditional only on the app being deployed and reachable. No further condition is needed — no valid session is required.
- **Confidence:** HIGH in the local defect; HIGH in the deployed consequence (proven by execution).
- **Evidence level:** **E3** — real Next.js production dispatch; the only mocked boundary was Supabase itself (a fake listener), which received the privileged call.
- **Locations:**
  - `src/app/(superadmin)/superadmin-portal/actions.ts` — `addUser`, `editUser`, `deleteUser` (also `getUsers`, `getUserById`)
  - `src/app/(admin)/admin-portal/actions.ts` — `addMember`, `editUser`, `deleteUser` (also `getUsers`, `getUserById`)
  - `src/utils/supabase/admin.ts` — the service-role client these call
  - Guard that does NOT cover them: `src/app/(superadmin)/layout.tsx`, `(admin)/layout.tsx` (`protectPage(...)`)
- **Expected contract/invariant:** a privileged, RLS-bypassing operation must independently authenticate and authorize its caller. Per the kit's own AUTHORIZATION.md: "Before any privileged action occurs, the route … reads the caller's role from `user_roles`; rejects non-superadmins … returns `403` and never reaches the admin client."
- **Execution / trust path:** In the App Router, a server action is a public POST endpoint keyed by an action ID and dispatched by the framework. The request flow is `middleware(updateSession) → decode action args → execute action → re-render page`. The layout's `protectPage` runs during the **re-render**, i.e. *after* the action's side effects. `updateSession` only refreshes cookies; it never rejects. None of the four actions reads `auth.getUser()`, calls `protectPage`, or checks a role. They call `createAdminClient()` (service-role, RLS-bypassed) directly.
- **Directly observed evidence:** production build started with env pointing Supabase at a fake local listener; unauthenticated `curl` (no cookie) with `Next-Action: 4014c8e1f65382d14cd8348d1c77a7f43639caa6c4` (the `addUser` id) and args as flight form-field `0`. The fake Supabase logged:
  ```
  POST /auth/v1/admin/users :: {"email":"pwn@evil.com","password":"password123",
     "email_confirm":true,"user_metadata":{"full_name":"Pwn Hacker","role":"admin"}}
  ```
  Repeated for admin `addMember` (→ `back@door.com`). The action IDs were read from the **public** bundle, e.g. `.next/static/chunks/...: createServerReference)("4014c8e1...","addUser")`. Control: unauthenticated `GET /superadmin-portal` returns **HTTP 307** to `/auth` — render is guarded; the action is not.
- **Source inference:** with a real service-role key and a real Supabase, the same call creates a real admin (or, via `role:"superadmin"`, a superadmin — see F3). `deleteUser` reaches `auth.admin.deleteUser(<any id>)`; `editUser` reaches `user_roles.update({role})`.
- **Deployment/environment assumptions:** app is deployed and internet-reachable; `SUPABASE_SECRET_KEY` is set (required for the app to function at all). Next's same-origin action check does not help: a scripted client sets `Origin` freely (I did). No condition mitigates this.
- **Impact:** unauthenticated account creation at any role, arbitrary user deletion, arbitrary role change, and enumeration of all users/profiles (`getUsers`/`getUserById`). Full administrative takeover and a destructive/data-integrity path, no credentials required.
- **Falsifier / downgrade evidence:** show that a deployed instance rejects the unauthenticated action POST (e.g. an unshown middleware or platform WAF returning 401/403 before execution), or that these action files gained a caller check. My control test (307 on GET, execution on POST) already rebuts the "the layout protects it" defense. If a project fronts the app with an auth gateway that blocks all POSTs lacking a valid session, deployed severity drops — but nothing in the kit does this.
- **Root-cause group:** RC-1 (unguarded callable boundary).
- **Inheritance impact:** **Very high.** Every Factory app cloned from this kit inherits these action files and the "the layout guards it" assumption verbatim. Each downstream app is born with an unauthenticated admin-creation endpoint.

---

### F2 — `handle_new_user()` trusts user-writable `user_metadata.role`; self-signup can mint a superadmin

- **Classification:** DEFECT (authorization decision derived from untrusted input)
- **Severity:** **CRITICAL**, conditional on public sign-ups being enabled (the Supabase default).
- **Confidence:** HIGH in the local defect; MODERATE in deployed consequence (not exercised against live Supabase; depends on project sign-up + email-confirm settings).
- **Evidence level:** E1 (SQL + SDK transport), reinforced by the F1 execution showing `user_metadata.role` flows unchecked into `createUser`.
- **Locations:** `supabase/setup.sql:97-110` (the trigger); `docs/migration_add_profiles.sql:72-104` (same logic); `src/utils/supabase/client.ts` (publishable key ships to browser); `src/app/api/auth/signup/route.ts` (app's own signup sends no role — but is not the only entry point).
- **Expected contract/invariant:** the kit's stated rule — "authorization must live in the database … `user_roles` is the source of truth — NOT `user_metadata`" and "a self-signup carries no `role` key and therefore lands as `member`."
- **Execution / trust path:** the trigger does `assigned_role := (NEW.raw_user_meta_data ->> 'role')::public.app_role` and inserts it into `user_roles`. `raw_user_meta_data` is populated from the `data` field of Supabase sign-up (`@supabase/auth-js` `signUp` body: `data: options?.data`). That endpoint (`POST /auth/v1/signup`) is public and authenticated only by the **publishable** key, which is in `NEXT_PUBLIC_*` and therefore in the browser bundle. The app's own `/api/auth/signup` sends only `full_name`, but an attacker does not have to use the app's route — they call GoTrue directly (or `supabase.auth.signUp({ email, password, options:{ data:{ role:'superadmin' } } })` from any console).
- **Directly observed evidence:** trigger source reads `->> 'role'` with only a NULL fallback and no allow-list; `user_roles` has no user-facing INSERT/UPDATE policy (so this trigger, running `SECURITY DEFINER`, is the write path); auth-js maps `options.data` → sign-up `data` → `raw_user_meta_data`.
- **Source inference:** an anonymous request `POST /auth/v1/signup {email,password,data:{role:"superadmin"}}` causes the `AFTER INSERT` trigger to insert `user_roles(role='superadmin')`. `protectPage` then reads `superadmin` and admits the attacker to the superadmin portal (which, combined with the service-role actions, is total control).
- **Deployment/environment assumptions:** public sign-ups enabled (Supabase default). If email confirmation is required, the `user_roles` row is still created at `auth.users` insert (before confirmation); the attacker must confirm a mailbox they own to log in — a trivial extra step, not a barrier. If sign-ups are disabled, this specific path closes (but F1 remains).
- **Impact:** self-service privilege escalation to superadmin — the single worst outcome for an RBAC kit — with no privileged credentials.
- **Falsifier / downgrade evidence:** show that on a real Supabase the trigger does **not** honor `data.role` at sign-up (e.g. GoTrue strips it, or the project uses a restricted signup), or that `user_roles` gains a CHECK/trigger rejecting client-set roles, or that sign-ups are disabled in the target deployment. Any of these narrows or closes it. I could not run this against live Supabase, hence MODERATE deployed confidence.
- **Root-cause group:** RC-2 (authorization derived from user-writable input).
- **Inheritance impact:** **Very high.** Every downstream app runs this exact trigger from `supabase/setup.sql`. The comment two lines above the vulnerable read says `user_roles` is the source of truth "NOT user_metadata," which will lull reviewers.

---

### F3 — Server actions trust caller-controlled target IDs and role values (no target-scope / enum re-validation)

- **Classification:** DEFECT (missing target-object and input authorization)
- **Severity:** HIGH (independent of F1; amplified by it)
- **Confidence:** HIGH · **Evidence:** E1 (source), E2-adjacent via the F1 run
- **Locations:** `(admin)/admin-portal/actions.ts` `deleteUser`, `editUser`; `(superadmin)/superadmin-portal/actions.ts` `deleteUser`, `editUser`, `addUser`.
- **Expected contract/invariant:** an admin may delete/edit **members** only (the UI renders Delete solely for `role === "member"`); roles are a frozen enum. Server actions must re-enforce both, because the UI is not a control.
- **Execution / trust path:** `deleteUser(userId)` calls `auth.admin.deleteUser(userId)` for **any** id — no check that the target is a member (admin portal) or non-superadmin. `editUser` writes `user_roles.update({ role: formData.role })` with the role string trusted verbatim; the only role allow-list (`z.enum(["admin","member"])`) lives in the **client** form, not the action. So a crafted call to the superadmin `editUser`/`addUser` with `role:"superadmin"` is honored by the action (the DB enum permits `superadmin`).
- **Directly observed evidence:** no target/enum guard in either action file; client-only zod in `AddUserForm.tsx`/`EditUserForm.tsx`. The F1 run showed `role` passed straight into `createUser` metadata.
- **Impact:** even a legitimately-authenticated admin can delete or edit an admin/superadmin by supplying that id; combined with F1, an unauthenticated caller can mint a **superadmin** (via `addUser role:"superadmin"`) or delete any account by id.
- **Falsifier / downgrade:** show a server-side target-role check or server-side enum validation in the actions (there is none), or that the DB enum forbids `superadmin` from this path (it does not).
- **Root-cause group:** RC-1.
- **Inheritance impact:** High — the "UI hides the button" assumption propagates to every clone.

---

### F4 — Documentation asserts a caller-verification / 403 control that does not exist

- **Classification:** CONTRACT DRIFT elevated to DEFECT (it misrepresents the security posture)
- **Severity:** HIGH (it directly causes F1/F3 to be shipped and copied with false confidence)
- **Confidence:** HIGH · **Evidence:** E1
- **Locations:** `docs/AUTHORIZATION.md` "The One-Two Punch" / "Punch One: Verify the caller is a superadmin … returns `403` and never reaches the admin client"; `README.md` "role checks … enforced server-side by `protectPage([...])` in every protected layout" (true for pages, implied for operations).
- **Contract vs reality:** the described "Punch One" (get current user → read caller role → reject non-superadmins with 403) appears in **no** server action. The actions jump straight to "Punch Two" (service-role mutation). The doc describes a two-stage control; the code has one stage, and it is on the wrong request (render, not action).
- **Impact:** an engineer auditing this kit by its docs concludes the callable boundary is guarded. It is not. This is how F1 survived to a "hardened" snapshot.
- **Falsifier / downgrade:** point to the 403 caller check in code. It is absent.
- **Root-cause group:** RC-3 (artifacts assert protections that do not exist) feeding RC-1.
- **Inheritance impact:** High — docs are copied with the kit and are treated as the spec.

---

### F5 — `npm audit` is not zero (critical Next.js RCE); README + `docs/SECURITY.md` claim "0 vulnerabilities"

- **Classification:** CONDITIONAL RISK (real vulnerable dependency) + VERIFICATION DEFECT (false claim)
- **Severity:** HIGH, conditional on deployment surface (the critical is a Next RCE)
- **Confidence:** HIGH · **Evidence:** E1
- **Locations:** `package.json` (`next ^16.2.12`, `overrides.sharp ^0.35.3`); `README.md` audit badge "0 vulnerabilities"; `docs/SECURITY.md` "npm audit → … 0".
- **Observed:** `npm audit` = 7 (1 critical, 4 high, 1 moderate, 1 low); `--omit=dev` = 6 (critical included). Highlights:
  - **next `>=16.0.0 <16.3.3` — CRITICAL:** GHSA-p293-qw3h-jr36 (unauthenticated RCE on Windows-hosted servers) and GHSA-2xp9-vwfh-vxw4 (unauthenticated RCE in Image Optimization when AVIF is used). Installed 16.2.12 is in range; fix is 16.3.3+.
  - **sharp `<0.35.4` — high:** the committed `sharp ^0.35.3` override is now one patch behind a newer libheif advisory (GHSA-rgj7-g3m4-5g8c). The override strategy documented in SECURITY.md has already gone stale.
  - Plus brace-expansion, browserslist, nanoid, baseline-browser-mapping, postcss-selector-parser.
- **Impact:** the kit ships a Next.js version with a critical RCE advisory and tells operators the tree is clean. `docs/SECURITY.md` itself says "if `npm audit` and this table ever disagree, the audit wins and this file is the bug" — by its own rule, the file is currently a bug.
- **Falsifier / downgrade:** re-run `npm audit` after bumping Next to ≥16.3.3 and sharp to ≥0.35.4; if it returns zero, this narrows to "stale badge, now fixed." The Windows-RCE severity is lower for non-Windows hosts; the AVIF-RCE requires image optimization use (kit has none yet).
- **Root-cause group:** RC-3.
- **Inheritance impact:** Medium — clones inherit the version floor and the false badge; a "0 vulnerabilities" badge discourages downstream re-checking.

---

### V1 — ESLint crashes on a clean install; the lint gate does not run

- **Classification:** VERIFICATION / TOOLING DEFECT
- **Severity:** MEDIUM · **Confidence:** HIGH · **Evidence:** E3 (reproduced on clean `npm ci`)
- **Locations:** `package.json` `overrides."brace-expansion": "^5.0.8"`; consumed by `@eslint/config-array`'s vendored `minimatch@3.1.5`.
- **Observed:** `npx eslint .` → `TypeError: expand is not a function` at `Minimatch.braceExpand`. `brace-expansion@5` exports `{ expand, ... }` (namespace), but `minimatch@3` does `var expand = require('brace-expansion')` and calls it directly. v5 is not callable as a default export.
- **Impact:** `npm run lint` fails for anyone who clones and installs. The `no-explicit-any` / `no-unused-vars` discipline the kit advertises is unenforced. README/RECOVERY claim "lint exit 0, 59 warnings" — not reproducible.
- **Root cause:** the `brace-expansion` override (added to chase an audit advisory) crosses a major version that breaks a transitive consumer — the same class of "override across a boundary" risk SECURITY.md flags for sharp, realized here for the lint toolchain.
- **Falsifier / downgrade:** show `npx eslint .` exiting cleanly on a fresh install (it does not).
- **Root-cause group:** RC-3.
- **Inheritance impact:** Medium — every clone inherits a broken lint gate.

---

### F6 — Session material is exposed to client JavaScript (`httpOnly:false` + tokens in JSON + persisted user)

- **Classification:** TRADEOFF with security risk
- **Severity:** MEDIUM · **Confidence:** HIGH · **Evidence:** E1
- **Locations:** `src/utils/supabase/server.ts` (cookies forced `httpOnly:false`); `src/app/api/auth/login/route.ts` (returns the full `data` from `signInWithPassword`, which includes `session` access/refresh tokens, in the JSON body); `src/store/useAuthStore.ts` (`persist` writes `user` to `localStorage`).
- **Analysis:** the `httpOnly:false` choice is deliberate and commented ("Supabase needs client-side access"). Combined with returning the session in the login JSON and persisting identity to `localStorage`, it means any XSS on any page can read the session tokens and the user object. For a security-focused starter this is a meaningful default: a single injected script equals full session theft. `@supabase/ssr` can operate with httpOnly cookies for the SSR path; the browser client keeps its own storage.
- **Impact:** raises the blast radius of any XSS from "act as user in-page" to "exfiltrate a portable session." Not exploitable on its own.
- **Falsifier / downgrade:** if the deployment adds a strict CSP and the team accepts the SPA-session model, this is an accepted tradeoff. There is no CSP in `next.config.js` today.
- **Root-cause group:** RC-4. **Inheritance:** Medium.

---

### F7 — Persisted Zustand auth state can outlive the session

- **Classification:** OPTIONAL IMPROVEMENT / minor state risk
- **Severity:** LOW · **Confidence:** MODERATE · **Evidence:** E1
- **Location:** `src/store/useAuthStore.ts` (`persist`, key `auth-store`).
- **Analysis:** `user`, `role`, and the `isAdmin/isMember/isSuperadmin` flags persist to `localStorage`. They are cleared on explicit `logout()` but not on token expiry, revocation, or account switch in another tab. Today the store only drives cosmetic behavior (hiding the Profile link for superadmins), so real impact is low — but it is a footgun: a downstream app that starts gating UI (or worse, trusting the store for a decision) inherits stale-identity behavior. The `isLoading` initial `true` is also never reset by the store itself.
- **Falsifier / downgrade:** if downstream never gates on the store, impact stays cosmetic.
- **Root-cause group:** RC-4. **Inheritance:** Medium (pattern risk).

---

### F8 — Global no-store cache headers on every route

- **Classification:** TRADEOFF
- **Severity:** LOW · **Confidence:** HIGH · **Evidence:** E1
- **Location:** `next.config.js` `headers()` applies `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` to `/(.*)`.
- **Analysis:** this defeats CDN/browser caching for **all** responses including static assets and the public marketing page, to solve an auth-freshness concern that `revalidatePath` + `router.refresh()` already handle. It is a performance/scale tax every downstream app inherits. Legitimate for authed pages; overbroad as a blanket rule.
- **Root-cause group:** — . **Inheritance:** Medium.

---

### F9 — The two schema files ship different RLS policy sets

- **Classification:** CONTRACT DRIFT
- **Severity:** MEDIUM · **Confidence:** HIGH · **Evidence:** E1
- **Locations:** `supabase/setup.sql` (fresh install) vs `docs/DATABASE_SETUP.md` "single source of truth" claim vs `docs/migration_add_profiles.sql`.
- **Analysis:** `supabase/setup.sql` gives `profiles` **read-own / update-own** policies only. `docs/migration_add_profiles.sql` gives `profiles` **owner-or-superadmin** SELECT/UPDATE. A superadmin's dashboard (`getUsers` reads all profiles) works today only because it uses the **service-role** client (RLS-bypassed) — so the missing superadmin SELECT policy in `setup.sql` is masked. But `MANUAL_TESTING.md` explicitly tells operators to run `migration_add_profiles.sql` and asserts the superadmin-wide policy is what makes the dashboard work — a fresh install per `setup.sql` gets a **different** RLS posture than the manual-test guide assumes. Whichever is intended, they must not disagree; a starter kit that ships two contradictory schema files will have downstream apps provisioned inconsistently.
- **Falsifier / downgrade:** if the intent is "service-role reads everything and users only ever read their own row," then `setup.sql` is correct and the migration file + MANUAL_TESTING are over-provisioning — still drift, lower stakes. Either way the files disagree.
- **Root-cause group:** RC-3. **Inheritance:** Medium.

---

## 7. Root-Cause Themes

- **RC-1 — The callable boundary is unguarded (F1, F3, F4).** Server actions are treated as private functions protected by the page around them. They are public POST endpoints. Authorization and input validation live on the wrong side (client forms, layout render) of the real trust boundary. This is the single most consequential theme.
- **RC-2 — Authorization is seeded from user-writable input (F2).** The trigger reads a role out of user_metadata, so "the database is the source of truth" is true for *reads* but the *write* at creation trusts the client.
- **RC-3 — Artifacts assert protections/verifications that don't hold (F4, F5, V1, F9).** A "403 caller check" that isn't there, an "audit = 0" badge that's false, a "lint green" claim that crashes, two disagreeing schema files. The documentation is confident exactly where the code is weakest.
- **RC-4 — Client-side exposure of session/identity (F6, F7).** Deliberate SPA-style choices that widen XSS blast radius and let identity go stale.

---

## 8. Starter-Kit Inheritance Risks

The patterns most likely to propagate unchanged into Factory apps, in priority order:

1. **Unauthenticated privileged server actions (RC-1).** Copied verbatim, every child app ships an open admin-creation/deletion endpoint. This is the one that turns one kit defect into N production incidents.
2. **Metadata-role trigger (RC-2).** `supabase/setup.sql` is run as-is by every new project; each becomes self-escalatable at signup.
3. **"The layout protects it" mental model (F4).** The docs teach the wrong boundary; downstream engineers will build new server actions the same unguarded way.
4. **Broken lint gate + false audit badge (V1, F5).** Downstream inherits a CI signal that is either dead or lying, eroding the kit's whole "verified" premise.
5. **httpOnly:false session model (F6).** A kit-wide default that every app carries into environments with different XSS exposure.

These are listed as inheritance amplifiers of the findings above — not counted as additional defects.

---

## 9. Positive Protections to Preserve

- **`protectPage()` is correct and genuinely tested** (`src/utils/supabase/actions.ts`; `src/__tests__/actions.test.ts` covers member→admin, admin→superadmin, unauth, and null-role denials). Keep it — just extend the same authority into the actions.
- **`user_roles` has no user-facing INSERT/UPDATE policy** (`supabase/setup.sql`) — closes the direct-PostgREST table-escalation path, so escalation requires the trigger (F2) rather than a simple row update. Preserve this.
- **Service-role key is server-only** (`admin.ts` reads `SUPABASE_SECRET_KEY`, no `NEXT_PUBLIC_`; `next build` shows the actions as server-only ƒ routes; no client import). Correct secret isolation.
- **`getUserRole()` reads the DB, never client state or metadata, for the read-side decision.** The authorization *read* model is sound.
- **Input hygiene basics:** zod validation on forms, `email_confirm` on admin-created users, password ≥ 8, email fields read-only, no `dangerouslySetInnerHTML` anywhere, idempotent trigger (`ON CONFLICT DO NOTHING`).
- **Auth-state cache discipline** (`revalidatePath('/', 'layout')` + `router.refresh()`), which is the right way to avoid stale-session render.

Scope note: these protections are real where cited; none of them covers the server-action boundary (F1) — a correct guard on one surface does not protect another.

---

## 10. Test and Verification Quality

The suite (76/76) is clean, deterministic (the previously-flaky `AddMemberForm` test now drains its pending promise), and targets sensible surfaces. But as a **regression net for a security kit it has one disqualifying blind spot: it never tests the boundary that is actually broken.**

- **`protectPage` is well tested** — positive and negative roles, unauth, null role. Good.
- **The server actions are tested only for "does it call the SDK with the right shape"** — with `createAdminClient` fully mocked. **No test asserts that an action refuses an unauthorized or unauthenticated caller**, because there is no such code to test. The tests therefore *encode the vulnerability as expected behavior*: `addUser`'s test asserts it packs `role` into metadata and calls `createUser` — exactly the unguarded call F1 exploits. A green suite here is not evidence of safety; it is evidence the wrong contract is being asserted.
- **The trigger is not tested at all** (no DB in the harness), so F2 has zero regression coverage.
- **Mocks hide the security boundary:** every privileged test mocks the admin client, so "the service-role client runs with no caller check" is invisible to the suite.
- **No test exercises: session expiry/logout state, the login/signup/logout route handlers, RLS, or caller-vs-target authorization.** TESTING.md itself lists these as "future expansion" — correct, but until then the kit gives downstream apps *false* regression confidence on exactly the RBAC guarantees it advertises.

Bottom line: the suite proves the happy path and the render guard; it does not prove that unauthorized callers fail — which TESTING.md's own philosophy statement says is the point.

---

## 11. Concerns / Tradeoffs / Optional Improvements

- **F6 (httpOnly:false + session-in-JSON):** revisit with a CSP; consider httpOnly cookies for the SSR path.
- **F7 (persisted auth store):** clear persisted identity on `onAuthStateChange(SIGNED_OUT)` / expiry; treat the store as cache, never as an authority.
- **F8 (global no-store):** scope no-store to authed routes; let static/marketing cache.
- **`error/page.tsx`** is a bare "something went wrong" with no recovery affordance; fine for a starter, worth noting.
- **Duplicated action modules:** admin and superadmin `actions.ts` are ~80% identical (`getUsers`/`getUserById`/`toTitleCase` copy-pasted). Not a defect, but the natural home for a **shared, authorization-enforcing** service layer — which would also be the cleanest place to fix F1 once, for all portals.

---

## 12. Under-Reviewed Areas and Limitations

| Area | Depth achieved | Missing evidence | Why missing | Consequence |
|---|---|---|---|---|
| RLS enforcement (F2, F9) | Source only (E1) | Behavior on a live Postgres | No Supabase/env available | F2 deployed-severity is MODERATE, not proven; F9 intent unconfirmed |
| `handle_new_user` trigger at signup | Source + SDK transport (E1) | Live signup with `data.role` | No live DB | The escalation is inferred from SQL + auth-js, not executed |
| Email-confirmation gating | Not exercised | Whether `user_roles` row + login require confirmation in the target project | Project-config dependent | Affects how immediate F2 is |
| `deleteUser` unauth execution | Attempted (E2), 500 before network | A correctly-encoded string-arg probe | Flight string-arg encoding mismatch in my probe | Class already proven via `addUser`/`addMember`; delete inferred |
| Lint findings | None | Any ESLint output | ESLint crashes (V1) | No lint signal; substituted `tsc` + manual read |
| Deployed/platform controls | None | Whether a target platform fronts the app with an auth gateway/WAF | No deployment | F1/F5 deployed severity stated conditionally |
| Accessibility, performance-at-scale, i18n | Light | — | Time allocated to the security boundary | Not claimed as reviewed |

This review is **not** comprehensive at the database and deployment boundaries. It is conclusive at the server-action boundary (E3).

---

## 13. Reviewer Self-Critique

1. **Three strongest findings:** F1 (proven by execution), F4 (doc asserts a control that is verifiably absent), V1 (ESLint reproducibly crashes).
2. **Why they survive challenge:** F1 — I have a logged privileged call from an unauthenticated request against a real production build; the "layout guards it" counter is rebutted by the 307-on-GET / execute-on-POST control. F4 — I searched the action files for any caller/role/403 check; there is none. V1 — reproduced on clean `npm ci`, with the exact TypeError and the version mismatch identified.
3. **Three weakest consequential findings:** F2 (deployed consequence not run against live Supabase), F3-`deleteUser` (my delete probe 500'd before the network hit), F9 (intent between the two SQL files is ambiguous).
4. **Assumptions that make them vulnerable:** F2 assumes GoTrue passes `data.role` into `raw_user_meta_data` and that the project allows public signup — both standard but unverified here. F3-delete assumes the delete action behaves like the create actions (same structure; strongly implied, not executed). F9 assumes the two files are meant to be equivalent.
5. **Severities that may be overstated:** F5's critical is a Next advisory whose Windows-RCE leg matters less on Linux hosts and whose AVIF leg needs image optimization the kit doesn't use yet — "critical" is the advisory's rating, deployed impact is narrower. F2 is CRITICAL *conditional*; if a project disables signups it does not apply.
6. **Severities that may be understated:** F3 (arbitrary deletion by id) could be argued CRITICAL in its own right; I kept it HIGH because it overlaps F1's root cause and I did not execute the delete. F6 could rise if a downstream app has any XSS.
7. **Findings sharing deeper causes:** F1+F3+F4 are all RC-1; F5+V1+F9+F4 are all RC-3. I have not double-counted — the summary table maps each to one root cause.
8. **Important under-reviewed areas:** the entire live DB/RLS/trigger boundary (§12). F2 rests on well-established framework behavior, not a live run.
9. **Wording watched for over-reach:** I say F1 is *proven* (E3) and F2 is *inferred* (E1); I did not upgrade F2 to "proven." I did not call the review comprehensive.
10. **What another senior reviewer should attack first:** stand up a real Supabase and (a) confirm `POST /auth/v1/signup {data:{role:"superadmin"}}` actually yields a superadmin row (settles F2 deployed severity), and (b) fire the unauthenticated `addUser` against a real service-role key to confirm a real admin is created end-to-end (upgrades F1 from "reached the admin API" to "created a real admin"). Both are small and decisive.

No finding was defeated by my own challenge; F2, F3-delete, and F9 were **narrowed** in confidence/severity wording rather than withdrawn.

---

## 14. Prioritized Handoff

> Review only — nothing was fixed.

### P0 — investigate / contain immediately
- **F1 — unauthenticated privileged server actions.**
  - *Smallest useful next verification:* on a staging instance with a real service-role key, repeat the unauthenticated `addUser` POST and confirm a real admin appears in `auth.users` (I proved the admin API is reached; this proves the account is created).
  - *Owner:* the kit's auth/RBAC owner (backend/platform).
  - *Downstream implication:* every app already spawned from this kit likely has the same open endpoint — inventory and contain them, not just the kit.
- **F2 — signup metadata → superadmin.**
  - *Smallest useful next verification:* on a real Supabase, `POST /auth/v1/signup` with `data:{role:"superadmin"}` using the publishable key; check `public.user_roles`.
  - *Owner:* database/Supabase owner.
  - *Downstream implication:* every project provisioned from `supabase/setup.sql` is affected; a fix must ship in the kit's SQL and be re-applied to existing projects.

### P1 — fix before any further starter-kit propagation
- **F3** — add server-side target-scope and role-enum checks in every action (owner: backend). Downstream: same clones as F1.
- **F4** — make AUTHORIZATION.md match reality, or (better) implement the "403 caller check" it promises inside the actions (owner: backend + docs). Downstream: docs are copied as spec.
- **F5** — bump `next` ≥ 16.3.3 and `sharp` ≥ 0.35.4, re-run `npm audit`, and correct the README/SECURITY badge to the true state (owner: platform). Downstream: version floor + badge inherited.
- **V1** — repair the lint toolchain (align/withdraw the `brace-expansion` override) so `npx eslint .` runs; the kit's quality gate is currently dead (owner: platform).

### P2 — normal backlog
- **F6** (httpOnly + CSP), **F7** (persisted-store hygiene), **F8** (scope no-store), shared authorization-enforcing service layer for the duplicated action modules, direct route-handler and RLS integration tests.

### QUESTION — needs architecture/product/environment clarification
- **F9** — which schema is canonical: `setup.sql` (read-own only, superadmin reads via service-role) or `migration_add_profiles.sql` (superadmin-wide RLS)? Reconcile the files and MANUAL_TESTING accordingly.
- Is public sign-up intended to be enabled on Factory Supabase projects? The answer sets F2's real severity.
- Target hosting (Windows vs Linux, image optimization on/off) — sets F5's deployed impact.

---

## 15. Change Boundary Confirmation

Files created (the only writes performed), all under the authorized workspace:

- `fable-review/FABLE_REVIEW_PROMPT.md` — archival copy of the review instructions.
- `fable-review/RUN_NOTES.md` — environment, commands, outcomes, exploit-probe method.
- `fable-review/FABLE_CODE_REVIEW.md` — this report.

Confirmed unchanged: **all** application code, tests, fixtures, migrations, configuration, environment files, and dependency manifests. `git status --porcelain` reports only `?? fable-review/`. HEAD remains `0b1c060adfc4f0f7db7522e99acf5696075ca7e8`; the branch was never switched; no stage/commit/push/merge/rebase/reset/stash or any git-state-changing action was performed. Installed `node_modules` and the `.next` build output are gitignored build artifacts, not tracked source. No production system, database, cloud resource, or external API was contacted or mutated; the exploit probe ran entirely localhost-to-localhost against a fake Supabase listener.
