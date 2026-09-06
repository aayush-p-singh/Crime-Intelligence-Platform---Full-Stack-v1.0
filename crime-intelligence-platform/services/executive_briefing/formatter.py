"""Format the new briefing result for the existing frontend contract."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from services.executive_briefing.parser import ExecutiveBriefing
from services.executive_briefing.retriever import RetrievedArticle


@dataclass
class BriefingResponse:
    """Observable API response retaining legacy top-level briefing fields."""

    briefing: ExecutiveBriefing
    sources: list[RetrievedArticle]
    status: str = "success"
    error: str | None = None
    warnings: list[str] = field(default_factory=list)
    partial: bool = False
    retrieval_succeeded: bool = True
    retrieval_timestamp: str = ""
    confidence_evidence: dict[str, Any] = field(default_factory=dict)
    threat_timeline: list[dict[str, Any]] = field(default_factory=list)
    severity_matrix: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        briefing = self.briefing
        return {
            "executiveSummary": briefing.executive_summary,
            "majorNationalThreats": briefing.major_national_threats,
            "majorInternationalThreats": briefing.major_international_threats,
            "cybercrimeUpdates": briefing.cybercrime_updates,
            "financialFraudUpdates": briefing.financial_fraud_updates,
            "emergingCrimeTrends": briefing.emerging_crime_trends,
            "recommendedActions": briefing.recommended_actions,
            "riskLevel": briefing.risk_level,
            "confidence": briefing.confidence,
            "retrievalTimestamp": self.retrieval_timestamp,
            "retrievalRequired": True,
            "retrievalSucceeded": self.retrieval_succeeded,
            "status": self.status,
            "error": self.error,
            "warnings": self.warnings,
            "partial": self.partial,
            "sources": [
                {
                    "title": article.title,
                    "url": article.url,
                    "publicationDate": article.publication_date,
                    "summary": article.summary,
                    "sourceName": article.source_name,
                }
                for article in self.sources
            ],
            "confidenceEvidence": self.confidence_evidence,
            "threatTimeline": self.threat_timeline,
            "severityMatrix": self.severity_matrix,
        }