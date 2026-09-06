import dataclasses
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Action:
    """
    Immutable data model representing an interactive UI action or follow-up prompt
    associated with a specific intelligence section.
    """
    label: str
    action: str

    def to_dict(self) -> dict[str, Any]:
        """Serializes the Action instance to a dictionary."""
        return dataclasses.asdict(self)


@dataclass
class Section:
    """
    Polymorphic section representing a single block of intelligence.
    
    The backend remains completely UI-agnostic by placing visualization-specific 
    configurations into the generic `content` dictionary, allowing the frontend 
    to dynamically determine how to render it based on the `type` field.
    """
    id: str
    type: str
    title: str
    content: dict[str, Any]
    actions: list[Action] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Serializes the Section instance, including nested actions, to a dictionary."""
        return dataclasses.asdict(self)


@dataclass
class SessionContext:
    """
    Request-scoped state tracker passed between capabilities to retain 
    conversational memory and analytical parameters.
    
    This object is built and evaluated per request and must never be 
    shared across concurrent user sessions.
    """
    session_id: str
    current_state: str | None = None
    current_crime: str | None = None
    current_year_range: list[int] | None = None
    current_comparison: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serializes the SessionContext instance to a dictionary."""
        return dataclasses.asdict(self)


@dataclass
class ResponseMetadata:
    """
    Standardized tracking, tracing, and explainability envelope.
    
    Provides execution transparency, allowing the UI to display exactly 
    which data sources were used, which AI capabilities were invoked, 
    and the system's confidence level.
    """
    version: str
    request_id: str
    session_id: str
    detected_intent: str
    confidence: str
    capabilities_used: list[str]
    reasoning_path: list[str]
    data_sources: list[str]
    execution_time_ms: int
    generated_at: str

    def to_dict(self) -> dict[str, Any]:
        """Serializes the ResponseMetadata instance to a dictionary."""
        return dataclasses.asdict(self)


@dataclass
class CopilotResponse:
    """
    The unified root schema wrapper returned to the client API layer.
    
    Combines the rendered intelligence sections, execution metadata, and 
    the updated session context into a single cohesive payload.
    """
    sections: list[Section]
    metadata: ResponseMetadata
    session_context: SessionContext

    def to_dict(self) -> dict[str, Any]:
        """
        Recursively serializes the entire response tree into a JSON-compatible dictionary.
        Leverages dataclasses.asdict to automatically process nested models.
        """
        return dataclasses.asdict(self)