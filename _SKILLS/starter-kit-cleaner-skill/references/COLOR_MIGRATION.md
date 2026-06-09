# COLOR MIGRATION — Numbered → Semantic Tokens (Defects M6/M7 / L17)

> Replay the forbidden-zone color migration. Goal: **zero numbered Tailwind colors** in components and primitives; everything reads tokens. Confirm each hit with grep first; migrate; prove zero at close.

## Baseline grep (run first, record the count)

```bash
# numbered color utilities in source (the forbidden zone)
grep -rnE "(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" src/ \
  | grep -v "node_modules"
```

Run 001 baseline: ~20+ hits across `ThemeToggler.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx`, and the `h1-h6` reset. `button.tsx` was already clean — do NOT assume the rest are.

## The mapping (numbered → token)

These are the proven replacements (the values the Cyber Pharma repo actually shipped). Apply by **role**, not by guessing a hue:

| Numbered (forbidden) | Semantic token (use) |
|---|---|
| `bg-white` / `bg-zinc-800` (cards/panels) | `bg-card text-card-foreground` |
| `bg-white dark:bg-slate-800` (dialog/dropdown/popover) | `bg-popover text-popover-foreground` |
| `bg-white dark:bg-zinc-900` (toast — Sonner) | inherit via Sonner `theme`; no numbered classes |
| `bg-slate-100 dark:bg-slate-500` (inputs) | `bg-muted text-foreground` |
| `bg-slate-700 text-white` (ThemeToggler button) | `bg-secondary text-secondary-foreground` or `variant="ghost"` |
| `border-gray-200 dark:border-gray-700` | `border-border` |
| `text-gray-500 dark:text-white` (secondary text) | `text-muted-foreground` |
| `text-gray-900 dark:text-white` (h1-h6 reset) | `text-foreground` |
| focus rings `ring-slate-400` etc. | `ring-ring` |

## Role colors (M7 — the collision fix)

The §2 "Role Color Standard" used `text-purple-600 / text-red-600 / text-green-600`. Two problems: numbered, and `admin → red` collides with `destructive → red`. Convert to role tokens:

```
superadmin → text-role-superadmin
admin      → text-role-admin       (MUST be distinct from --destructive)
member     → text-role-member
```

The token values are defined in `globals.css` (see `templates/globals.neutral.css`) and the Theme Library. Find role-color sites:

```bash
grep -rnE "(purple|red|green)-(400|600)" src/ | grep -iE "role|admin|member|superadmin"
```

## Technique

- For a className string repeated **identically** across files, `str_replace` (or editor replace-all) is efficient — but verify the pattern is byte-identical first (whitespace + class ordering), else you'll miss or mangle (L27).
- The `h1-h6` reset lives in the entry CSS `@layer base` — migrate it there as part of the `.scss → .css` move (Cluster 5) or here; either way it must end on `text-foreground`.
- Do not touch numbered values that are NOT colors (e.g. `p-6`, `gap-4`, `w-9`, `h-[1.2rem]`, `z-[9999]`) — the grep above is scoped to color utilities for that reason.

## Grep-at-close (mandatory)

Re-run the baseline grep. It must return **zero** hits in `src/`. Show the operator the empty result. No sample-then-trust (L17 — that's exactly how three primitives slipped through in Run 001).

```bash
grep -rnE "(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" src/ | grep -v node_modules
# expected: (no output)
```
