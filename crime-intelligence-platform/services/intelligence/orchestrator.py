import time
import uuid
from datetime import datetime, timezone

from services.intelligence.base import AbstractIntentProvider
from services.intelligence.manifest import CapabilityManifest
from services.intelligence.schemas import CopilotResponse, ResponseMetadata, Section, SessionContext


class IntelligenceOrchestrator:
    """
    The central coordination engine for the AI Copilot.

    The IntelligenceOrchestrator strictly delegates business logic to injected 
    dependencies. It relies on the CapabilityManifest to resolve routing and 
    the AbstractIntentProvider to understand natural language. It manages the 
    request lifecycle, aggregates intelligence sections, builds execution metadata, 
    and handles top-level exception tracing without coupling to any specific AI 
    or database implementation.
    """

    VERSION = "2.0.0"

    def __init__(
        self, 
        manifest: CapabilityManifest, 
        intent_provider: AbstractIntentProvider
    ) -> None:
        """
        Initializes the Orchestrator with required dependencies.

        Args:
            manifest (CapabilityManifest): The registry used to resolve capabilities.
            intent_provider (AbstractIntentProvider): The service used to extract 
                                                      intent and entities from queries.
        """
        self._manifest = manifest
        self._intent_provider = intent_provider

    def process_request(self, query: str, context: SessionContext) -> CopilotResponse:
        """
        Processes a user query by coordinating intent extraction, capability 
        resolution, and execution.

        Args:
            query (str): The raw natural language input provided by the user.
            context (SessionContext): The request-scoped session state tracker.

        Returns:
            CopilotResponse: The unified intelligence payload containing rendered 
                             sections, execution metadata, and the updated context.
                             
        Raises:
            RuntimeError: If intent extraction or any capability execution fails due to underlying errors.
            ValueError: If the intent payload returned by the provider is invalid or missing.
        """
        start_time = time.perf_counter()
        request_id = str(uuid.uuid4())
        
        reasoning_path: list[str] = [f"Request received. ID: {request_id}"]
        capabilities_used: list[str] = []
        aggregated_sections: list[Section] = []

        # 1. Intent Extraction
        try:
            intent_payload = self._intent_provider.extract_intent(query, context)
        except Exception as e:
            raise RuntimeError(f"Failed to extract intent from query: '{query}'.") from e

        # Validate the payload and intent strictly
        if not isinstance(intent_payload, dict):
            raise ValueError(f"Intent extraction failed: Expected dictionary payload, got {type(intent_payload).__name__}.")
            
        intent = intent_payload.get("intent")
        if not intent or not str(intent).strip():
            raise ValueError("Intent extraction failed: Provider returned a missing or empty intent.")
            
        intent = str(intent).strip()
        reasoning_path.append(f"Successfully extracted intent: '{intent}'")

        # 2. Capability Resolution
        try:
            capabilities = self._manifest.resolve(intent)
            if not capabilities:
                reasoning_path.append(f"No capabilities matched intent '{intent}'.")
                confidence = "LOW"
            else:
                reasoning_path.append(f"Resolved {len(capabilities)} capability(ies) for execution.")
                confidence = "HIGH"
        except Exception as e:
            raise RuntimeError(f"Failed to resolve capabilities for intent '{intent}'.") from e

        # 3. Execution (Capabilities are already sorted by priority by the manifest)
        for capability in capabilities:
            capabilities_used.append(capability.capability_id)
            reasoning_path.append(f"Executing capability: {capability.capability_id}")
            
            try:
                sections = capability.execute(context)
                aggregated_sections.extend(sections)
                reasoning_path.append(f"Capability {capability.capability_id} successfully generated {len(sections)} section(s).")
            except Exception as e:
                # Fail loudly with context. Do not swallow the exception.
                raise RuntimeError(
                    f"Execution failed for capability '{capability.capability_id}'."
                ) from e

        # 4. Metadata Construction
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)
        generated_at = datetime.now(timezone.utc).isoformat()

        metadata = ResponseMetadata(
            version=self.VERSION,
            request_id=request_id,
            session_id=context.session_id,
            detected_intent=intent,
            confidence=confidence,
            capabilities_used=capabilities_used,
            reasoning_path=reasoning_path,
            data_sources=[],  # Future expansion: extract from sections or capabilities
            execution_time_ms=execution_time_ms,
            generated_at=generated_at
        )

        # 5. Build and return the final payload
        return CopilotResponse(
            sections=aggregated_sections,
            metadata=metadata,
            session_context=context
        )