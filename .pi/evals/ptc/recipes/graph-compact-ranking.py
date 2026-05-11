"""Internal recipe artifact for the seeded graph-compact-ranking workflow."""

QUERY_BUCKETS = [
    {"query": "CodeExecutor", "facet": "execution"},
    {"query": "ToolRegistry", "facet": "routing"},
    {"query": "normalizeToolResult", "facet": "interop"},
]

tools_by_name = {tool["name"]: tool for tool in ptc.list_callable_tools()}

if "symbol_search" not in tools_by_name:
    return {
        "workflow": "graph-compact-ranking",
        "missing_tools": ["symbol_search"],
        "available_tools": sorted(tools_by_name),
    }

search_calls = [
    {"tool": "symbol_search", "params": {"query": item["query"], "limit": 5}}
    for item in QUERY_BUCKETS
]

ranked_hits = await ptc.reduce_tool(
    search_calls,
    lambda acc, entry: acc
    + [
        {
            "symbol": match.get("name") or match.get("symbol") or "unknown",
            "path": match.get("file") or match.get("path"),
            "kind": match.get("kind"),
            "score": max(1, 6 - index),
        }
        for index, match in enumerate((entry if isinstance(entry, list) else [])[:3])
        if isinstance(match, dict)
    ],
    initial=[],
    max_concurrency=2,
)

collapsed = {}
for hit in ranked_hits:
    key = (hit["symbol"], hit.get("path"))
    existing = collapsed.get(key)
    if existing is None:
        collapsed[key] = {**hit, "sources": 1}
    else:
        existing["score"] += hit["score"]
        existing["sources"] += 1

top_symbols = sorted(
    collapsed.values(),
    key=lambda item: (-item["score"], -item["sources"], str(item["symbol"])),
)[:5]

return ptc.fit_output(
    {
        "workflow": "graph-compact-ranking",
        "repos": ["pi-codegraph"],
        "ranked_symbols": top_symbols,
        "selection_notes": "Keep only compact symbol rankings with minimal impact evidence.",
    },
    max_chars=1200,
    max_items=5,
    max_depth=3,
)
