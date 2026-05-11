"""Internal recipe artifact for the seeded web-answer-comparison workflow."""

QUESTION = "Summarize the primary answer and only keep disagreement-level evidence."
URLS = [
    "https://example.com/ptc-overview",
    "https://example.com/ptc-reference",
    "https://example.com/ptc-notes",
]

fetch_calls = [
    {"tool": "fetch_content", "params": {"url": url, "prompt": QUESTION}}
    for url in URLS
]
fetches = await ptc.batch_tool(fetch_calls, max_concurrency=2)

answers = []
for url, payload in zip(URLS, fetches):
    answer_text = payload.get("answer") if isinstance(payload, dict) else str(payload)
    response_handle = ptc.first_handle(payload, kind="response")
    answers.append(
        {
            "url": url,
            "answer": str(answer_text).strip()[:280],
            "response_handle": response_handle,
            "all_handles": ptc.extract_handles(payload),
        }
    )

shared_terms = None
for answer in answers:
    words = {word.lower().strip(".,:;!?()[]{}") for word in answer["answer"].split() if word.strip()}
    shared_terms = words if shared_terms is None else shared_terms & words

shared_terms = sorted(shared_terms or [])[:10]
disagreements = []
for answer in answers:
    differing_words = [
        word
        for word in answer["answer"].split()
        if word.lower().strip(".,:;!?()[]{}") not in shared_terms
    ]
    if differing_words:
        disagreements.append(
            {
                "url": answer["url"],
                "disagreement": " ".join(differing_words[:18]),
                "response_handle": answer["response_handle"],
            }
        )

return ptc.fit_output(
    {
        "workflow": "web-answer-comparison",
        "repos": ["pi-web-tools"],
        "shared_conclusion": " ".join(shared_terms[:12]),
        "disagreements": disagreements[:3],
        "sources": [{"url": entry["url"], "handles": entry["all_handles"][:1]} for entry in answers],
    },
    max_chars=1200,
    max_items=3,
    max_depth=3,
)
