"""Internal recipe artifact for the seeded codegraph-web-evidence-merge workflow."""

QUESTION = "Summarize the strongest public explanation for how CodeExecutor and tool routing interact."
tools_by_name = {tool["name"]: tool for tool in ptc.list_callable_tools()}

graph_calls = []
if "symbol_card" in tools_by_name:
    graph_calls.append({"tool": "symbol_card", "params": {"name": "CodeExecutor", "maxSourceLines": 20}})
if "symbol_search" in tools_by_name:
    graph_calls.append({"tool": "symbol_search", "params": {"query": "CodeExecutor", "limit": 3}})

graph_result = (
    await ptc.first_success(graph_calls, max_concurrency=2)
    if graph_calls
    else {"available_tools": sorted(tools_by_name)}
)
web_result = await fetch_content(url="https://example.com/pi-interop", prompt=QUESTION)
response_handle = ptc.first_handle(web_result, kind="response")

if isinstance(graph_result, list):
    codegraph_evidence = [
        {
            "name": entry.get("name") or entry.get("symbol") or "CodeExecutor",
            "path": entry.get("file") or entry.get("path"),
        }
        for entry in graph_result[:3]
        if isinstance(entry, dict)
    ]
else:
    codegraph_evidence = [graph_result]

return ptc.fit_output(
    {
        "workflow": "codegraph-web-evidence-merge",
        "repos": ["pi-codegraph", "pi-web-tools"],
        "merged_conclusion": "Combine the strongest codegraph evidence with one bounded web explanation.",
        "codegraph_evidence": codegraph_evidence,
        "web_evidence": {
            "response_handle": response_handle,
            "all_handles": ptc.extract_handles(web_result),
        },
    },
    max_chars=1500,
    max_items=6,
    max_depth=3,
)
