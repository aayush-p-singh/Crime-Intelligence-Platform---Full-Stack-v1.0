"""Convert Sarvam output and retrieval metadata into a stable briefing model."""

from __future__ import annotations

import re

from services.briefing.models import BriefingSource, ExecutiveBriefing
from services.retrieval.retrieval_service import RetrievalResult


SECTION_NAMES = (
    "Executive Summary",
    "Major National Threats",
    "Major International Threats",
    "Cybercrime Updates",
    "Financial Fraud Updates",
    "Emerging Crime Trends",
    "Recommended Actions",
    "Risk Level",
    "Confidence",
)
def _clean(value: str) -> str:
    return " ".join(value.replace("**", "").split()).strip()


def _parse_sections(text: str) -> dict[str, str]:
    parsed: dict[str, str] = {}
    current_name: str | None = None
    current_lines: list[str] = []

    def flush() -> None:
        if current_name is not None:
            parsed[current_name] = _clean(" ".join(current_lines))

    for line in (text or "").splitlines():
        normalized = line.strip().strip("#*").strip()
        matched_name = next(
            (
                name
                for name in SECTION_NAMES
                if normalized.lower() == name.lower()
                or normalized.lower().startswith(f"{name.lower()}:")
            ),
            None,
        )
        if matched_name is None:
            if current_name is not None:
                current_lines.append(line)
            continue

        flush()
        current_name = matched_name
        inline_value = normalized[len(matched_name):].lstrip()
        current_lines = [inline_value[1:].strip()] if inline_value.startswith(":") else []

    flush()
    return parsed


def _value_or_default(
    sections: dict[str, str], key: str, fallback: str
) -> str:
    value = sections.get(key, "")
    return value or fallback


def _risk_level(value: str) -> str:
    match = re.search(r"\b(CRITICAL|HIGH|MODERATE|MEDIUM|LOW)\b", value.upper())
    return match.group(1).title() if match else "Unassessed"


def _sources(result: RetrievalResult) -> list[BriefingSource]:
    return [
        BriefingSource(
            title=source.get("title", "Untitled source"),
            url=source.get("url", ""),
            publication_date=source.get("publicationDate"),
            summary=source.get("summary", ""),
            source_name=source.get("sourceName"),
        )
        for source in result.sources
        if source.get("url")
    ]


def format_briefing(
    response_text: str,
    retrieval: RetrievalResult,
    fallback_notice: str | None = None,
) -> ExecutiveBriefing:
    """Parse an LLM response while guaranteeing every required API field."""

    sections = _parse_sections(response_text)
    source_notice = retrieval.notice or fallback_notice
    default = "No verified assessment was generated for this section."
    confidence = _value_or_default(sections, "Confidence", "Low")
    if source_notice:
        confidence = f"Limited: {confidence}"

    return ExecutiveBriefing(
        executive_summary=_value_or_default(sections, "Executive Summary", default),
        major_national_threats=_value_or_default(sections, "Major National Threats", default),
        major_international_threats=_value_or_default(sections, "Major International Threats", default),
        cybercrime_updates=_value_or_default(sections, "Cybercrime Updates", default),
        financial_fraud_updates=_value_or_default(sections, "Financial Fraud Updates", default),
        emerging_crime_trends=_value_or_default(sections, "Emerging Crime Trends", default),
        recommended_actions=_value_or_default(sections, "Recommended Actions", default),
        risk_level=_risk_level(_value_or_default(sections, "Risk Level", "Unassessed")),
        confidence=confidence,
        retrieval_timestamp=retrieval.retrieved_at,
        sources=_sources(retrieval),
        retrieval_required=retrieval.required,
        retrieval_succeeded=retrieval.succeeded,
        notice=source_notice,
    )


def fallback_text(notice: str) -> str:
    """Provide a safe structured prompt when public retrieval is unavailable."""

    return "\n".join(
        [
            "Executive Summary: Current public-source verification is unavailable. Provide a cautious general assessment and label it unverified.",
            "Major National Threats: Identify only broad, non-specific threat categories from general knowledge.",
            "Major International Threats: Identify only broad, non-specific threat categories from general knowledge.",
            "Cybercrime Updates: Provide general defensive context without claiming recent events.",
            "Financial Fraud Updates: Provide general defensive context without claiming recent events.",
            "Emerging Crime Trends: State that current trend verification is unavailable.",
            "Recommended Actions: Recommend monitoring official advisories and validating current intelligence.",
            "Risk Level: Unassessed",
            f"Confidence: Limited. {notice}",
        ]
    )