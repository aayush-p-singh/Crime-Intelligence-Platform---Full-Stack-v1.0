"""Data models for map threat-intelligence payloads."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ThreatStateAssessment:
    """Normalized intelligence assessment for one Indian state or territory."""

    name: str
    risk_level: str
    threat_score: float
    confidence: str
    last_updated: str
    historical_statistics: dict[str, Any]
    prediction: dict[str, Any]
    recent_intelligence: str
    cyber_activity: str
    financial_fraud_activity: str
    emerging_threats: list[str]
    executive_summary: str
    threat_assessment: str
    police_recommendations: list[str]
    citizen_recommendations: list[str]
    recent_headlines: list[dict[str, Any]] = field(default_factory=list)
    supporting_sources: list[dict[str, Any]] = field(default_factory=list)
    category_scores: dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "riskLevel": self.risk_level,
            "threatScore": self.threat_score,
            "confidence": self.confidence,
            "lastUpdated": self.last_updated,
            "historicalStatistics": self.historical_statistics,
            "prediction": self.prediction,
            "recentIntelligence": self.recent_intelligence,
            "cyberActivity": self.cyber_activity,
            "financialFraudActivity": self.financial_fraud_activity,
            "emergingThreats": self.emerging_threats,
            "executiveSummary": self.executive_summary,
            "threatAssessment": self.threat_assessment,
            "policeRecommendations": self.police_recommendations,
            "citizenRecommendations": self.citizen_recommendations,
            "recentHeadlines": self.recent_headlines,
            "supportingSources": self.supporting_sources,
            "categoryScores": self.category_scores,
        }
