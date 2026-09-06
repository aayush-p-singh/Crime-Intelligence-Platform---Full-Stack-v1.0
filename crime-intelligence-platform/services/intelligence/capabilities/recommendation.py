import uuid

from services.intelligence.base import BaseCapability
from services.intelligence.schemas import Section, SessionContext
from services.intelligence.capabilities.recommendation_adapter import RecommendationAdapter


class RecommendationCapability(BaseCapability):
    """Expose the legacy recommendation workflow through the Intelligence Engine."""

    def __init__(self, adapter: RecommendationAdapter | None = None) -> None:
        self._adapter = adapter or RecommendationAdapter()

    @property
    def capability_id(self) -> str:
        return "CAP_RECOMMENDATION"

    @property
    def execution_priority(self) -> int:
        return 30

    def can_handle(self, intent: str) -> bool:
        if not isinstance(intent, str) or not intent.strip():
            return False

        return intent.strip().upper() in {
            "RECOMMENDATION",
            "RECOMMENDATIONS",
            "ACTION_RECOMMENDATION",
        }

    def execute(self, context: SessionContext) -> list[Section]:
        if not isinstance(context, SessionContext):
            raise TypeError(
                "RecommendationCapability requires a SessionContext instance."
            )
        if not isinstance(context.current_state, str) or not context.current_state.strip():
            raise ValueError(
                "RecommendationCapability requires a non-empty 'current_state' in "
                "the SessionContext."
            )

        state_name = context.current_state.strip()
        content = self._adapter.generate(state_name)

        return [
            Section(
                id=f"sec_recommendation_{uuid.uuid4().hex[:8]}",
                type="recommendations",
                title=f"Recommended Actions: {content['state']}",
                content=content,
            )
        ]
