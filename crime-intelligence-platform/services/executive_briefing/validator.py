"""Validate and complete parsed executive briefings without losing good data."""

from __future__ import annotations

from dataclasses import dataclass

from services.executive_briefing.parser import ExecutiveBriefing


MISSING_SECTION_TEXT = "No verified intelligence available."


@dataclass(frozen=True)
class ValidationResult:
    """Validated briefing and warnings emitted during validation."""

    briefing: ExecutiveBriefing
    warnings: list[str]


class BriefingValidator:
    """Fill only missing fields and preserve all valid model output."""

    _FIELDS = (
        "executive_summary",
        "major_national_threats",
        "major_international_threats",
        "cybercrime_updates",
        "financial_fraud_updates",
        "emerging_crime_trends",
        "recommended_actions",
        "risk_level",
        "confidence",
    )

    def validate(self, briefing: ExecutiveBriefing) -> ValidationResult:
        """Return a complete briefing and one warning per missing section."""

        warnings: list[str] = []
        for field_name in self._FIELDS:
            if not getattr(briefing, field_name).strip():
                setattr(briefing, field_name, MISSING_SECTION_TEXT)
                warnings.append(f"Missing AI section: {field_name}")
        return ValidationResult(briefing=briefing, warnings=warnings)