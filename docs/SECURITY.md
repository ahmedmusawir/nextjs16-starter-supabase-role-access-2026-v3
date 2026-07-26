# Security — Dependency Audit Disposition

> Last verified: **2026-07-26** (Phase 2 doc fix pass).
> Supersedes the Gate 9 (2026-06-26) disposition, which recorded "18 moderate, ALL dev-only,
> `--omit=dev` → 0". **That is no longer true** — the advisory landscape moved underneath it.
> Re-verify whenever `npm audit` output changes; a stale security disposition is worse than none.

## Current state

```
npm audit             →  4 high
npm audit --omit=dev  →  3 high   (production dependency tree)
```

| Package | Sev | Where | Status |
|---|---|---|---|
| `sharp` → libvips | high ×4 | prod (optional, via `next`) | ✅ **FIXED** — override to `^0.35.3` |
| `next` | high | prod | ⏳ open — fix available |
| `postcss` | high | prod + dev | ⏳ open — fix available |
| `brace-expansion` | high | prod + dev | ⏳ open — fix available |
| `js-yaml` | high | dev only (eslint tree) | ⏳ open — fix available |

## What was fixed, and why this way

### `sharp` / libvips — RESOLVED via `overrides`

CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
([GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)) affect `sharp`
below `0.35.0`. `sharp` is an **optional** dependency of `next`, used for `next/image`
optimization.

**No Next.js release fixes this.** Every stable version pins the vulnerable range:

| Next version | `optionalDependencies.sharp` |
|---|---|
| 16.2.6 | `^0.34.5` |
| 16.2.12 (`latest`, 2026-07) | `^0.34.5` |
| 16.3.0-canary | `^0.35.3` ← unreleased |

`^0.34.5` resolves `>=0.34.5 <0.35.0`, so it can never reach the patched line on its own.
Waiting for Next 16.3 was not acceptable, so the fix is an explicit override:

```json
"overrides": {
  "sharp": "^0.35.3"
}
```

Verified: `npm ls sharp` → `sharp@0.35.3`; `sharp` no longer appears in `npm audit`. Triad
re-run clean after the change — cold build EXIT 0 (16 routes), `tsc --noEmit` EXIT 0,
jest 76/76.

> **Residual risk note.** Overriding a transitive native dependency across a minor boundary
> (0.34 → 0.35) can in principle mismatch Next's image pipeline. The kit currently has **no
> `next/image` usage in `src/`** (only `images.remotePatterns` configured in
> `next.config.js`), so nothing exercises sharp today. **Whoever adds the first optimized
> image must smoke-test it** — a green build does not prove the image pipeline works.

## Why we do NOT `npm audit fix --force`

`npm audit fix --force` applies **breaking** major bumps. On this repo that path **already
broke the jest tree once** (a `jest-mock` version skew that failed every jsdom suite — see
Gate-0/lint history, now pinned via `overrides`). Targeted `overrides` are the house style
here: explicit, reviewable, and reversible one line at a time.

## Path to zero — verified, not yet applied

The remaining four advisories were tested in an isolated lockfile copy
(`npm install --package-lock-only` + `npm audit`, no repo mutation). This combination
produces **`found 0 vulnerabilities`**:

```jsonc
// package.json
"dependencies": {
  "next": "^16.2.12"          // was ^16.2.1 (resolved 16.2.6)
},
"devDependencies": {
  "postcss": "^8.5.23"        // was ^8.5.10 (resolved 8.5.15) — must move in lockstep
},                            //   with the override below, or npm errors EOVERRIDE
"overrides": {
  "postcss": "^8.5.23",
  "brace-expansion": "^5.0.8",
  "js-yaml": "^5.2.2",
  "sharp": "^0.35.3"          // already applied
}
```

Notes for whoever applies it:

- **`next` 16.2.6 → 16.2.12 is a patch bump inside the same minor.** It clears
  [GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp) — *unauthenticated
  disclosure of internal Server Function endpoints* — the one genuinely application-facing
  item on the list, and one that matters more than usual for an RBAC starter whose whole
  premise is that server boundaries hold.
- **`postcss` must be bumped in the devDependency AND the override together.** npm rejects an
  override that conflicts with its own direct dependency (`EOVERRIDE`).
- Most of the long `next` advisory list in `npm audit` output is "depends on vulnerable
  versions of postcss" and clears with the postcss bump — but the Server Function advisory
  above is independent and needs the version bump itself.

**Disposition:** the `sharp` fix is applied and verified. The remaining four are documented
with a proven remedy and are **awaiting an explicit decision** — they are not silently
accepted. If `npm audit` and this table ever disagree, the audit wins and this file is the bug.
