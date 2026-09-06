from dataclasses import dataclass

from services.executive_briefing.llm_client import LLMClient
from services.executive_briefing.parser import BriefingParser
from services.executive_briefing.prompt_builder import BriefingPromptBuilder
from services.executive_briefing.retriever import IntelligenceRetriever
from services.executive_briefing.service import ExecutiveBriefingService
from services.executive_briefing.validator import BriefingValidator
from services.retrieval.search_provider import SearchResult


class Provider:
    def search(self, query: str, limit: int = 5) -> list[SearchResult]:
        return [SearchResult("Crime alert", "https://example.test/a", "2026-09-07", "Evidence", "Source")]


@dataclass
class Message:
    content: str | None


@dataclass
class Choice:
    message: Message
    finish_reason: str = "stop"


@dataclass
class Response:
    choices: list[Choice]
    model: str = "test-model"


class Transport:
    def complete(self, prompt: str, model: str, timeout_seconds: float) -> Response:
        return Response([Choice(Message('{"executiveSummary":"Valid","riskLevel":"High","confidence":"High"}'))])


class EmptyTransport:
    def complete(self, prompt: str, model: str, timeout_seconds: float) -> Response:
        return Response([Choice(Message(None))])


def test_service_returns_partial_status_for_omitted_sections() -> None:
    service = ExecutiveBriefingService(
        IntelligenceRetriever(Provider()),
        BriefingPromptBuilder(),
        LLMClient(Transport(), retries=0),
        BriefingParser(),
        BriefingValidator(),
    )
    result = service.generate("latest crime threats")

    assert result.status == "partial"
    payload = result.to_dict()
    assert payload["executiveSummary"] == "Valid"
    assert payload["cybercrimeUpdates"] == "No verified intelligence available."
    assert payload["warnings"]
    assert payload["sources"][0]["title"] == "Crime alert"


def test_service_reports_null_model_content_as_error() -> None:
    service = ExecutiveBriefingService(
        IntelligenceRetriever(Provider()),
        BriefingPromptBuilder(),
        LLMClient(EmptyTransport(), retries=0),
        BriefingParser(),
        BriefingValidator(),
    )

    result = service.generate("latest crime threats")

    assert result.status == "error"
    assert result.error is not None
    assert "no text" in result.error