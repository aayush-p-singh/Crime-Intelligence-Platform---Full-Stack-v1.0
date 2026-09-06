from typing import Any

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

    def extract_intent(self, query: str, context: SessionContext) -> dict[str, Any]:
        """
        Extracts the intent and entities from a natural language query and updates session state.

        Args:
            query (str): The natural language input provided by the user.
            context (SessionContext): The request-scoped state tracker for the current session.

        Raises:
            TypeError: If the underlying router does not return a dictionary.
            ValueError: If the returned dictionary lacks a valid, non-empty 'intent' string.

        Returns:
            dict[str, Any]: A standardized dictionary containing the 'intent' string 
                            and a normalized 'entities' dictionary mapping.
        """
        # Execute the legacy Sarvam AI detection logic
        raw_response = router.detect(query)

        # 1. Validate Router Response
        if not isinstance(raw_response, dict):
            raise TypeError(
                f"Invalid response from legacy intent router. Expected dict, got {type(raw_response).__name__}."
            )

        # 2. Fail Fast on Missing Intent
        intent = raw_response.get("intent")
        if not intent or not isinstance(intent, str) or not intent.strip():
            raise ValueError(
                "Legacy router response is missing a valid, non-empty 'intent' string."
            )

        # 3. Extract and Sanitize Entities
        states = raw_response.get("states", [])
        states = raw_response.get("states", [])

        if not isinstance(states, list):
            raise TypeError(
        "Legacy router returned an invalid 'states' field. Expected list."
    )

        metric = raw_response.get("metric")

        # 4. Context Mutation: Update session memory based on newly found entities
        if len(states) >= 1:
            context.current_state = str(states[0])
        if len(states) >= 2:
            context.current_comparison = str(states[1])

        if metric is not None:
            context.current_crime = str(metric)

        # 5. Normalize Returned Entities
        return {
            "intent": intent.strip(),
            "entities": {
                "states": states,
                "metric": metric
            }
        }