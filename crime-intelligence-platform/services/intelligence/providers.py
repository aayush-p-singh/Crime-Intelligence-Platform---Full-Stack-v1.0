from typing import Dict, Any, List

from services.intelligence.base import AbstractIntentProvider
from services.intelligence.schemas import SessionContext

# Strict import: Fails loudly if the legacy intent router or its global instance is missing.
from services.ai.intent_router import router


class DefaultIntentProvider(AbstractIntentProvider):
    """
    Bridges the Intelligence Orchestrator with the legacy Sarvam AI intent router.

    This provider fulfills the AbstractIntentProvider contract by wrapping the existing
    global `router.detect(query)` implementation. It enforces strict validation on the 
    legacy LLM output, captures the generated intent, normalizes extracted entities, 
    and mutates the current SessionContext to enable conversational memory.
    """

    def extract_intent(self, query: str, context: SessionContext) -> Dict[str, Any]:
        """
        Extracts the intent and entities from a natural language query and updates session state.

        Args:
            query (str): The natural language input provided by the user.
            context (SessionContext): The lightweight state tracker for the current session.

        Raises:
            TypeError: If the underlying router does not return a dictionary.
            ValueError: If the returned dictionary lacks a valid 'intent' string.

        Returns:
            Dict[str, Any]: A standardized dictionary containing the 'intent' string 
                            and a normalized 'entities' dictionary mapping.
        """
        # Execute the legacy Sarvam AI detection logic.
        raw_response = router.detect(query)

        # 1. Validate Router Response: Fail fast if the return type is not a dictionary.
        if not isinstance(raw_response, dict):
            raise TypeError(
                f"Invalid response from legacy intent router. Expected dict, got {type(raw_response).__name__}."
            )

        # 2. Fail Fast on Missing Intent: Never default to "UNKNOWN".
        intent = raw_response.get("intent")
        if not intent or not isinstance(intent, str):
            raise ValueError(
                "Legacy router response is missing a valid 'intent' string. Cannot proceed with orchestration."
            )

        # Extract expected entity fields safely
        states: List[str] = raw_response.get("states", [])
        metric: Any = raw_response.get("metric")

        # Smart Context Mutation: Update session memory based on newly found entities
        if states and isinstance(states, list):
            if len(states) >= 1:
                context.current_state = str(states[0])
            if len(states) >= 2:
                context.current_comparison = str(states[1])

        if metric is not None:
            context.current_crime = str(metric)

        # 3. Normalize Returned Entities: Decouple from internal legacy router structure
        normalized_entities: Dict[str, Any] = {
            "states": states,
            "metric": metric
        }

        return {
            "intent": intent,
            "entities": normalized_entities
        }