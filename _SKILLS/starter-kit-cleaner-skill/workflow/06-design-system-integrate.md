# Cluster 06 — Integrate the Design System, Neutral (M9/M10/K5 / L16)

**Goal:** Ship the token CONTRACT + neutral default + dark-mode readability fix + theme structure. NO coral.

## Steps
1. Install `templates/globals.neutral.css` as `src/app/globals.css` — full contract: `--background/--foreground`, `--card/--popover/--primary/--secondary/--muted/--accent` (+ `-foreground`), `--border/--input/--ring`, semantic `--destructive/--success/--warning/--info` (+fg), `--chart-1..5`, `--role-superadmin/admin/member`, `--radius`. Light (`:root`) + dark (`.dark`) + `.theme-bright` + `.dark.theme-deep`. Brand values **neutral**, not coral.
2. Merge in the Cluster-4 h1-h6 base reset (now `text-foreground`) if not already present.
3. **tailwind.config.ts:** confirm every token is mapped to a utility, including the new `--role-*` and status tokens. Add mappings if missing.
4. Wire the single token-driven `ThemeToggle` (from Cluster 4) into the nav surfaces.
5. **Dark-mode readability (L16):** the neutral default already sets background BELOW card, lifted `--muted-foreground`, firm `--border`. Verify the values survived install.
6. Place corrected docs: `agent_docs/APP_FACTORY/STARTER_KIT_HANDBOOK.md` (the v1.1), and under `agent_docs/APP_FACTORY/design-system/` the GDSH v1.1 + Theme Library v1.1 (from `references/`).

## Stop Gate (real-screen check — MANDATORY, L16)
`npm run dev`; walk dark surfaces: cards must elevate above background, muted text readable, form-field borders visible. Show the operator before locking. Await review.

## Output
Neutral design system integrated + verified on real screens; docs placed in agent_docs.
