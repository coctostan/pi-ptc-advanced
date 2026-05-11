"""Internal recipe artifact for the seeded hashline-anomaly-summary workflow."""

TARGETS = [
    "src/index.ts",
    "src/code-executor.ts",
    "src/tool-registry.ts",
    "README.md",
]

read_calls = [
    {"tool": "read", "params": {"path": target, "offset": 1, "limit": 80, "map": True}}
    for target in TARGETS
]
marker_calls = [
    {"tool": "grep", "params": {"pattern": "TODO|FIXME|HACK|XXX", "path": target}}
    for target in TARGETS
]

reads = await ptc.batch_tool(read_calls, max_concurrency=3)
markers = await ptc.batch_tool(marker_calls, max_concurrency=3)

anomalies = []
for target, read_result, marker_result in zip(TARGETS, reads, markers):
    lines = read_result.get("lines", []) if isinstance(read_result, dict) else []
    anchors = [line.get("anchor") for line in lines[:3] if isinstance(line, dict) and line.get("anchor")]
    marker_count = len(marker_result) if isinstance(marker_result, list) else 0
    if marker_count > 0 or len(lines) >= 60:
        anomalies.append(
            {
                "path": target,
                "marker_count": marker_count,
                "sample_anchors": anchors,
                "line_window": len(lines),
            }
        )

return ptc.fit_output(
    {
        "workflow": "hashline-anomaly-summary",
        "repos": ["pi-hashline-readmap"],
        "anomalies": anomalies[:8],
        "checked_paths": TARGETS,
    },
    max_chars=1500,
    max_items=8,
    max_depth=3,
)
