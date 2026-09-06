"""Decision and orchestration layer for current-information retrieval."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from services.retrieval.search_provider import GoogleNewsRssProvider, SearchProvider, SearchResult
from services.retrieval.source_formatter import source_to_dict


LIVE_INFORMATION_TERMS = (
    "latest",
    "recent",
    "current",
    "today",
    "this week",
    "this month",
    "trend",
    "cyber attack",
    "cyberattack",
    "scam",
    "fraud",
    "advisory",
    "cert-in",
    "cert in",
    "police announcement",
    "ransomware",
    "ai security",
    "terrorism",
    "natural disaster",
    "international crime",
    "breaking",
    "campaign",
)


@dataclass
class RetrievalResult:
    """Safe retrieval outcome passed to the Officer and API layer."""

    required: bool
    succeeded: bool = False
    query: str = ""
    retrieved_at: str = ""
    confidence: str = "LOW"
    sources: list[dict] = field(default_factory=list)
    source_records: list[SearchResult] = field(default_factory=list, repr=False)
    error: str | None = None

    @property
    def notice(self) -> str | None:
        if self.required and not self.succeeded:
            return "Current information could not be verified from public sources."
        return None


class RetrievalService:
    """Determine retrieval need and execute an injectable search provider."""

    def __init__(self, provider: SearchProvider | None = None, max_results: int = 5):
        self.provider = provider or GoogleNewsRssProvider()
        self.max_results = max_results

    @staticmethod
    def requires_retrieval(message: str) -> bool:
        normalized = " ".join(message.lower().split())
        return any(term in normalized for term in LIVE_INFORMATION_TERMS)

    def retrieve(self, message: str) -> RetrievalResult:
        required = self.requires_retrieval(message)
        result = RetrievalResult(
            required=required,
            query=message,
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        )
        if not required:
            return result

        try:
            sources = self.provider.search(message, limit=self.max_results)
            result.source_records = sources
            result.sources = [source_to_dict(source) for source in sources]
            result.succeeded = bool(sources)
            result.confidence = "HIGH" if len(sources) >= 3 else "MEDIUM" if sources else "LOW"
            if not sources:
                result.error = "The provider returned no results."
        except Exception as error:
            result.error = f"{type(error).__name__}: {error}"
        return result
