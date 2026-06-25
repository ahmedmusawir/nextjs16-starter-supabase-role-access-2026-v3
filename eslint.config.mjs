// Ported faithfully from DockBloxx's .eslintrc.json:
//   extends: ["next/core-web-vitals", "next/typescript"]
// eslint-config-next@16 ships NATIVE flat-config arrays, so we spread those
// presets directly. (The old FlatCompat bridge double-wraps them and throws
// "Converting circular structure to JSON" under ESLint 9 — don't use it here.)
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  // ESLint 9 needs explicit ignores (no more .eslintignore).
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // DIVERGENCE from bare DockBloxx: the `^_` ignore patterns are intentional.
      // Frozen-signature mock params (e.g. _storeId, _file) must keep their names
      // to satisfy the contract but are deliberately unused — without this they
      // throw false unused-var warnings.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
