#!/usr/bin/env bash
set -euo pipefail

echo "[verify:ci] running focused verification"
npm run verify:personal

echo "[verify:ci] running full verification"
npm run verify:personal:full

echo "[verify:ci] running release-package verification"
npm run verify:release-package

echo "[verify:ci] all CI verification steps passed"
