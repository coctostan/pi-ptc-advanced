#!/usr/bin/env bash
set -euo pipefail

if ! command -v pi >/dev/null 2>&1; then
  echo "error: pi is not on PATH" >&2
  exit 1
fi

# Personal analysis-oriented PTC profile:
# - keep rich read-only tooling available inside code_execution when Pi exposes it to PTC
# - prefer sg + selected graph analysis tools when their runtime metadata is present
# - keep mutating and shell tools blocked
# - pair this launcher with `npm run verify:personal` / `npm run verify:personal:full`
# - maintainer runbook: docs/personal-fork-maintenance.md
export PTC_ALLOW_MUTATIONS=false
export PTC_ALLOW_BASH=false
export PTC_CALLABLE_TOOLS="read,glob,find,grep,ls,sg,symbol_card,trace,impact,graph_query,symbol_graph"
export PTC_TRUSTED_READ_ONLY_TOOLS="sg,symbol_card,trace,impact,graph_query,symbol_graph"

cat <<'EOF'
Starting Pi with personal analysis-oriented PTC callable surface:
  PTC_ALLOW_MUTATIONS=false
  PTC_ALLOW_BASH=false
  PTC_CALLABLE_TOOLS=read,glob,find,grep,ls,sg,symbol_card,trace,impact,graph_query,symbol_graph
  PTC_TRUSTED_READ_ONLY_TOOLS=sg,symbol_card,trace,impact,graph_query,symbol_graph
Notes:
- Included analysis tools: sg, symbol_card, trace, impact, graph_query, symbol_graph
- Excluded on purpose: edit, write, bash, resolve_edge, delete_edge
- Read-only extension tools still need PTC_TRUSTED_READ_ONLY_TOOLS when PTC_ALLOW_MUTATIONS=false
- PTC_CALLABLE_TOOLS does not inject missing tools; Pi still has to expose them to PTC with callable runtime + metadata
- If a requested tool is absent from the current Pi tool set, PTC will now warn instead of silently implying the allowlist should have been enough
- lsp is excluded here to keep the surface tighter; add it manually if you want it
- These settings are read when the extension starts, so use this for a fresh session
- Routine repo checks: npm run verify:personal
- Higher-confidence repo checks: npm run verify:personal:full
- Full maintainer workflow: docs/personal-fork-maintenance.md
EOF

exec pi "$@"
