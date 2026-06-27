# Security — Dependency Audit Disposition

> Recorded during the Starter Kit v3 "Kit Perfection" campaign (Gate 9, 2026-06-26).

## `npm audit` — 18 moderate, ALL dev-only

`npm audit` reports **18 moderate** advisories. **None are runtime/shippable:**

```
npm audit --omit=dev  →  found 0 vulnerabilities
```

So every advisory lives in the **dev toolchain** — the test/coverage tree:

```
js-yaml (moderate)
└─ @istanbuljs/load-nyc-config
   └─ babel-plugin-istanbul
      └─ @jest/transform → @jest/core / jest / jest-cli / ts-jest /
         @jest/reporters / jest-runner / jest-runtime / jest-snapshot / babel-jest
```

i.e. the `jest` + `ts-jest` + istanbul (coverage) chain. None ships to the browser
or server bundle (verified by `--omit=dev` = 0).

## Why we do NOT `npm audit fix --force`

`npm audit fix --force` applies **breaking** major bumps. On this repo that path
**already broke the jest tree once** (a `jest-mock` version skew that failed every
jsdom suite — see Gate-0/lint history, now pinned via `overrides`). Force-fixing
these dev advisories risks re-skewing the jest toolchain for **zero** runtime
security benefit.

**Disposition:** accept the 18 dev-only moderate advisories. Re-evaluate when the
jest/ts-jest majors are upgraded deliberately (not via `--force`). Runtime
dependency tree is clean.
