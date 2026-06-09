# Cluster 04 — Forbidden-Zone Migration (M6/M7/K3 / L17)

**Goal:** Zero numbered Tailwind colors. Role colors on tokens. Everything semantic.

## Steps
1. Follow `references/COLOR_MIGRATION.md`. Run the baseline grep; record hits.
2. Migrate by role using the mapping table: cards → `bg-card`, dialog/dropdown/popover → `bg-popover`, inputs → `bg-muted`, borders → `border-border`, secondary text → `text-muted-foreground`, focus → `ring-ring`. Toasts inherit via Sonner `theme`.
3. **Theme toggle:** consolidate the `ThemeToggler` (dropdown, numbered) and `ThemeToggle` (button) into ONE token-driven `ThemeToggle` (operator-confirmed name). Remove `bg-slate-700 text-white`. Update all import sites. (K3)
4. **Role colors → tokens:** replace `text-purple-600 / text-red-600 / text-green-600` with `text-role-superadmin / text-role-admin / text-role-member`. Admin must NOT reuse the destructive hue. (Tokens defined in Cluster 6's globals.) (M7)
5. **h1-h6 reset:** migrate the entry-CSS base reset to `text-foreground` (do here or fold into Cluster 5's .scss→.css move).
6. For identical className patterns across files, replace-all — but confirm byte-identical first (L27).

## Stop Gate (grep-at-close — MANDATORY)
Re-run the numbered-color grep across `src/`; show it returns **zero**. No sample-then-trust (L17). Await review.

## Output
Components + primitives fully token-driven; role colors tokenized; one ThemeToggle.
