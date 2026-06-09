# ENV, BUILD & CONFIG — Replayable (Defects C3/C4/K1 / L9, L13, L14, L24, L25)

> Make the cold build pass, ship the env example, and fix the two config defects. All four are quick and high-leverage.

## 1. Ship `.env.local.example` (C3 / L9)

v2 ships **no** env example. Install `templates/env.local.example` at repo root. It must use the **Q4-2025 Supabase names** the code actually reads — NOT the legacy names:

| Use (current) | NOT (legacy) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | — |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |

Ground-truth what the code reads before finalizing:
```bash
grep -rn "process.env" src/ | grep -i supabase
```
Match the example file to those exact names. Never trust a doc's env names (L9 — APP_BRIEF shipped stale names in Run 001).

## 2. Convert `globals.scss` → `globals.css` (K1 / L14)

The kit's `.scss` existed only to carry one Strapi-specific block from another project. That block leaves with the demo cleanup. `@apply` directives work identically in plain `.css`.

- Rename/replace `src/app/globals.scss` → `src/app/globals.css`.
- Update the import in `src/app/layout.tsx` (`import "./globals.css"`).
- Confirm no other file imports `globals.scss`:
  ```bash
  grep -rn "globals.scss" src/
  ```
- The full neutral token contract goes into this file in Cluster 6 (`templates/globals.neutral.css`). In Cluster 5 you're just moving the extension and dropping the Strapi/Sass-only syntax.
- If `sass` was a dependency only for this file, it can be removed from `package.json` (confirm nothing else uses it first).

## 3. Exclude `agent_docs/**` from tsc (C4 / L13)

FFM template `.ts` stubs under `agent_docs/` intentionally reference unresolved placeholders and get caught by a broad `tsc` include. Add the exclude:

```jsonc
// tsconfig.json
{
  "exclude": ["node_modules", "agent_docs/**"]
}
```
Confirm the kit's current exclude first (`cat tsconfig.json`) and append rather than overwrite.

## 4. Cold build must pass (C1/C24 / L24, L25)

The `/demo` route that created a Supabase client at prerender is already gone (Cluster 1). Confirm no other prerendered route instantiates a runtime client:
```bash
grep -rn "createClient" src/app | grep -iE "page|layout"
```
Then prove the cold build:
```bash
rm -rf .next
# with NO .env.local present
npm run build      # must complete; route table should be clean (no /demo, /template, /api/ghl)
```

## Cache discipline (L25)

Between any deletion batches in earlier clusters, `rm -rf .next` **before** `npx tsc --noEmit`. A stale `.next/types/validator.ts` references deleted routes and throws false "cannot find module" errors indistinguishable from real orphaned imports. Always clear the cache before trusting a smoke check.
