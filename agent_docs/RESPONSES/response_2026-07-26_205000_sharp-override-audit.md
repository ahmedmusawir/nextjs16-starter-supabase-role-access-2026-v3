# Response Log — sharp override applied + SECURITY.md disposition + husk staging

**Timestamp:** 2026-07-26 20:50
**Artifact type:** Execution report
**Authority:** operator — "override approved (apply + triad + audit-zero check), write
SECURITY.md disposition, stage husk deletion, RECOVERY.md stays."

---

## Headline

Override applied and verified. **Triad green. But the audit-zero check FAILED — and it
surfaced something the recon missed.**

Clearing `sharp` did not drop the count from 4 high to 0. It dropped it to **4 high made of
entirely different advisories.** The original recon reading ("4 high = sharp") was
incomplete: `npm audit`'s summary count had been aggregating several packages, and my recon
grep (`grep -E "severity|vulnerabilities|sharp|found"`) matched the sharp lines and missed
the rest. **The recon under-reported this finding.** Logged as a lesson.

## 1. Override — APPLIED ✅

```json
"overrides": {
  "postcss": "^8.5.10",
  "jest-mock": "30.4.1",
  "sharp": "^0.35.3"     // ← added
}
```

`npm ls sharp` → `next@16.2.6 └── sharp@0.35.3`. `sharp` no longer appears in `npm audit`.

**Triad — all green, no regression:**

| Check | Result |
|---|---|
| `rm -rf .next && npm run build` | EXIT 0, 16 routes |
| `npx tsc --noEmit` | EXIT 0 |
| `npx jest` | 76/76, 10 suites |

## 2. Audit-zero check — NOT ZERO ❌

```
npm audit             →  4 high
npm audit --omit=dev  →  3 high  (production tree)
```

| Package | Scope | Note |
|---|---|---|
| `next` | **prod** | GHSA-955p-x3mx-jcvp — unauthenticated disclosure of internal Server Function endpoints |
| `postcss` | prod + dev | GHSA-r28c-9q8g-f849 — path traversal via sourceMappingURL |
| `brace-expansion` | prod + dev | two DoS advisories |
| `js-yaml` | dev only | eslint tree |

### Path to zero — TESTED, NOT APPLIED

Tested in an isolated lockfile copy (`cp package.json package-lock.json` to scratch →
`npm install --package-lock-only` → `npm audit`). **No repo mutation.** Result:
**`found 0 vulnerabilities`.**

```jsonc
"dependencies":    { "next": "^16.2.12" },      // was ^16.2.1 → resolved 16.2.6
"devDependencies": { "postcss": "^8.5.23" },    // was ^8.5.10 → resolved 8.5.15
"overrides": {
  "postcss": "^8.5.23",
  "brace-expansion": "^5.0.8",
  "js-yaml": "^5.2.2",
  "sharp": "^0.35.3"                            // already applied
}
```

Two gotchas found the hard way:
- **`postcss` devDependency and override must move together** — npm errors `EOVERRIDE` if an
  override conflicts with its own direct dependency. My first scratch attempt failed on this.
- **The `next` bump is doing real work.** Most of the long `next` advisory list clears with
  the postcss fix ("depends on vulnerable versions of postcss"), but GHSA-955p-x3mx-jcvp is
  independent and needs 16.2.12. It is a **patch bump inside the same minor** — low risk —
  and it is the one genuinely application-facing advisory here.

**Not applied** per the standing rule: no `package.json` changes without explicit approval.
The approval given covered the sharp override specifically.

## 3. `docs/SECURITY.md` — REWRITTEN ✅

The old file asserted `npm audit --omit=dev → found 0 vulnerabilities`, which was **false**.
Replaced with: verified current state table, the sharp fix and why no Next release solves it,
a residual-risk note (native dep across a minor boundary; **no `next/image` usage in `src/`
today, so whoever adds the first optimized image must smoke-test it**), the preserved
"why not `--force`" rationale (the jest-mock skew history), and the tested path to zero.

Closing line added: *if `npm audit` and this table disagree, the audit wins and this file is
the bug* — the same disk-wins principle that drove the whole recon.

## 4. Husk deletion — STAGED ✅

```
D  agent_docs/CURRENT_APP/APP_BRIEF.md
D  agent_docs/CURRENT_APP/DATA_CONTRACT.md
D  agent_docs/CURRENT_APP/UI_SPECS.md
```

Only these three are staged. `git add -A agent_docs/CURRENT_APP/` was the single git command
run — everything else is left unstaged for the operator.

## 5. `RECOVERY.md` — UNTOUCHED ✅ (per instruction: "RECOVERY.md stays")

---

## Lesson for the recon skill

A summary count from `npm audit` is not an inventory. Grepping the audit output for a
suspected package name confirms *that* package but silently hides every other advisory in the
same count. **Recon should capture `npm audit --json` metadata plus the full package list,
not a grep for the package it already suspects.** Candidate addition to
`RECON_MISSION.md` Section 6.
