"""Independent threat-intelligence orchestration for the national map."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Callable

from dotenv import load_dotenv
from sarvamai import SarvamAI

from graph.neo4j_connection import Neo4jConnection
from services.briefing.briefing_service import BriefingService
from services.briefing.models import ExecutiveBriefing
from services.prediction import prediction_service
from services.retrieval.retrieval_service import RetrievalResult, RetrievalService
from services.retrieval.source_formatter import format_sources_for_prompt
from services.threats.models import ThreatStateAssessment

load_dotenv()

CATEGORY_KEYS = (
    "overallThreat",
    "cybercrime",
    "womenSafety",
    "financialFraud",
    "organizedCrime",
    "propertyCrime",
    "violentCrime",
    "emergingCrimes",
)

RISK_LABELS = ("Low", "Guarded", "Elevated", "High", "Critical")


class ThreatIntelligenceService:
    """Build map assessments without changing legacy map or analytics services."""

    def __init__(
        self,
        state_loader: Callable[[], list[dict[str, Any]]] | None = None,
        prediction_service_instance: Any = prediction_service,
        briefing_service: BriefingService | None = None,
        retrieval_service: RetrievalService | None = None,
        llm_client: Any | None = None,
    ) -> None:
        self._state_loader = state_loader or self._load_states
        self._prediction_service = prediction_service_instance
        self._briefing_service = briefing_service or BriefingService()
        self._retrieval_service = retrieval_service or RetrievalService()
        self._llm_client = llm_client or SarvamAI(
            api_subscription_key=os.getenv("SARVAM_API_KEY")
        )

    def get_overview(self) -> list[dict[str, Any]]:
        """Return an assessment for every state, falling back safely per state."""

        briefing = self._get_briefing()
        assessments = []
        for state in self._state_loader():
            try:
                assessments.append(self._assess_state(state, briefing).to_dict())
            except Exception as error:
                assessments.append(self._fallback_assessment(state, briefing, error).to_dict())
        return assessments

    def get_state(self, state_name: str) -> dict[str, Any] | None:
        """Return a detailed assessment with state-specific live retrieval."""

        state = next(
            (item for item in self._state_loader() if item["name"].lower() == state_name.lower()),
            None,
        )
        if state is None:
            return None

        briefing = self._get_briefing()
        assessment = self._assess_state(state, briefing)
        retrieval = self._retrieve_state_intelligence(state["name"])
        if retrieval.required and retrieval.succeeded:
            assessment = self._apply_state_retrieval(assessment, retrieval)
        return assessment.to_dict()

    def _load_states(self) -> list[dict[str, Any]]:
        database = Neo4jConnection()
        query = """
        MATCH (s:State)
        RETURN s.name AS name,
               s.crimeRate AS crimeRate,
               s.totalCrime AS totalCrime,
               s.womenCrime AS womenCrime,
               s.chargesheetRate AS chargesheetRate,
               s.crime2020 AS crime2020,
               s.crime2021 AS crime2021,
               s.crime2022 AS crime2022
        ORDER BY s.name
        """
        with database.driver.session() as session:
            return [dict(record) for record in session.run(query)]

    def _get_briefing(self) -> ExecutiveBriefing:
        try:
            return self._briefing_service.generate()
        except Exception:
            return ExecutiveBriefing(
                executive_summary="Live executive briefing unavailable; historical indicators are being used.",
                major_national_threats="Unavailable",
                major_international_threats="Unavailable",
                cybercrime_updates="Unavailable",
                financial_fraud_updates="Unavailable",
                emerging_crime_trends="Unavailable",
                recommended_actions="Verify current advisories through official channels.",
                risk_level="Unassessed",
                confidence="Low",
                retrieval_timestamp=datetime.now(timezone.utc).isoformat(),
                sources=[],
                retrieval_required=True,
                retrieval_succeeded=False,
                notice="Executive briefing retrieval failed.",
            )

    def _assess_state(
        self, state: dict[str, Any], briefing: ExecutiveBriefing
    ) -> ThreatStateAssessment:
        prediction = self._safe_prediction(state["name"])
        historical = self._historical_statistics(state)
        score = self._threat_score(historical, prediction, briefing)
        risk_level = self._risk_level(score)
        confidence = self._confidence(prediction, briefing)
        timestamp = datetime.now(timezone.utc).isoformat()
        sources = list(briefing.sources)
        source_dicts = [source.to_dict() for source in sources]
        headlines = source_dicts[:5]
        category_scores = self._category_scores(historical, score)
        emerging = ["Cybercrime", "Financial fraud", "Digital identity abuse"]

        return ThreatStateAssessment(
            name=state["name"],
            risk_level=risk_level,
            threat_score=score,
            confidence=confidence,
            last_updated=timestamp,
            historical_statistics=historical,
            prediction=prediction,
            recent_intelligence=briefing.executive_summary,
            cyber_activity=briefing.cybercrime_updates,
            financial_fraud_activity=briefing.financial_fraud_updates,
            emerging_threats=emerging,
            executive_summary=(
                f"AI synthesis for {state['name']}: {briefing.executive_summary} "
                f"Historical indicators place this jurisdiction at a {risk_level.lower()} threat posture."
            ),
            threat_assessment=(
                f"Threat score {score}/100 with {confidence.lower()} confidence. "
                f"Prediction trend: {prediction.get('trend', 'Unavailable')}."
            ),
            police_recommendations=self._police_recommendations(risk_level),
            citizen_recommendations=self._citizen_recommendations(),
            recent_headlines=headlines,
            supporting_sources=source_dicts,
            category_scores=category_scores,
        )

    def _safe_prediction(self, state_name: str) -> dict[str, Any]:
        try:
            return self._prediction_service.predict_state(state_name) or {}
        except Exception:
            return {}

    @staticmethod
    def _historical_statistics(state: dict[str, Any]) -> dict[str, Any]:
        return {
            "crimeRate": float(state.get("crimeRate") or 0),
            "womenCrime": float(state.get("womenCrime") or 0),
            "chargesheetRate": float(state.get("chargesheetRate") or 0),
            "totalCrime": int(state.get("totalCrime") or state.get("crime2022") or 0),
            "crime2020": float(state.get("crime2020") or 0),
            "crime2021": float(state.get("crime2021") or 0),
            "crime2022": float(state.get("crime2022") or 0),
        }

    @staticmethod
    def _threat_score(
        historical: dict[str, Any], prediction: dict[str, Any], briefing: ExecutiveBriefing
    ) -> float:
        crime_score = min(historical["crimeRate"] / 1500 * 100, 100)
        women_score = min(historical["womenCrime"] / 70000 * 100, 100)
        enforcement_score = max(0, 100 - historical["chargesheetRate"])
        historical_score = crime_score * 0.45 + women_score * 0.30 + enforcement_score * 0.25
        prediction_score = {"Low": 20, "Moderate": 45, "High": 70, "Critical": 90}.get(
            prediction.get("riskLevel"), 45
        )
        live_score = {"Low": 20, "Moderate": 45, "High": 70, "Critical": 90}.get(
            briefing.risk_level, 45
        )
        return round(min(max(historical_score * 0.55 + prediction_score * 0.30 + live_score * 0.15, 0), 100), 1)

    @staticmethod
    def _risk_level(score: float) -> str:
        if score < 20:
            return RISK_LABELS[0]
        if score < 40:
            return RISK_LABELS[1]
        if score < 60:
            return RISK_LABELS[2]
        if score < 80:
            return RISK_LABELS[3]
        return RISK_LABELS[4]

    @staticmethod
    def _confidence(prediction: dict[str, Any], briefing: ExecutiveBriefing) -> str:
        if prediction and briefing.retrieval_succeeded:
            return "High"
        if prediction or briefing.retrieval_succeeded:
            return "Medium"
        return "Low"

    @staticmethod
    def _category_scores(historical: dict[str, Any], overall: float) -> dict[str, float]:
        return {
            "overallThreat": overall,
            "cybercrime": round(min(overall * 1.05, 100), 1),
            "womenSafety": round(min(historical["womenCrime"] / 70000 * 100, 100), 1),
            "financialFraud": round(min(overall * 0.95, 100), 1),
            "organizedCrime": round(min(overall * 0.90, 100), 1),
            "propertyCrime": round(min(historical["crimeRate"] / 1500 * 100, 100), 1),
            "violentCrime": round(min(overall * 0.85, 100), 1),
            "emergingCrimes": round(min(overall * 1.10, 100), 1),
        }

    @staticmethod
    def _police_recommendations(risk_level: str) -> list[str]:
        if risk_level in {"High", "Critical"}:
            return ["Prioritize multi-agency review of high-risk signals.", "Increase cyber and financial-fraud monitoring.", "Validate current advisories before operational deployment."]
        return ["Maintain targeted monitoring of emerging threats.", "Review investigative capacity and reporting quality.", "Validate current advisories through official channels."]

    @staticmethod
    def _citizen_recommendations() -> list[str]:
        return ["Use official reporting channels for suspicious activity.", "Enable multi-factor authentication and transaction alerts.", "Verify government or police notices through official domains."]

    def _retrieve_state_intelligence(self, state_name: str) -> RetrievalResult:
        return self._retrieval_service.retrieve(
            f"latest cybercrime financial fraud scams and crime developments in {state_name}"
        )

    @staticmethod
    def _apply_state_retrieval(
        assessment: ThreatStateAssessment, retrieval: RetrievalResult
    ) -> ThreatStateAssessment:
        sources = [dict(source) for source in retrieval.sources]
        return ThreatStateAssessment(
            **{
                **assessment.__dict__,
                "recent_intelligence": " ".join(
                    source.get("summary", "") for source in sources if source.get("summary")
                ) or assessment.recent_intelligence,
                "recent_headlines": sources[:5],
                "supporting_sources": sources,
                "confidence": "High" if len(sources) >= 3 else "Medium",
                "last_updated": retrieval.retrieved_at,
            }
        )

    def _fallback_assessment(
        self, state: dict[str, Any], briefing: ExecutiveBriefing, error: Exception
    ) -> ThreatStateAssessment:
        historical = self._historical_statistics(state)
        score = round(min(historical["crimeRate"] / 1500 * 100, 100), 1)
        return ThreatStateAssessment(
            name=state["name"],
            risk_level=self._risk_level(score),
            threat_score=score,
            confidence="Low",
            last_updated=datetime.now(timezone.utc).isoformat(),
            historical_statistics=historical,
            prediction={},
            recent_intelligence="Live intelligence unavailable; historical indicators used.",
            cyber_activity="Unavailable",
            financial_fraud_activity="Unavailable",
            emerging_threats=["Verification required"],
            executive_summary=f"Historical-only fallback for {state['name']}; live assessment unavailable.",
            threat_assessment=f"Historical threat score {score}/100. Assessment fallback: {type(error).__name__}.",
            police_recommendations=["Verify current intelligence before acting."],
            citizen_recommendations=self._citizen_recommendations(),
            recent_headlines=[],
            supporting_sources=[],
            category_scores=self._category_scores(historical, score),
        )