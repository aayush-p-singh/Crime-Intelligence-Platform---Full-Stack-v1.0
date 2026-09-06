"""Provider-neutral LLM client boundary for executive briefings."""

from __future__ import annotations

import time
import os
from dataclasses import dataclass, field
from typing import Any, Protocol

from dotenv import load_dotenv
from sarvamai import SarvamAI

from services.executive_briefing.logger import log_stage

load_dotenv()


@dataclass(frozen=True)
class LLMResponse:
    """Provider response normalized without discarding diagnostic data."""

    text: str | None
    model: str
    finish_reason: str | None
    raw_response: Any = field(repr=False)
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    error: str | None = None


class LLMTransport(Protocol):
    """Minimal provider protocol needed by the client."""

    def complete(self, prompt: str, model: str, timeout_seconds: float) -> Any:
        """Return the provider-native completion object."""


class SarvamTransport:
    """Adapt the installed Sarvam SDK to the provider-neutral transport."""

    def __init__(self, client: Any | None = None, timeout_seconds: float = 30.0) -> None:
        self.client = client or SarvamAI(
            api_subscription_key=os.getenv("SARVAM_API_KEY"),
            timeout=timeout_seconds,
        )

    def complete(self, prompt: str, model: str, timeout_seconds: float) -> Any:
        return self.client.chat.completions(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            reasoning_effort=None,
            max_tokens=4096,
        )


class LLMClient:
    """Call an injected provider with retries and normalized diagnostics."""

    def __init__(
        self,
        transport: LLMTransport,
        model: str = "sarvam-105b",
        timeout_seconds: float = 30.0,
        retries: int = 2,
    ) -> None:
        self.transport = transport
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.retries = max(retries, 0)

    def complete(self, prompt: str, request_id: str) -> LLMResponse:
        """Call the provider and return text plus the complete raw response."""

        last_error: Exception | None = None
        for attempt in range(self.retries + 1):
            started = time.perf_counter()
            log_stage(request_id, "llm_request", "started", model=self.model, attempt=attempt + 1)
            try:
                response = self.transport.complete(prompt, self.model, self.timeout_seconds)
                log_stage(request_id, "llm_response", "raw response received", raw_response=repr(response))
                normalized = self._normalize(response)
                log_stage(
                    request_id,
                    "llm_request",
                    "completed",
                    model=self.model,
                    attempt=attempt + 1,
                    latency_ms=round((time.perf_counter() - started) * 1000, 2),
                    finish_reason=normalized.finish_reason,
                    response_chars=len(normalized.text or ""),
                )
                return normalized
            except Exception as error:
                last_error = error
                log_stage(request_id, "llm_request", "failed", attempt=attempt + 1, error=type(error).__name__)

        return LLMResponse(
            text=None,
            model=self.model,
            finish_reason=None,
            raw_response=None,
            error=f"{type(last_error).__name__}: {last_error}" if last_error else "Unknown LLM error",
        )

    @staticmethod
    def _normalize(response: Any) -> LLMResponse:
        choice = response.choices[0]
        message = choice.message
        usage = getattr(response, "usage", None)
        return LLMResponse(
            text=getattr(message, "content", None),
            model=getattr(response, "model", "unknown"),
            finish_reason=getattr(choice, "finish_reason", None),
            raw_response=response,
            prompt_tokens=getattr(usage, "prompt_tokens", None),
            completion_tokens=getattr(usage, "completion_tokens", None),
        )