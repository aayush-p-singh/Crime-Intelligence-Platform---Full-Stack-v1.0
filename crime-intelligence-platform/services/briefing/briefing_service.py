"""Generate Executive Intelligence Briefings from retrieval evidence."""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from sarvamai import SarvamAI

from services.briefing.formatter import fallback_text, format_briefing
from services.briefing.models import ExecutiveBriefing
from services.retrieval.retrieval_service import RetrievalResult, RetrievalService
from services.retrieval.source_formatter import format_sources_for_prompt

load_dotenv()


BRIEFING_QUERY = (
    "latest national and international crime threats, cybercrime attacks, "
    "financial fraud, scams, government advisories, policing developments, "
    "and emerging crime trends"
)

BRIEFING_PROMPT = """
You are a senior crime-intelligence analyst preparing a morning briefing for
police commissioners, cybercrime heads, and government decision-makers.

Use only the retrieved sources below for current claims. Do not invent events,
statistics, dates, or source details. Distinguish observed facts from analysis.
Keep recommendations practical and lawful. If evidence is incomplete, say so.

Return exactly these plain-text sections:
Executive Summary:
Major National Threats:
Major International Threats:
Cybercrime Updates:
Financial Fraud Updates:
Emerging Crime Trends:
Recommended Actions:
Risk Level:
Confidence:

Use concise paragraphs or semicolon-separated points. Risk Level must be one of
Low, Moderate, High, or Critical. Confidence must reflect source quality and
coverage. Do not include a Sources section; the application will render the
verified source list separately.
""".strip()


class BriefingService:
    """Orchestrate retrieval and Sarvam generation for executive briefings."""

    def __init__(
        self,
        retrieval: RetrievalService | None = None,
        llm_client: Any | None = None,
    ) -> None:
        self.retrieval = retrieval or RetrievalService()
        self.llm_client = llm_client or SarvamAI(
            api_subscription_key=os.getenv("SARVAM_API_KEY")
        )

    def generate(self) -> ExecutiveBriefing:
        """Return a briefing, including a safe response when retrieval fails."""

        retrieval = self.retrieval.retrieve(BRIEFING_QUERY)
        if retrieval.required and not retrieval.succeeded:
            notice = retrieval.notice or "Public-source retrieval failed."
            try:
                response = self._ask_sarvam(
                    f"{BRIEFING_PROMPT}\n\nRetrieval notice: {notice}\n\n{fallback_text(notice)}"
                )
                print("\n" + "="*80)
                print("RAW SARVAM RESPONSE:")
                print(response)
                print("="*80 + "\n")
            except Exception:
                response = fallback_text(notice)
            return format_briefing(response, retrieval, notice)

        try:
            response = self._ask_sarvam(
                "\n\n".join(
                    [
                        BRIEFING_PROMPT,
                        f"Retrieval timestamp: {retrieval.retrieved_at}",
                        f"Retrieved sources:\n{format_sources_for_prompt(retrieval.source_records)}",
                    ]
                )
            )
        except Exception as error:
            return format_briefing(
                fallback_text(f"Sarvam generation failed: {type(error).__name__}."),
                retrieval,
                "The briefing model was unavailable; showing a limited fallback.",
            )
        return format_briefing(response, retrieval)

    def _ask_sarvam(self, prompt: str) -> str:
        response = self.llm_client.chat.completions(
            model="sarvam-105b",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
