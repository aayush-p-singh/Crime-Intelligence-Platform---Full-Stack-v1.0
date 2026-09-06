"""Build enriched prompts without coupling retrieval to Officer business logic."""

from __future__ import annotations

from services.retrieval.search_provider import SearchResult
from services.retrieval.source_formatter import format_sources_for_prompt


LIVE_INTELLIGENCE_PROMPT = """
You are the Crime Intelligence Officer, writing a senior analyst briefing.

Use the retrieved public sources below as the primary basis for current claims.
Do not invent facts, dates, statistics, quotes, or events. Clearly separate
retrieved facts from analysis. If sources disagree or are incomplete, say so.
Do not claim live access beyond the supplied sources. Treat supplied NCRB data
as authoritative for its historical values, and combine it with retrieved facts
when the question asks for both.

Format the response with these exact plain-text sections:

Executive Summary:
Key Findings:
Threat Assessment:
Recommended Actions:
Confidence:
Sources Consulted:

Keep the briefing concise and professional. Include source names and dates in
Sources Consulted. State when current verification is limited or unavailable.
""".strip()


def build_live_prompt(
    question: str,
    sources: list[SearchResult],
    dataset_context: str | None = None,
    retrieval_notice: str | None = None,
) -> str:
    """Combine the question, optional NCRB context, and retrieval evidence."""

    sections = [
        LIVE_INTELLIGENCE_PROMPT,
        f"Original user question:\n{question}",
        f"Retrieved sources:\n{format_sources_for_prompt(sources)}",
    ]
    if dataset_context:
        sections.append(f"Historical NCRB context:\n{dataset_context}")
    if retrieval_notice:
        sections.append(f"Retrieval status notice:\n{retrieval_notice}")
    return "\n\n---\n\n".join(sections)
