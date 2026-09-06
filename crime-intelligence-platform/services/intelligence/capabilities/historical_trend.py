import uuid
from typing import Any

from services.intelligence.base import BaseCapability
from services.intelligence.schemas import Section, SessionContext

# Strict import of the existing legacy data tool
from services.crime_tools import CrimeTools


class HistoricalTrendCapability(BaseCapability):
    """
    Intelligence capability responsible for fetching and structuring historical crime trends.

    This capability adapts the legacy `CrimeTools` service into the modern Intelligence 
    Engine. It transforms raw flattened yearly metrics into a structured, UI-agnostic 
    visualization array, ensuring strict validation and graceful degradation if data 
    is missing.
    """

    @property
    def capability_id(self) -> str:
        return "CAP_HISTORICAL_TREND"

    @property
    def execution_priority(self) -> int:
        return 10

    def can_handle(self, intent: str) -> bool:
        """
        Determines if this capability can process the given intent.

        Args:
            intent (str): The normalized intent string extracted from the user's query.

        Returns:
            bool: True for historical, trend-analysis, or comparative intents.
        """
        if not intent or not isinstance(intent, str):
            return False
            
        allowed_intents = {
            "TREND_ANALYSIS", 
            "HISTORICAL_QUERY", 
            "COMPARE_REGIONS", 
            "HISTORICAL_TREND"
        }
        return intent.strip().upper() in allowed_intents

    def execute(self, context: SessionContext) -> list[Section]:
        """
        Executes the historical trend analysis using the current session state.

        Args:
            context (SessionContext): The request-scoped session state tracker.

        Raises:
            ValueError: If 'current_state' is missing from the context.
            TypeError: If the legacy CrimeTools adapter returns an invalid data type.

        Returns:
            list[Section]: A list containing exactly one 'visualization' section on success,
                           or one 'summary' section if no historical data is available.
        """
        # 1. Validate Context Boundary
        if not context.current_state:
            raise ValueError(
                "HistoricalTrendCapability requires a valid 'current_state' in the "
                "SessionContext to perform trend analysis."
            )

        target_state = context.current_state

        # 2. Invoke Legacy Adapter
        tools = CrimeTools()
        raw_data: dict[str, Any] | None = tools.get_state(target_state)

        # 3. Validate Adapter Output Boundary
        if raw_data is None:
            return self._build_empty_section(target_state, "No historical records found.")
            
        if not isinstance(raw_data, dict):
            raise TypeError(
                f"CrimeTools returned invalid data type: {type(raw_data).__name__}. Expected dict."
            )

        # 4. Data Extraction & Formatting
        try:
            # We map the flat keys discovered during the inspection of prediction.py
            # into a structured array suitable for UI chart rendering.
            trend_data = [
                {"year": "2020", "cases": float(raw_data.get("crime2020", 0))},
                {"year": "2021", "cases": float(raw_data.get("crime2021", 0))},
                {"year": "2022", "cases": float(raw_data.get("crime2022", 0))}
            ]
        except (ValueError, TypeError):
            return self._build_empty_section(target_state, "Historical data is corrupted or non-numeric.")

        # Ensure we don't plot an empty graph if all values are artificially zero
        if not any(point["cases"] > 0 for point in trend_data):
            return self._build_empty_section(target_state, "Yearly volume data is zero or missing.")

        # 5. Build Visualization Section
        vis_section = Section(
            id=f"sec_vis_{uuid.uuid4().hex[:8]}",
            type="visualization",
            title=f"Historical Crime Trajectory: {target_state}",
            content={
                "visualization_type": "line_chart",
                "x_axis_key": "year",
                "y_axis_label": "Reported Cases",
                "data": trend_data,
                "config": {
                    "series": [
                        {
                            "data_key": "cases", 
                            "label": "Total Reported Incidents", 
                            "color": "#ef4444"
                        }
                    ]
                }
            }
        )

        return [vis_section]

    def _build_empty_section(self, state: str, reason: str) -> list[Section]:
        """Helper to generate a standardized fallback section when data is missing."""
        no_data_section = Section(
            id=f"sec_summary_{uuid.uuid4().hex[:8]}",
            type="summary",
            title=f"Historical Data Unavailable: {state}",
            content={
                "text": f"Unable to generate historical trends for {state}.",
                "reason": reason
            }
        )
        return [no_data_section]