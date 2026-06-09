# Cluster 01 — Delete the Demo Cascade (M1 / L31)

**Goal:** Remove the 11-file Posts/demo scaffolding shipped under product dirs.

## Targets (confirm each exists first with `find`/`ls`)
- Services: `src/services/postServices.ts`, `src/services/jsonsrvPostServices.ts`
- Stores: `src/store/usePostStore.ts`, `src/store/useJsonsrvPostStore.ts`
- Types: `src/types/posts.ts`
- Components: `src/components/posts/`, `src/components/jsonsrv/`
- Utils: `src/utils/jsonSrv/`, `src/utils/common/` (demo-only parts — verify nothing real imports them)
- Routes: `src/app/(admin)/users/`, `src/app/(admin)/admin-booking/`, `src/app/(members)/booking/`, `src/app/(public)/demo/` (+ `DemoPageContent.tsx`)

## Steps
1. Delete in small batches (services/stores, then components, then routes).
2. After EACH batch: `rm -rf .next && npx tsc --noEmit`.
3. Grep for surviving import sites: `grep -rn "postServices\|jsonsrv\|usePostStore\|/booking\|/demo" src/`. Fix or surface dead nav links (L23).
4. Tests for deleted code die with their source — delete them too; that's correct (L26).

## Stop Gate
Show deletion list, per-batch tsc results, link-sites found/fixed. Await review.

## Output
`src/services/` clean; demo routes gone; zero orphaned imports.
