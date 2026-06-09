# Cluster 07 — Generic Home Page (K6 / harvest §8)

**Goal:** A clean, token-driven marketing landing so new projects start with a real page, not a demo to delete.

## Steps
1. Replace the placeholder/demo landing at `src/app/(public)/page.tsx` (+ its `PageContent`).
2. Generalize the proven structure: hero (headline + subcopy + primary CTA) → trust row → feature grid → footer CTA. **Neutral copy** (e.g. "Your Product", lorem-free generic placeholders), no project branding, no OwedBook imagery.
3. Build from kit primitives (`Page`/`Row`/`Box`); token-driven only (verify against the Cluster-4 grep).
4. **Nav doctrine (L19/L20/L22):** marketing nav = server shell + client islands; theme toggle present; mobile hamburger present (the Log-in link is a real destination); auth-aware region reflects logged-in state (portal link + logout) WITHOUT auto-redirect.
5. Split hero transforms at `lg` (1024), not `md` (L18).

## Stop Gate
Show home page in light + dark, mobile (375) + desktop. Await review.

## Output
A generic marketing home page as the kit default.
