# APPROLE EXTRACTION — Replayable (Defect C2 / L1)

> The single most important structural separation. The handbook claimed it; v2 never did it. This is the known-good replay. **Confirm every path on disk with `grep`/`find` before editing** — the exact site list varies slightly by kit version, so treat the list below as the search target, not gospel.

## The problem (why it must be done)

`AppRole` and `getUserRole()` live in the same file, `src/utils/get-user-role.ts`, and that file imports `createClient` from `./supabase/server` (which pulls `next/headers`). Any `"use client"` component that does a **value-level** `import { AppRole }` (e.g. `const x = AppRole.MEMBER`, or `role === AppRole.ADMIN`) drags the entire server module — and `next/headers` — into the client bundle, and `next build` fails:

```
You're importing a module that depends on "next/headers" ...
Client Component Browser:
  ./src/utils/supabase/server.ts
  ./src/utils/get-user-role.ts
  ./src/components/...
```

v2 only survives because every client usage happens to be a **type-only** import (`import type { AppRole }`), which TypeScript erases at runtime. One value import away from a broken build.

## The fix (4 moves)

**1. Create `src/utils/app-role.ts`** — the enum only, zero server deps:

```typescript
// src/utils/app-role.ts
export enum AppRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  MEMBER = "member",
}
```
> Match the kit's existing shape. If v2 declares `AppRole` as a string-union type rather than an enum, preserve that form here — confirm with `grep -n "AppRole" src/utils/get-user-role.ts` first.

**2. Re-export from `get-user-role.ts`** for backward compatibility, and stop declaring the enum there:

```typescript
// src/utils/get-user-role.ts (top)
import { AppRole } from "./app-role";
export { AppRole };
// ... getUserRole() stays here (server-only, unchanged)
```

**3. Repoint value-level import sites** to `@/utils/app-role`. Find them:

```bash
grep -rn "AppRole" src/ | grep -v "import type"
```

Known value-level sites from Run 001 (≈9; confirm on disk — yours may differ):
- `src/store/useAuthStore.ts` — currently `import type { AppRole }` (safe; leave as type OR move to app-role for tidiness)
- `src/utils/supabase/actions.ts` (`protectPage([AppRole.X])`)
- `src/app/(superadmin)/layout.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(members)/layout.tsx`
- `src/components/auth/*` or sidebar components doing admin-link visibility checks
- any `*PageContent.tsx` comparing `role === AppRole.X`
- the superadmin add-user API route
- tests referencing `AppRole`

For each: `import { AppRole } from "@/utils/app-role";` (value) or `import type { AppRole }` (type-only). Rule: `import type` is always safe; a value import must come from the server-free module.

**4. Verify:**
```bash
rm -rf .next
npx tsc --noEmit          # exit 0
npm run build             # must NOT show the next/headers client-bundle error
npm test
```

## Guardrail

This is the canonical "fix the code to match the good-intent handbook claim" case. The handbook (v1.1) already describes the separated state — your job is to make disk match it. Do not skip a site because "it's probably type-only"; grep and confirm.
