from typing import List, Dict, Optional

from services.intelligence.base import BaseCapability


class CapabilityManifest:
    """
    A runtime registry for Intelligence Capabilities.

    This manifest acts as the central directory of all available AI tools and 
    data processors (capabilities) in the platform. It is designed to be injected 
    into the IntelligenceOrchestrator rather than acting as a global singleton.

    Future capabilities (e.g., Voice AI, Document Analyzer, Forecast Engine) can 
    be registered here dynamically at startup without altering this core routing logic.
    """

    def __init__(self) -> None:
        """
        Initializes an empty capability manifest.
        Uses a dictionary for O(1) lookups and deletions by capability_id.
        """
        self._capabilities: Dict[str, BaseCapability] = {}

    def register(self, capability: BaseCapability) -> None:
        """
        Registers a capability in the manifest.

        Args:
            capability (BaseCapability): The initialized capability instance to register.

        Raises:
            ValueError: If the capability does not have a valid capability_id, 
                        or if a capability with the same ID is already registered.
        """
        if not capability.capability_id:
            raise ValueError("Cannot register capability: Missing 'capability_id' attribute.")
            
        if capability.capability_id in self._capabilities:
            raise ValueError(
                f"Cannot register capability: A capability with ID '{capability.capability_id}' "
                "is already registered in the manifest."
            )
            
        self._capabilities[capability.capability_id] = capability

    def unregister(self, capability_id: str) -> None:
        """
        Removes a capability from the manifest by its ID.

        Args:
            capability_id (str): The unique identifier of the capability to remove.

        Raises:
            KeyError: If the capability_id is not found in the manifest.
        """
        if capability_id not in self._capabilities:
            raise KeyError(f"Cannot unregister: Capability '{capability_id}' not found.")
            
        del self._capabilities[capability_id]

    def get_capability(self, capability_id: str) -> Optional[BaseCapability]:
        """
        Retrieves a specific registered capability by its ID.

        Args:
            capability_id (str): The unique identifier of the capability.

        Returns:
            Optional[BaseCapability]: The capability instance if found, else None.
        """
        return self._capabilities.get(capability_id)

    def list_capabilities(self) -> List[BaseCapability]:
        """
        Lists all capabilities currently registered in the manifest.

        Returns:
            List[BaseCapability]: A list of all registered capability instances.
        """
        return list(self._capabilities.values())

    def resolve(self, intent: str) -> List[BaseCapability]:
        """
        Resolves one or more capabilities that can handle the specified intent.
        
        Capabilities are evaluated using their `can_handle()` method. If multiple 
        capabilities match, they are sorted by their `execution_priority` attribute. 
        Capabilities without a declared priority default to 100 (standard priority).
        Lower numbers denote higher priority (e.g., priority 1 executes before 10).

        Args:
            intent (str): The extracted user intent (e.g., "TREND_ANALYSIS").

        Returns:
            List[BaseCapability]: A priority-sorted list of capabilities capable 
                                  of handling the intent.
        """
        matched_capabilities: List[BaseCapability] = []
        
        for capability in self._capabilities.values():
            if capability.can_handle(intent):
                matched_capabilities.append(capability)

        # Sort matches by execution priority. 
        # Duck-typing is used so BaseCapability remains strictly uncoupled from orchestration details.
        matched_capabilities.sort(
            key=lambda cap: getattr(cap, "execution_priority", 100)
        )

        return matched_capabilities