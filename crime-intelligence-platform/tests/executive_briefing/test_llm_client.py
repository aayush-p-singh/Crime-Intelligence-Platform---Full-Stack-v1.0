from dataclasses import dataclass

from services.executive_briefing.llm_client import LLMClient


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
    usage: object | None = None


class FakeTransport:
    def __init__(self, response: object) -> None:
        self.response = response
        self.calls = 0

    def complete(self, prompt: str, model: str, timeout_seconds: float) -> object:
        self.calls += 1
        if isinstance(self.response, Exception):
            raise self.response
        return self.response


def test_llm_client_normalizes_response() -> None:
    transport = FakeTransport(Response([Choice(Message("Executive Summary: Ready"))]))
    result = LLMClient(transport, retries=0).complete("prompt", "request-1")

    assert result.text == "Executive Summary: Ready"
    assert result.raw_response is not None


def test_llm_client_retries_errors() -> None:
    transport = FakeTransport(TimeoutError("timed out"))
    result = LLMClient(transport, retries=2).complete("prompt", "request-2")

    assert transport.calls == 3
    assert result.text is None
    assert result.error is not None