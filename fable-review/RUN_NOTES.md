# RUN_NOTES.md — Fable 5.1 Independent Review

## Identity

- **Repository:** `nextjs16-starter-supabase-role-access-2026-v3`
- **Review branch:** `fable-code-review-13sep2026`
- **Pinned source SHA:** `0b1c060adfc4f0f7db7522e99acf5696075ca7e8` (verified present; HEAD == this SHA)
- **Review date:** 2026-09-13
- **Reviewer model:** Claude (Fable 5.1 at start; the harness swapped the underlying model to Opus 4.8 partway through — noted for the record, no effect on evidence).
- **Working directory confirmed:** `C:\Users\user\GITHUB-REPOS\nextjs16-starter-supabase-role-access-2026-v3`

## Pre-existing state

- `git status` at start: clean.
- No `.env.local` present in the tree (build is env-independent by design).
- `RECOVERY.md` + `agent_docs/SESSIONS/` read per the repo's own protocol. Last recorded state: "kit at audit-zero, all gates green, main untouched". **This review contradicts the audit-zero claim — see below.**
- After review: `git status --porcelain` shows only `?? fable-review/`. HEAD unchanged at the pinned SHA. Branch never switched. No git state mutated.

## Environment / runtime versions

| Tool | Version |
|---|---|
| Node | v24.14.1 (repo pins `>=22`, `.nvmrc` = 22) |
| npm | 11.13.0 |
| next | 16.2.12 |
| react / react-dom | 19.2.4 |
| typescript | 5.5.4 |
| @supabase/ssr | 0.6.1 |
| @supabase/supabase-js | 2.106.1 |
| @supabase/auth-js | (bundled under supabase-js) |
| zustand | 4.5.4 |
| jest | 30.x |

> Node 24 was used because that is what is installed; the repo asks for 22. Not believed to affect any finding. All baseline gates were run on Node 24.

## Commands executed (all non-destructive)

| Command | Result |
|---|---|
| `git rev-parse HEAD` / branch / `git cat-file -t <SHA>` | Confirmed snapshot + branch |
| `npm ci` | EXIT 0 (dependencies installed from lockfile) |
| `npx tsc --noEmit` | **EXIT 0** — no type errors |
| `npx eslint .` | **EXIT 2 — CRASHES**, does not lint (see below) |
| `npx jest` | **76 passed / 10 suites**, EXIT 0 |
| `npx next build` | **EXIT 0**, 16 routes (15 app routes + middleware) |
| `npm audit` | **7 vulnerabilities (1 critical, 4 high, 1 moderate, 1 low)** |
| `npm audit --omit=dev` | **6 vulnerabilities (1 critical, 3 high, 1 moderate, 1 low)** |
| Controlled execution: `npx next start` against a fake local Supabase listener, then unauthenticated `curl` POSTs to server actions | **Privileged actions executed with no auth — see F1 evidence** |

## Baseline outcomes — detail

### typecheck — PASS
`tsc --noEmit` exits 0.

### lint — BROKEN (tooling defect)
`npx eslint .` crashes before linting a single file:
```
TypeError: expand is not a function
    at Minimatch.braceExpand (.../@eslint/config-array/node_modules/minimatch/minimatch.js:271:10)
ESLint: 9.39.4
```
Root cause: the repo pins `"brace-expansion": "^5.0.8"` in `overrides`. Installed `brace-expansion@5.0.8` exports a namespace object `{ EXPANSION_MAX, EXPANSION_MAX_LENGTH, expand }`, but the `minimatch@3.1.5` vendored under `@eslint/config-array` does `var expand = require('brace-expansion')` and calls `expand(...)` as a function. v5 is not callable as a default export, so ESLint throws. **The lint script is dead on a clean install.** README/RECOVERY claim "npm run lint exit 0 — 0 errors, 59 warnings"; that is no longer true with the committed overrides. (See finding V1.)

### tests — PASS (but see test-quality section in the main report)
`Test Suites: 10 passed, 10 total / Tests: 76 passed`.

### build — PASS
`next build` EXIT 0. Route table matches the documented 16 (15 routes + Proxy middleware). No `next/image` usage in `src`.

### audit — NOT ZERO (contradicts README + docs/SECURITY.md)
`npm audit` = 7 vulns incl. **1 critical**. `npm audit --omit=dev` = 6 vulns incl. the critical. The README badge and `docs/SECURITY.md` both assert "0 vulnerabilities". The advisory landscape has moved since 2026-07-26. Notable:
- **next `>=16.0.0 <16.3.3` — CRITICAL** — GHSA-p293-qw3h-jr36 (unauthenticated RCE on Windows-hosted servers) + GHSA-2xp9-vwfh-vxw4 (unauthenticated RCE in Image Optimization when AVIF used). Installed 16.2.12 is in range. Fix available (16.3.3+).
- **sharp `<0.35.4` — high** — the committed `sharp ^0.35.3` override no longer clears it; a newer libheif advisory (GHSA-rgj7-g3m4-5g8c) reopened it. The override is one patch behind the current advisory.
- brace-expansion, browserslist, nanoid, baseline-browser-mapping, postcss-selector-parser — various.

## Controlled-execution proof (server-action auth bypass) — how it was done

1. Started a fake Supabase HTTP listener on `127.0.0.1:54321` that logs every request and returns 500.
2. Started the **production build** (`next start`) with dummy env pointing `NEXT_PUBLIC_SUPABASE_URL` at the fake listener. No real Supabase, no real system touched.
3. From a plain `curl` with **no session cookie**, POSTed to `/superadmin-portal/add-user` with header `Next-Action: <addUser id>` and the action's argument encoded as multipart form field `0` (the React flight reply format Next's `decodeReply` accepts).
4. **Result:** the fake Supabase received
   `POST /auth/v1/admin/users :: {"email":"pwn@evil.com",...,"user_metadata":{"full_name":"Pwn Hacker","role":"admin"}}`
   — the service-role admin client was invoked to create an **admin** user, unauthenticated. The title-cased name proves the action body ran end to end.
5. Repeated for the admin `addMember` action → same result (`back@door.com`, role member).
6. **Control:** an unauthenticated `GET /superadmin-portal` returns **HTTP 307** (redirect to `/auth`) — page render IS guarded. The action POST is NOT. This is the precise contrast the finding rests on.

The `addUser` action ID (`4014c8e1f65382d14cd8348d1c77a7f43639caa6c4`) and the other action IDs were read straight out of the **publicly served** static bundle `.next/static/chunks/...`, e.g.:
```
createServerReference)("4014c8e1f65382d14cd8348d1c77a7f43639caa6c4",...,"addUser")
createServerReference)("40964cc43c9c65330ace6af27f72ad71ee7d8e8176",...,"addMember")
createServerReference)("40e162a587b65c62539e9562489842ca1996e71309",...,"deleteUser")
```
So an attacker needs no insider knowledge — the IDs ship to the browser.

## Tool failures / limitations

- **ESLint** cannot run (finding V1). No lint signal obtained; substituted manual reading + `tsc`.
- **No live Supabase / no `.env.local`.** RLS policies, the `handle_new_user()` trigger, email-confirmation settings, and the metadata-role escalation path (F2) were verified at the source + SDK-transport level (E1), NOT against a live database (no E3/E4 for the DB layer).
- The `deleteUser` controlled POST returned 500 before reaching the fake listener (string-arg encoding mismatch in my probe, not a protection); `addUser`/`addMember` already prove the class conclusively.
- A transient Git-Bash cwd error interrupted two commands mid-review; both were re-run successfully. No effect on evidence.

## External systems

- No production system, cloud resource, database, or external API was contacted or mutated. The only network activity was localhost ↔ localhost (fake Supabase) and the npm registry during `npm ci`.

## Application-source integrity

**Confirmed:** no application file, test, fixture, migration, config, env file, or dependency manifest was modified. `git status --porcelain` == `?? fable-review/` only. HEAD == `0b1c060`. No branch/stage/commit/reset/stash performed. The only writes were the three authorized files under `fable-review/`.
