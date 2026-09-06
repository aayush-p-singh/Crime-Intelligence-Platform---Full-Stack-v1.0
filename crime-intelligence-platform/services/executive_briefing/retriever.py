"""Retrieve and normalize ranked public intelligence articles."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit

from services.retrieval.search_provider import SearchProvider, SearchResult


@dataclass(frozen=True)
class RetrievedArticle:
    """Normalized article evidence passed to prompt construction."""

    title: str
    url: str
    publication_date: str | None
    summary: str
    source_name: str | None
    relevance_score: float


class IntelligenceRetriever:
    """Use an injected provider to produce relevant, ranked article evidence."""

    _TOPIC_TERMS = (
        "crime", "cyber", "fraud", "scam", "ransomware", "terror", "police",
        "security", "attack", "threat", "criminal", "law enforcement", "advisory",
    )

    def __init__(self, provider: SearchProvider, max_articles: int = 14) -> None:
        self.provider = provider
        self.max_articles = max_articles

    def retrieve(self, query: str) -> list[RetrievedArticle]:
        """Fetch, normalize, deduplicate, filter, and rank article evidence."""

        results = self.provider.search(query, limit=max(self.max_articles * 2, 20))
        normalized = [self._normalize(result, query) for result in results]
        relevant = [article for article in normalized if article.relevance_score > 0]
        deduplicated = self._deduplicate(relevant)
        return sorted(
            deduplicated,
            key=lambda article: article.relevance_score,
            reverse=True,
        )[: self.max_articles]

    def _normalize(self, result: SearchResult, query: str) -> RetrievedArticle:
        title = self._clean(result.title)
        summary = self._clean(result.summary)
        score = self._score(f"{title} {summary}", query)
        return RetrievedArticle(
            title=title,
            url=self._canonical_url(result.url),
            publication_date=result.publication_date,
            summary=summary,
            source_name=self._clean(result.source_name or "") or None,
            relevance_score=score,
        )

    def _score(self, text: str, query: str) -> float:
        normalized = text.lower()
        query_terms = set(re.findall(r"[a-z0-9-]+", query.lower()))
        topic_hits = sum(term in normalized for term in self._TOPIC_TERMS)
        query_hits = sum(term in normalized for term in query_terms if len(term) > 3)
        return float(topic_hits * 2 + query_hits)

    @staticmethod
    def _deduplicate(articles: Iterable[RetrievedArticle]) -> list[RetrievedArticle]:
        seen: set[str] = set()
        unique: list[RetrievedArticle] = []
        for article in articles:
            key = article.url or article.title.lower()
            if key in seen:
                continue
            seen.add(key)
            unique.append(article)
        return unique

    @staticmethod
    def _canonical_url(url: str) -> str:
        parsed = urlsplit(url.strip())
        return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))

    @staticmethod
    def _clean(value: str) -> str:
        return " ".join(value.replace("\n", " ").split())