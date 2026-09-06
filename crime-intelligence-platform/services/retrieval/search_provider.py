"""Search provider contracts and the initial public RSS implementation."""

from __future__ import annotations

import os
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from typing import Any


@dataclass(frozen=True)
class SearchResult:
    """A normalized result that any retrieval provider can return."""

    title: str
    url: str
    publication_date: str | None
    summary: str
    source_name: str | None = None


class SearchProvider(ABC):
    """Provider interface for public or enterprise search backends."""

    @abstractmethod
    def search(self, query: str, limit: int = 5) -> list[SearchResult]:
        """Return normalized search results for a user query."""


class GoogleNewsRssProvider(SearchProvider):
    """Retrieve public news results without requiring an API key.

    Google News RSS is deliberately isolated behind ``SearchProvider`` so it can
    be replaced with a licensed search API or an official source adapter later.
    """

    def __init__(self, timeout_seconds: float | None = None) -> None:
        self.endpoint = os.getenv(
            "RETRIEVAL_SEARCH_URL",
            "https://news.google.com/rss/search",
        )
        configured_timeout = os.getenv("RETRIEVAL_TIMEOUT_SECONDS", "8")
        try:
            self.timeout_seconds = timeout_seconds or max(float(configured_timeout), 1.0)
        except ValueError:
            self.timeout_seconds = timeout_seconds or 8.0
        self.user_agent = "CrimeIntelligencePlatform/1.0 (+public-source-retrieval)"

    def search(self, query: str, limit: int = 5) -> list[SearchResult]:
        params = urllib.parse.urlencode(
            {"q": query, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"}
        )
        request = urllib.request.Request(
            f"{self.endpoint}?{params}",
            headers={"User-Agent": self.user_agent},
        )
        with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
            payload = response.read()

        root = ET.fromstring(payload)
        results: list[SearchResult] = []
        for item in root.findall("./channel/item")[:limit]:
            title = self._text(item.findtext("title"))
            url = self._text(item.findtext("link"))
            summary = self._clean_summary(item.findtext("description"))
            if not title or not url:
                continue

            results.append(
                SearchResult(
                    title=title,
                    url=url,
                    publication_date=self._format_date(item.findtext("pubDate")),
                    summary=summary,
                    source_name=self._source_name(title),
                )
            )
        return results

    @staticmethod
    def _text(value: str | None) -> str:
        return unescape((value or "").strip())

    @classmethod
    def _clean_summary(cls, value: str | None) -> str:
        text = cls._text(value)
        while "<" in text and ">" in text:
            start = text.find("<")
            end = text.find(">", start)
            if end < 0:
                break
            text = f"{text[:start]} {text[end + 1:]}"
        return " ".join(text.split())[:600]

    @staticmethod
    def _format_date(value: str | None) -> str | None:
        if not value:
            return None
        try:
            parsed = parsedate_to_datetime(value).astimezone(timezone.utc)
            return parsed.isoformat()
        except (TypeError, ValueError, OverflowError):
            return value.strip()

    @staticmethod
    def _source_name(title: str) -> str | None:
        if " - " not in title:
            return None
        return title.rsplit(" - ", 1)[-1].strip() or None
