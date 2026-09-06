import json
import math
import re
from typing import Any


class RecommendationAdapter:
    """Adapt the legacy recommendation workflow to a structured payload."""

    _RESPONSE_PATTERN = re.compile(
        r"\ASummary:\s*(?P<summary>.+?)\s*Recommendations:\s*"
        r"(?P<recommendations>.+?)\s*Conclusion:\s*(?P<conclusion>.+?)\s*\Z",
        re.DOTALL,
    )
    _BULLET_PATTERN = re.compile(r"^(?:[•*-]|\d+[.)])\s+(.+)$")

    def generate(self, state_name: str) -> dict[str, Any]:
        """Run and validate the existing state, prediction, and LLM services."""
        from services.crime_tools import CrimeTools
        from services.prediction import prediction_service
        from services.sarvam_service import generate_recommendation

        state_data = CrimeTools.get_state(state_name)
        self._validate_state_data(state_data)

        prediction = prediction_service.predict_state(state_name)
        risk_level = self._extract_risk_level(prediction)

        legacy_response = generate_recommendation(state_data, risk_level)
        summary, recommendations, conclusion = self._parse_legacy_response(
            legacy_response
        )
        payload = {
            "state": state_data["name"].strip(),
            "riskLevel": risk_level,
            "summary": summary,
            "recommendations": recommendations,
            "conclusion": conclusion,
        }
        self._assert_json_compatible(payload)
        return payload

    @staticmethod
    def _validate_state_data(state_data: Any) -> None:
        if not isinstance(state_data, dict):
            raise TypeError(
                "Legacy CrimeTools response is invalid. Expected a state-data dictionary."
            )

        required_fields = ("name", "crimeRate", "womenCrime", "chargesheetRate")
        missing_fields = [field for field in required_fields if field not in state_data]
        if missing_fields:
            raise ValueError(
                "Legacy CrimeTools response is missing required fields: "
                f"{', '.join(missing_fields)}."
            )

        if not isinstance(state_data["name"], str) or not state_data["name"].strip():
            raise ValueError("Legacy CrimeTools response has an invalid state name.")

        for field in ("crimeRate", "womenCrime", "chargesheetRate"):
            value = state_data[field]
            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not math.isfinite(value)
            ):
                raise TypeError(
                    f"Legacy CrimeTools response has an invalid numeric '{field}' value."
                )

    @staticmethod
    def _extract_risk_level(prediction: Any) -> str:
        if not isinstance(prediction, dict):
            raise TypeError(
                "Legacy prediction response is invalid. Expected a dictionary."
            )

        risk_level = prediction.get("riskLevel")
        if not isinstance(risk_level, str) or not risk_level.strip():
            raise ValueError(
                "Legacy prediction response is missing a non-empty 'riskLevel'."
            )
        return risk_level.strip()

    @classmethod
    def _parse_legacy_response(cls, response: Any) -> tuple[str, list[str], str]:
        if not isinstance(response, str) or not response.strip():
            raise ValueError(
                "Legacy recommendation service returned an empty or non-text response."
            )

        match = cls._RESPONSE_PATTERN.fullmatch(response.strip())
        if match is None:
            raise ValueError(
                "Legacy recommendation response does not match the required Summary, "
                "Recommendations, Conclusion format."
            )

        summary = match.group("summary").strip()
        conclusion = match.group("conclusion").strip()
        recommendations: list[str] = []
        for line in match.group("recommendations").strip().splitlines():
            if not line.strip():
                continue
            bullet = cls._BULLET_PATTERN.fullmatch(line.strip())
            if bullet is None or not bullet.group(1).strip():
                raise ValueError(
                    "Legacy recommendation response contains a malformed recommendation item."
                )
            recommendations.append(bullet.group(1).strip())

        if not summary or not conclusion or len(recommendations) != 3:
            raise ValueError(
                "Legacy recommendation response must contain a summary, exactly three "
                "recommendations, and a conclusion."
            )

        return summary, recommendations, conclusion

    @staticmethod
    def _assert_json_compatible(payload: dict[str, Any]) -> None:
        try:
            json.dumps(payload, allow_nan=False)
        except (TypeError, ValueError) as error:
            raise ValueError(
                "Recommendation adapter produced a non-JSON-compatible payload."
            ) from error
