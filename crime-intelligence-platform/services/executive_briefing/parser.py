"""Tolerance-focused parser for model-generated executive briefings."""

from __future__ import annotations

import ast
import json
from dataclasses import dataclass


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


@dataclass
class ExecutiveBriefing:
    """Parsed briefing sections before validation."""

    executive_summary: str = ""
    major_national_threats: str = ""
    major_international_threats: str = ""
    cybercrime_updates: str = ""
    financial_fraud_updates: str = ""
    emerging_crime_trends: str = ""
    recommended_actions: str = ""
    risk_level: str = ""
    confidence: str = ""


class BriefingParser:
    """Parse strict JSON and repair common model formatting mistakes."""

    _FIELD_NAMES = {
        "executiveSummary": "executive_summary",
        "majorNationalThreats": "major_national_threats",
        "majorInternationalThreats": "major_international_threats",
        "cybercrimeUpdates": "cybercrime_updates",
        "financialFraudUpdates": "financial_fraud_updates",
        "emergingCrimeTrends": "emerging_crime_trends",
        "recommendedActions": "recommended_actions",
        "riskLevel": "risk_level",
        "confidence": "confidence",
    }

    def parse(self, text: str | None) -> ExecutiveBriefing:
        """Parse JSON, recovering from common fences and syntax defects."""

        data = self._load_object(text or "")
        return ExecutiveBriefing(
            **{
                field_name: self._text(data.get(json_name))
                for json_name, field_name in self._FIELD_NAMES.items()
            }
        )

    def _load_object(self, text: str) -> dict[str, object]:
        candidates = self._candidates(text)
        for candidate in candidates:
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                pass
            try:
                parsed = ast.literal_eval(candidate)
                if isinstance(parsed, dict):
                    return parsed
            except (ValueError, SyntaxError):
                pass
        return {}

    @staticmethod
    def _candidates(text: str) -> list[str]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            cleaned = "\n".join(line for line in lines if not line.strip().startswith("```"))
        candidates = [cleaned]
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start >= 0 and end > start:
            candidates.append(cleaned[start : end + 1])
        candidates.extend(candidate.replace(",}", "}").replace(",]", "]") for candidate in list(candidates))
        return list(dict.fromkeys(candidates))

    @staticmethod
    def _text(value: object) -> str:
        return value.strip() if isinstance(value, str) else ""