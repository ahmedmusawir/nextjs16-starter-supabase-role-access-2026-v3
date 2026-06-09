# starter-kit-cleaner (Agent Skill)

Hardens a **fresh clone of Starter Kit v2** into a clean, generic **Starter Kit v3** by replaying the documented Run 001 kit-level fixes. Keeps the superadmin portal. Stays brand-neutral (no coral). Does not build any project feature.

## Use
1. Drop this whole folder into the **root of a fresh v2 clone**.
2. Tell the agent: **"Read `starter-kit-cleaner/CLAUDE.md` and follow it."**
3. That's the only step. The agent runs a ground-truth sweep, presents a plan, waits for your `APPROVED`, then executes 8 clusters — stopping for your review after each.

## What's inside
- `CLAUDE.md` — the manager: activation, doctrine, gates (read first).
- `SKILL.md` — the phase-by-phase methodology.
- `references/` — the defect ledger (Part A), replayable diffs, the corrected v1.1 handbook + design-system docs, anti-patterns.
- `workflow/` — the 8 clusters, in order.
- `templates/` — `.env.local.example`, the neutral `globals.css` token contract, `RECOVERY.md`.

## Boundaries
Replay, don't reinvent. Keep superadmin. Stay neutral. Do NOT run against a Cyber Pharma clone. Stage 2 (Super Admin Portal) is a separate effort that clones the v3 this skill produces.
