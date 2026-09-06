import uuid

from services.intelligence.base import BaseCapability
from services.intelligence.schemas import Section, SessionContext

# Strict import of the existing ML prediction logic
from services.prediction import prediction_service


class PredictiveRiskCapability(BaseCapability):
    """
    Intelligence capability responsible for calculating future crime risks and trends.

    This capability wraps the legacy `prediction_service` to provide an ML-powered
    forecast. It bridges the old unstructured data response into the new UI-agnostic
    `Section` schema, enforcing strict failure conditions if contextual data is missing.
    """

    @property
    def capability_id(self) -> str:
        return "CAP_PREDICTIVE_RISK"

    @property
    def execution_priority(self) -> int:
        return 20

    def can_handle(self, intent: str) -> bool:
        """
        Determines if this capability can process the given intent.

        Args:
            intent (str): The normalized intent string extracted from the user's query.

        Returns:
            bool: True for forecasting, prediction, or risk-analysis intents.
        """
        if not intent or not isinstance(intent, str):
            return False
            
        allowed_intents = {"PREDICTION", "FORECAST", "ASSESS_THREAT", "RISK_ANALYSIS"}
        return intent.strip().upper() in allowed_intents

    def execute(self, context: SessionContext) -> list[Section]:
        """
        Executes the predictive risk analysis using the current session state.

        Args:
            context (SessionContext): The request-scoped session state tracker.

        Raises:
            ValueError: If 'current_state' is missing from the context.

        Returns:
            list[Section]: A list containing either a successful 'forecast' section 
                           or a 'summary' section indicating missing data.
        """
        # Fail loudly if no target state exists in the context
        if not context.current_state:
            raise ValueError(
                "PredictiveRiskCapability requires a valid 'current_state' in the "
                "SessionContext to perform analysis."
            )

        target_state = context.current_state

        # Call the legacy prediction service
        raw_data = prediction_service.predict_state(target_state)

        # Handle the None return case explicitly as requested
        if raw_data is None:
            no_data_section = Section(
                id=f"sec_summary_{uuid.uuid4().hex[:8]}",
                type="summary",
                title=f"Prediction Unavailable: {target_state}",
                content={
                    "text": f"No historical data or prediction model available to generate a forecast for {target_state}."
                }
            )
            return [no_data_section]
        if raw_data is not None and not isinstance(raw_data, dict):
            raise TypeError(
        "Prediction service returned an invalid response. Expected dict or None."
    )

        # Construct the structured forecast section
        forecast_section = Section(
            id=f"sec_forecast_{uuid.uuid4().hex[:8]}",
            type="forecast",
            title=f"Predictive Threat Assessment: {target_state}",
            content={
                "riskLevel": raw_data.get("riskLevel"),
                "trend": raw_data.get("trend"),
                "growthPercent": raw_data.get("growthPercent"),
                "riskScore": raw_data.get("riskScore"),
                "chargesheetRate": raw_data.get("chargesheetRate")
            }
        )

        return [forecast_section]