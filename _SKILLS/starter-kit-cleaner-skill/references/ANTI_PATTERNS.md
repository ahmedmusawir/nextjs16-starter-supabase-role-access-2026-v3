# ANTI-PATTERNS — Starter Kit Cleaner

Skill-specific traps. General skill anti-patterns live in the App Factory Skills Playbook; these are the ones that will bite *this* job.

## 1. Copying Cyber Pharma to make v3
The poster mistake. Cyber Pharma **diverged** — it deleted superadmin and added coral + OwedBook identity. Copying it (a) removes the superadmin v3 needs most, and (b) plants Cyber Pharma residue as a NEW fossil — the exact clone-debt trap the QR-hooktest lesson (L32) warns against. **v3 = fresh v2 + these documented fixes.** If discovery finds coral/owedbook/cyberize/cyberpharma residue, you're on the wrong base — STOP.

## 2. Reinventing a fix instead of replaying it
Every change traces to `DEFECT_LEDGER.md` + a lesson. If you catch yourself designing something new, you've left the rails. New ideas are **Kit Improvement Proposals** — surface them for the operator to accept or defer; never smuggle them into the cleanup.

## 3. Speculative authoring (Lesson 9 / K7)
Never patch a file you haven't read. If a referenced file isn't where the ledger expects, `find` it; if it's genuinely missing, STOP and surface it. Do not improvise a patch against an imagined file. This failure mode is the reason this whole effort exists.

## 4. Baking brand values into v3
Neutral only. The design system ships the token *structure* + neutral defaults + the dark-mode readability fix. Coral, Saira, Metro-flat radius, OwedBook — all of that is a downstream Stage-2 value swap. If you're typing a hex that looks like a brand color, stop.

## 5. Removing superadmin
Its removal was Cyber-Pharma-specific. Generic kits want three-tier RBAC, and the downstream Super Admin Portal is literally built on superadmin. Keep it. Keep all three derived flags. Keep the superadmin routes, layout, sidebar, and tests.

## 6. Sample-then-trust on grep-verifiable gates (L17)
"button.tsx is clean so the primitives are probably fine" is exactly how `dialog`, `dropdown-menu`, and `toast` slipped through Run 001. Any gate with a grep predicate runs its grep at cluster-close. Show the empty result.

## 7. tsc smoke on a stale `.next` (L25)
After deletions, a stale `.next/types/validator.ts` references gone routes and throws false errors. `rm -rf .next` before every `tsc --noEmit` between deletion batches.

## 8. Locking tokens on a style-tile pass alone (L16)
The style tile is necessary, not sufficient. After integrating the design system, walk the dark surfaces on a real `npm run dev` screen (cards-on-background elevation, muted text, form-field borders) before declaring tokens locked.

## 9. Predicting test counts from old session logs (L26)
Run the baseline fresh. Tests for deleted code die with their source — that's correct, not a regression. The Phase-E gate is "all remaining tests pass," never "≥ the old count."

## 10. Batching clusters / skipping stop gates
This is destructive work — 25+ deletions, a 20-file migration, a config rewrite. The operator reviews after every cluster. Propose → STOP → approve → execute → STOP. No exceptions without explicit operator override.
