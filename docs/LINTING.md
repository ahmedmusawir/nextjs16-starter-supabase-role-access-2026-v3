# Linting Notes

ESLint setup for this starter kit. Clones inherit all of this, so it's kept
honestly clean: **0 errors, warnings-only.**

## How to run

```bash
npm run lint            # eslint . across the whole repo
./scripts/run_lint.sh   # same, plus --fix passthrough (./scripts/run_lint.sh --fix)
```

A clean repo exits 0. Remaining items are `warn`-level and informational.

## Config (`eslint.config.mjs`)

Flat config (ESLint 9 / Next 16). Ported from DockBloxx's `.eslintrc.json`:

- Extends `next/core-web-vitals` + `next/typescript` — spread directly from
  `eslint-config-next@16`'s **native flat-config arrays**. Do NOT wrap them in
  `FlatCompat`; under ESLint 9 that double-wraps and throws
  "Converting circular structure to JSON".
- `@typescript-eslint/no-unused-vars`: `warn`, with `argsIgnorePattern` /
  `varsIgnorePattern` of `^_`. Frozen-signature params and intentionally-unused
  vars are named with a leading underscore (e.g. `_req`, `_storeId`).
- `@typescript-eslint/no-explicit-any`: `warn`.
- ESLint 9 needs an explicit `ignores` block (no `.eslintignore`).

`next lint` was removed in Next 16 — the script is `eslint .`, not `next lint`.

## Conventions

- **Unused but required** (mock params, route handler args you must keep for the
  signature): prefix with `_`. Don't delete the param.
- **Dead imports / vars**: delete them. The kit ships no dead code.
- **Swallowed errors**: a `catch (error)` that ignores `error` is a bug — log it
  (`console.error(msg, error)`) or, if the empty catch is intentional (e.g. the
  Supabase SSR "set called from a Server Component" guard), drop the binding:
  `catch {}`.
- **Vendored ShadCN** noise (a value used only as a type, etc.): a one-line
  `// eslint-disable-next-line` with a reason is acceptable.

## Untyped packages

Importing an untyped package (instead of `require()`-ing it, to satisfy
`no-require-imports`) trips TS7016. Add an ambient declaration under
`src/types/` — see `src/types/tailwind-grid-auto-fit.d.ts`.

## ⚠️ Installs have blast radius — verify tests IMMEDIATELY after any install

**Rule: every `npm install` is followed by `npm test`, in the same step — not
later.** Installs can re-resolve transitive deps and silently break things far
from what you installed.

This bit us once: installing the ESLint devDeps let npm bump `jest` core to
30.4.2 while `jest-environment-jsdom` stayed at 30.3.0 with a nested
`jest-mock@30.3.0` — `jest-runtime` then called a method that older `jest-mock`
lacked, and every jsdom test suite failed to *run*. It went unnoticed because
tests weren't re-run right after the install. Fix is pinned in `package.json`:

```json
"overrides": { "jest-mock": "30.4.1" }
```

If you bump jest packages, keep them on one version (or update the override).
