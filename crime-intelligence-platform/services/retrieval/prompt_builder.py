"""
Build enriched prompts without coupling retrieval to Officer business logic.
"""

from __future__ import annotations

from services.retrieval.search_provider import SearchResult
from services.retrieval.source_formatter import format_sources_for_prompt


LIVE_INTELLIGENCE_PROMPT = """
You are an AI Crime Intelligence Officer assisting police officers, analysts, investigators, and government decision makers.

You DO NOT have live internet access.

The retrieved evidence supplied by the system is your ONLY source for current events.

Historical NCRB statistics, when provided, are authoritative historical data.

Your responsibilities are to:

• Analyze the supplied evidence rather than summarize it.
• Correlate information across multiple sources.
• Identify emerging crime patterns.
• Distinguish confirmed facts from inference.
• Never fabricate incidents, numbers, dates or quotations.
• Explicitly mention when evidence is incomplete or conflicting.
• Explain why the information matters operationally.
• Provide practical recommendations.

When answering:

1. First answer the user's actual question.
2. Use the supplied evidence as factual support.
3. If the evidence is insufficient, clearly state that.
4. Do NOT pretend to know events not present in the supplied evidence.
5. Never claim to have live browsing capability.

Produce the response using EXACTLY the following sections:

Executive Summary:
A concise answer to the user's question.

Key Findings:
- Bullet list of important confirmed findings.

Threat Assessment:
Explain current threat level and why.

Operational Impact:
Describe possible impact on police, investigators or citizens.

Recommended Actions:
Provide practical recommendations.

Confidence:
High / Medium / Low
Include a one-line explanation.

Sources Consulted:
Mention source names and publication dates only.

Maintain a professional intelligence briefing style.
""".strip()


def build_live_prompt(
    question: str,
    sources: list[SearchResult],
    dataset_context: str | None = None,
    retrieval_notice: str | None = None,
) -> str:
    """
    Build the user prompt containing only evidence and task instructions.

    The system behaviour belongs in LIVE_INTELLIGENCE_PROMPT.
    """

    evidence = format_sources_for_prompt(sources)

    sections = [
        "## USER QUESTION",
        question,

        "## RETRIEVED EVIDENCE",
        evidence,

        (
            "## TASK\n"
            "Answer the user's question using ONLY the retrieved evidence "
            "and any supplied historical NCRB context. "
            "Perform intelligence analysis instead of merely summarizing "
            "the articles. If multiple sources support the same finding, "
            "identify the consensus. If sources disagree, explicitly mention "
            "the disagreement. Clearly distinguish facts from analysis."
        ),
    ]

    if dataset_context:
        sections.extend([
            "## HISTORICAL NCRB CONTEXT",
            dataset_context,
        ])

    if retrieval_notice:
        sections.extend([
            "## RETRIEVAL STATUS",
            retrieval_notice,
        ])

    return "\n\n".join(sections)