"""
Build enriched prompts without coupling retrieval to Officer business logic.
"""

from __future__ import annotations

from services.retrieval.search_provider import SearchResult
from services.retrieval.source_formatter import format_sources_for_prompt


LIVE_INTELLIGENCE_PROMPT = """
You are an AI Crime Intelligence Officer.
You DO NOT have live internet access. The supplied retrieved evidence is your ONLY source for current events.

STRICT INSTRUCTIONS:
- Synthesize the evidence to answer the prompt. Do NOT summarize every article one by one.
- Do NOT repeat retrieved source content word-for-word.
- Do NOT produce unnecessary background, filler text, or conversational padding.
- Keep the overall response concise (Target 500-700 words maximum).
- Explicitly mention when evidence is incomplete or conflicting.
- Never claim to have live browsing capability.

Produce the response using EXACTLY this structure (do not add extra sections):

Executive Summary
[A concise answer to the user's question]

Key Findings
- [Bullet list of important confirmed findings]

Threat Assessment
[Explain current threat level and why]

Operational Impact
[Describe possible impact on police, investigators or citizens]

Recommended Actions
[Provide practical recommendations]

Confidence
[High / Medium / Low with a brief explanation]

Sources Consulted
[Mention source names and publication dates only]
""".strip()


COMPACT_LIVE_INTELLIGENCE_PROMPT = """
You are an AI Crime Intelligence Officer. 
Synthesize the provided evidence to answer the user's question.
You MUST be extremely concise to avoid exceeding generation length.

Provide ONLY:
1. A 2-sentence Executive Summary
2. 3 bullet points of Key Findings
3. 2 bullet points of Recommended Actions

Do NOT add any other sections. Do NOT summarize articles individually.
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