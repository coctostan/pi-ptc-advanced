#!/usr/bin/env bash
set -euo pipefail

echo "[verify:release-package] building release package surface"
npm run build

node <<'NODE'
const pkg = require('./package.json');
const required = ['name', 'version', 'repository', 'homepage', 'bugs', 'license'];
for (const field of required) {
  if (!(field in pkg)) {
    console.error(`[verify:release-package] package.json missing required field: ${field}`);
    process.exit(1);
  }
}
if (pkg.version !== '0.8.0') {
  console.error(`[verify:release-package] expected version 0.8.0, found ${pkg.version}`);
  process.exit(1);
}
NODE

pack_output="$(npm pack --dry-run 2>&1)"
printf '%s\n' "$pack_output"

required_entries=(
  'README.md'
  'LICENSE'
  'package.json'
  'dist/index.js'
  'src/python-runtime/runtime.py'
)

for entry in "${required_entries[@]}"; do
  if ! grep -q "$entry" <<<"$pack_output"; then
    echo "[verify:release-package] expected packaged entry missing: $entry" >&2
    exit 1
  fi
done

for forbidden in '.paul/' 'docs/personal-fork-maintenance.md' 'scripts/verify-release-package.sh'; do
  if grep -q "$forbidden" <<<"$pack_output"; then
    echo "[verify:release-package] unexpected packaged entry present: $forbidden" >&2
    exit 1
  fi
done

echo "[verify:release-package] package metadata and tarball surface look correct"
