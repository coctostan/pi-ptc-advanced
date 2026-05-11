#!/usr/bin/env bash
set -euo pipefail

mode="focused"
if [[ "${1-}" == "--full" ]]; then
  mode="full"
  shift
elif [[ $# -gt 0 ]]; then
  echo "usage: $0 [--full]" >&2
  exit 1
fi

if [[ "$mode" == "focused" ]]; then
  echo "[verify:personal] running focused personal-fork verification"
  npm run build
  node --test \
    test/tool-registry.test.ts \
    test/hashline-default-exposure.test.ts \
    test/utils.test.ts \
    test/hashline-interop-smoke.test.ts
else
  echo "[verify:personal:full] running full personal-fork verification"
  npm test
fi
