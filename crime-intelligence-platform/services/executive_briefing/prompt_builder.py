"""Build the executive briefing prompt from article evidence only."""

from __future__ import annotations

from services.executive_briefing.retriever import RetrievedArticle


REQUIRED_FIELDS = (
    "executiveSummary",
    "majorNationalThreats",
    "majorInternationalThreats",
    "cybercrimeUpdates",
    "financialFraudUpdates",
    "emergingCrimeTrends",
    "recommendedActions",
    "riskLevel",
    "confidence",
)


class BriefingPromptBuilder:
    """Convert normalized evidence into a bounded, deterministic prompt."""

    def build(self, articles: list[RetrievedArticle]) -> str:
        """Build a prompt containing source evidence and required headings."""

        evidence = "\n\n".join(
            "\n".join(
                (
                    f"Source {index}: {article.title}",
                    f"Publisher: {article.source_name or 'Unknown'}",
                    f"Publication date: {article.publication_date or 'Unknown'}",
                    f"URL: {article.url}",
                    f"Summary: {article.summary or 'No summary available.'}",
                )
            )
            for index, article in enumerate(articles, start=1)
        ) or "No verified public articles were retrieved."
        schema = "\n".join(f'  "{field}": "string"' for field in REQUIRED_FIELDS)
        return (
            "You are a senior crime-intelligence analyst preparing an executive briefing.\n"
            "Use only the source evidence below for current claims. Do not invent facts,\n"
            "dates, statistics, sources, or events. Return only one valid JSON object.\n"
            "Do not use markdown fences, markdown tables, comments, or prose outside JSON.\n"
            "Every field is required and every value must be a JSON string.\n\n"
            f"Required JSON schema:\n{{\n{schema}\n}}\n\n"
            f"Source evidence:\n{evidence}"
        )