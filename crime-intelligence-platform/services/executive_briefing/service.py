"""Orchestrate the independent Executive Intelligence Briefing pipeline."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from sarvamai import SarvamAI

from services.executive_briefing.formatter import BriefingResponse
from services.executive_briefing.llm_client import LLMClient, SarvamTransport
from services.executive_briefing.logger import log_stage, new_request_id, timed_stage
from services.executive_briefing.parser import BriefingParser, ExecutiveBriefing
from services.executive_briefing.prompt_builder import BriefingPromptBuilder
from services.executive_briefing.retriever import IntelligenceRetriever, RetrievedArticle
from services.executive_briefing.validator import BriefingValidator
from services.retrieval.search_provider import GoogleNewsRssProvider, SearchProvider

load_dotenv()
logger = logging.getLogger("crime_intelligence.executive_briefing")


BRIEFING_QUERY = (
    "latest national and international crime threats, cybercrime attacks, "
    "financial fraud, scams, government advisories, policing developments, "
    "and emerging crime trends"
)


class ExecutiveBriefingService:
    """Coordinate retrieval, generation, parsing, validation, and formatting."""

    def __init__(
        self,
        retriever: IntelligenceRetriever,
        prompt_builder: BriefingPromptBuilder,
        llm_client: LLMClient,
        parser: BriefingParser,
        validator: BriefingValidator,
    ) -> None:
        self.retriever = retriever
        self.prompt_builder = prompt_builder
        self.llm_client = llm_client
        self.parser = parser
        self.validator = validator

    def generate(self, query: str = BRIEFING_QUERY) -> BriefingResponse:
        """Generate a structured response while preserving partial results."""

        request_id = new_request_id()
        retrieved_at = datetime.now(timezone.utc).isoformat()
        retrieval_error: str | None = None
        articles: list[RetrievedArticle] = []

        try:
            with timed_stage(request_id, "retrieval"):
                articles = self.retriever.retrieve(query)
            log_stage(request_id, "retrieval", "articles ready", count=len(articles))
        except Exception as error:
            retrieval_error = f"{type(error).__name__}: {error}"
            log_stage(request_id, "retrieval", "failed", error=retrieval_error)

        prompt = self.prompt_builder.build(articles)
        log_stage(
            request_id,
            "prompt",
            "built",
            prompt_length=len(prompt),
            prompt_preview=prompt[:240].replace("\n", " "),
        )
        llm_response = self.llm_client.complete(prompt, request_id)
        parsed = self.parser.parse(llm_response.text)
        log_stage(request_id, "parser", "completed", parsed_sections=self._present_sections(parsed))
        validation = self.validator.validate(parsed)
        for warning in validation.warnings:
            log_stage(request_id, "validation", "warning", warning=warning)

        errors = [error for error in (retrieval_error, llm_response.error) if error]
        status = "success" if not errors and not validation.warnings else "partial"
        if not (llm_response.text or "").strip() and llm_response.error is None:
            errors.append(
                "LLM returned no text; inspect finish_reason and raw_response diagnostics."
            )
            status = "error"
        response = BriefingResponse(
            briefing=validation.briefing,
            sources=articles,
            status=status,
            error="; ".join(errors) if errors else None,
            warnings=validation.warnings,
            partial=status != "success",
            retrieval_succeeded=retrieval_error is None and bool(articles),
            retrieval_timestamp=retrieved_at,
        )
        log_stage(request_id, "response", "ready", status=status, warnings=len(validation.warnings))
        return response

    @staticmethod
    def _present_sections(briefing: ExecutiveBriefing) -> list[str]:
        return [name for name, value in vars(briefing).items() if value.strip()]


def create_default_service(provider: SearchProvider | None = None) -> ExecutiveBriefingService:
    """Build the production service with injectable component boundaries."""

    search_provider = provider or GoogleNewsRssProvider()
    timeout = float(os.getenv("EXECUTIVE_BRIEFING_LLM_TIMEOUT", "30"))
    return ExecutiveBriefingService(
        retriever=IntelligenceRetriever(search_provider),
        prompt_builder=BriefingPromptBuilder(),
        llm_client=LLMClient(SarvamTransport(SarvamAI(
            api_subscription_key=os.getenv("SARVAM_API_KEY"), timeout=timeout
        )), timeout_seconds=timeout),
        parser=BriefingParser(),
        validator=BriefingValidator(),
    )