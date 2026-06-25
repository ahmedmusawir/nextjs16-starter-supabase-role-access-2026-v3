#!/usr/bin/env bash
#
# lint-check.sh — manual ESLint verify for the starter kit.
#
# Every clone ships with this so you can run the same whole-repo lint pass
# the kit was hardened with, without remembering the exact invocation.
#
# Usage:
#   ./scripts/lint-check.sh            # lint the whole repo (report only)
#   ./scripts/lint-check.sh --fix      # apply safe autofixes (use deliberately)
#
# All rules are "warn", so a clean repo exits 0. Warnings are informational.

set -euo pipefail

# Run from the repo root regardless of where this is called from.
cd "$(dirname "$0")/.."

echo "==> ESLint (flat config) across the whole repo"
npx eslint . "$@"
echo "==> Done."
