# RECOVERY.md

> Disaster-recovery anchor for this repo. Always reflects the true last state.
> Update at the end of every cluster. Written BEFORE any edits begin.

## Project
Starter Kit v3 build — hardening a fresh v2 clone via the `starter-kit-cleaner` skill.

## Last action
<cluster N — what was just done>

## Pending
<anything awaiting operator review/approval; "none" if clear>

## Next step
<the next cluster to run, or "Phase 8 complete — tagged v3">

## Invariants (do not violate)
- KEEP superadmin (three-tier RBAC).
- NEUTRAL design system — no coral / no brand values.
- Replay documented fixes only (see starter-kit-cleaner/references/DEFECT_LEDGER.md); new ideas are KIPs.
