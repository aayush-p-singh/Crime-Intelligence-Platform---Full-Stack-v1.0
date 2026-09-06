"""Compute dashboard intelligence metadata from retrieved articles and one AI result."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
import re
from typing import Any

from services.executive_briefing.parser import ExecutiveBriefing
from services.executive_briefing.retriever import RetrievedArticle


SEVERITY_KEYWORDS = {
    "critical": 24,
    "emergency": 22,
    "mass": 20,
    "deadly": 20,
    "ransomware": 18,
    "terror": 18,
    "attack": 15,
    "breach": 14,
    "threat": 12,
    "fraud": 10,
    "scam": 8,
}

CATEGORY_TERMS = {
    "cybercrime": ("cyber", "ransomware", "malware", "hack", "breach", "phishing"),
    "financialFraud": ("fraud", "scam", "bank", "payment", "investment", "ponzi"),
    "organizedCrime": ("organized crime", "gang", "cartel", "smuggling", "trafficking"),
    "terrorism": ("terror", "militant", "extremist", "bomb", "insurgent"),
    "internationalThreats": ("international", "global", "cross-border", "foreign", "geopolitical"),
}


def build_intelligence_metadata(
    articles: list[RetrievedArticle], briefing: ExecutiveBriefing
) -> dict[str, Any]:
    """Return additive intelligence metadata without invoking another model."""

    now = datetime.now(timezone.utc)
    return {
        "confidenceEvidence": _confidence_evidence(articles, briefing, now),
        "threatTimeline": _timeline(articles),
        "severityMatrix": _severity_matrix(articles, briefing),
    }


def _confidence_evidence(
    articles: list[RetrievedArticle], briefing: ExecutiveBriefing, now: datetime
) -> dict[str, Any]:
    count = len(articles)
    source_count_score = min(count / 10 * 45, 45)
    source_diversity = len({article.source_name for article in articles if article.source_name})
    diversity_score = min(source_diversity / 5 * 25, 25)
    dated_count = sum(bool(article.publication_date) for article in articles)
    date_score = (dated_count / count * 15) if count else 0
    recency_score = _recency_score(articles, now)
    score = round(min(source_count_score + diversity_score + date_score + recency_score, 100))
    quality = "High" if score >= 75 else "Moderate" if score >= 45 else "Limited"
    recency = "Current" if recency_score >= 12 else "Recent" if recency_score >= 6 else "Aged or unknown"
    return {
        "score": score,
        "sourceCount": count,
        "evidenceQuality": quality,
        "recency": recency,
        "assessment": _assessment(score, quality, recency, briefing),
    }


def _recency_score(articles: list[RetrievedArticle], now: datetime) -> float:
    dates: list[float] = []
    for article in articles:
        if not article.publication_date:
            continue
        try:
            value = datetime.fromisoformat(article.publication_date.replace("Z", "+00:00"))
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            age_days = max((now - value).total_seconds() / 86400, 0)
            dates.append(max(0, 15 - min(age_days, 15)))
        except ValueError:
            continue
    return sum(dates) / len(dates) if dates else 0


def _assessment(score: int, quality: str, recency: str, briefing: ExecutiveBriefing) -> str:
    risk = briefing.risk_level or "unassessed"
    return f"Evidence is {quality.lower()} quality and {recency.lower()}; AI assessed the national posture as {risk.lower()} with a confidence score of {score}/100."


def _timeline(articles: list[RetrievedArticle]) -> list[dict[str, Any]]:
    grouped: dict[str, list[RetrievedArticle]] = defaultdict(list)
    seen_events: set[str] = set()
    for article in articles:
        date = (article.publication_date or "Unknown")[:10]
        event_key = re.sub(r"\W+", " ", article.title.lower()).strip()
        if event_key in seen_events:
            continue
        seen_events.add(event_key)
        grouped[date].append(article)
    return [
        {
            "date": date,
            "events": [
                {"title": article.title, "summary": _summary(article.summary), "url": article.url}
                for article in grouped[date]
            ],
        }
        for date in sorted(grouped, reverse=True)
    ]


def _summary(value: str) -> str:
    sentence = re.split(r"(?<=[.!?])\s+", value.strip(), maxsplit=1)[0]
    return sentence[:240] or "No concise summary available."


def _severity_matrix(articles: list[RetrievedArticle], briefing: ExecutiveBriefing) -> list[dict[str, Any]]:
    combined_ai = " ".join((briefing.executive_summary, briefing.major_national_threats, briefing.major_international_threats, briefing.cybercrime_updates, briefing.financial_fraud_updates)).lower()
    total = max(len(articles), 1)
    matrix = []
    for category, terms in CATEGORY_TERMS.items():
        evidence = [f"{article.title} {article.summary}".lower() for article in articles]
        frequency = sum(any(term in item for term in terms) for item in evidence)
        keyword_points = sum(weight for keyword, weight in SEVERITY_KEYWORDS.items() if keyword in " ".join(evidence))
        ai_signal = sum(term in combined_ai for term in terms)
        score = round(min((frequency / total) * 55 + min(keyword_points, 35) + min(ai_signal * 4, 10), 100))
        matrix.append({"category": category, "score": score, "evidenceCount": frequency})
    return matrix