"""Data models for the Executive Intelligence Briefing API."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class BriefingSource:
    """A source displayed with an executive briefing."""

    title: str
    url: str
    publication_date: str | None
    summary: str
    source_name: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "url": self.url,
            "publicationDate": self.publication_date,
            "summary": self.summary,
            "sourceName": self.source_name,
        }


@dataclass(frozen=True)
class ExecutiveBriefing:
    """Stable structured response returned by the briefing endpoint."""

    executive_summary: str
    major_national_threats: str
    major_international_threats: str
    cybercrime_updates: str
    financial_fraud_updates: str
    emerging_crime_trends: str
    recommended_actions: str
    risk_level: str
    confidence: str
    retrieval_timestamp: str
    sources: list[BriefingSource]
    retrieval_required: bool
    retrieval_succeeded: bool
    notice: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "executiveSummary": self.executive_summary,
            "majorNationalThreats": self.major_national_threats,
            "majorInternationalThreats": self.major_international_threats,
            "cybercrimeUpdates": self.cybercrime_updates,
            "financialFraudUpdates": self.financial_fraud_updates,
            "emergingCrimeTrends": self.emerging_crime_trends,
            "recommendedActions": self.recommended_actions,
            "riskLevel": self.risk_level,
            "confidence": self.confidence,
            "retrievalTimestamp": self.retrieval_timestamp,
            "sources": [source.to_dict() for source in self.sources],
            "retrievalRequired": self.retrieval_required,
            "retrievalSucceeded": self.retrieval_succeeded,
            "notice": self.notice,
        }