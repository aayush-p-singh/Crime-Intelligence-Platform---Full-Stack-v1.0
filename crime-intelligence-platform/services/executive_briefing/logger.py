"""Structured logging helpers for executive briefing stages."""

from __future__ import annotations

import logging
import uuid
from contextlib import contextmanager
from time import perf_counter
from typing import Iterator


LOGGER = logging.getLogger("crime_intelligence.executive_briefing")


def new_request_id() -> str:
    """Create a request identifier suitable for correlating all stages."""

    return uuid.uuid4().hex[:12]


def log_stage(request_id: str, stage: str, message: str, **context: object) -> None:
    """Emit a consistent stage event without logging secrets or full prompts."""

    details = " ".join(f"{key}={value!r}" for key, value in context.items())
    suffix = f" {details}" if details else ""
    LOGGER.info("briefing request=%s stage=%s %s%s", request_id, stage, message, suffix)


@contextmanager
def timed_stage(request_id: str, stage: str, **context: object) -> Iterator[None]:
    """Log stage start and completion latency."""

    started = perf_counter()
    log_stage(request_id, stage, "started", **context)
    try:
        yield
    finally:
        log_stage(
            request_id,
            stage,
            "finished",
            latency_ms=round((perf_counter() - started) * 1000, 2),
            **context,
        )