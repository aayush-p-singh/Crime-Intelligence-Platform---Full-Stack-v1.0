from abc import ABC, abstractmethod
from typing import Any

from services.intelligence.schemas import SessionContext, Section

# Module-level type alias for structured dictionary payloads
IntentPayload = dict[str, Any]


class AbstractIntentProvider(ABC):
    """
    Abstract contract for intent and entity extraction providers.
    
    This interface ensures that the Intelligence Orchestrator remains decoupled
    from any specific natural language processing implementation, LLM routing 
    logic, or external intent detection services.
    """

    @abstractmethod
    def extract_intent(self, query: str, context: SessionContext) -> IntentPayload:
        """
        Extracts the user's intent and associated entities from a natural language query.

        Args:
            query (str): The raw natural language input provided by the user.
            context (SessionContext): The request-scoped session state tracker, which 
                                      may be mutated to retain conversational memory. 
                                      IMPORTANT: This context is request-scoped and 
                                      must never be shared across concurrent requests.

        Returns:
            IntentPayload: A dictionary containing the detected intent and normalized entities.
                           Expected minimum structure: {"intent": str, "entities": dict[str, Any]}
        """
        ...


class BaseCapability(ABC):
    """
    Abstract base class for all pluggable intelligence capabilities.
    
    Every intelligence tool (e.g., Risk Forecaster, Historical Trend Analyzer, 
    Graph Searcher) must inherit from this contract to guarantee seamless integration 
    with the Capability Manifest and Intelligence Orchestrator.
    """

    @property
    @abstractmethod
    def capability_id(self) -> str:
        """
        The immutable and globally unique identifier for this capability (e.g., "CAP_FORECAST").
        Must be implemented by all concrete subclasses and must not change at runtime.
        """
        ...

    @property
    def execution_priority(self) -> int:
        """
        Determines the execution order when multiple capabilities match an intent.
        Lower values indicate higher priority (e.g., priority 1 executes before 10).
        
        Returns:
            int: The execution priority. Defaults to 100 for standard capabilities.
        """
        return 100

    @abstractmethod
    def can_handle(self, intent: str) -> bool:
        """
        Evaluates whether this capability is designed to process the specified intent.
        
        Behavior:
        - Should return True if the capability maps to the requested intent.
        - Must gracefully return False if the intent is invalid, empty, or unrecognized.

        Args:
            intent (str): The extracted user intent (e.g., "TREND_ANALYSIS").

        Returns:
            bool: True if this capability can handle the intent, False otherwise.
        """
        ...

    @abstractmethod
    def execute(self, context: SessionContext) -> list[Section]:
        """
        Executes the capability's core business logic using the provided session state.

        Args:
            context (SessionContext): The current conversational context containing 
                                      extracted entities and session parameters. 
                                      IMPORTANT: This context is request-scoped and 
                                      must never be shared across concurrent requests.

        Returns:
            list[Section]: A list of structured Section models containing the generated 
                           intelligence (e.g., visualizations, forecasts, or recommendations).
        """
        ...