# Cluster 02 — Kill the Clone-Debt (M2/M3 / L32, §2B)

**Goal:** Remove cross-project residue that rode along through clones. This breaks the clone-of-a-clone chain — the core reason v3 exists.

## Targets (confirm first)
- `src/app/api/ghl/hooktest/route.ts` — year-old GoHighLevel webhook from an unrelated QR project. Pure clone-debt. Delete (the whole `api/ghl/` if it holds nothing else).
- `src/app/(public)/template/` (or wherever `/template` resolves) — kit copy-me page.
- `src/app/**/layout-org.tsx` — stray.
- `src/styles/` stale `global.scss` duplicate.

## Steps
1. `find src -iname "*ghl*" -o -iname "*hooktest*" -o -iname "layout-org*"` and `ls src/styles 2>/dev/null`.
2. Delete confirmed fossils. `rm -rf .next && npx tsc --noEmit`.
3. Re-run residue grep: `grep -rniE "ghl|hooktest|qr|template" src/app` — confirm only legitimate hits remain (none project-foreign).

## Stop Gate
Show removed fossils + clean residue grep. Await review.

## Output
Zero cross-project residue. The QR ghost dies at v3.
