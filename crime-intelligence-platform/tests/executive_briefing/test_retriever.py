from services.executive_briefing.retriever import IntelligenceRetriever
from services.retrieval.search_provider import SearchResult


class FakeProvider:
    def search(self, query: str, limit: int = 5) -> list[SearchResult]:
        return [
            SearchResult("Cyber attack in Delhi", "https://example.test/a?utm=1", "2026-09-07", "Crime cyber attack", "Source A"),
            SearchResult("Cyber attack in Delhi", "https://example.test/a?utm=2", "2026-09-07", "Crime cyber attack", "Source A"),
            SearchResult("Weather forecast", "https://example.test/weather", "2026-09-07", "Rain expected", "Source B"),
        ]


def test_retriever_normalizes_filters_and_deduplicates() -> None:
    articles = IntelligenceRetriever(FakeProvider(), max_articles=14).retrieve("latest crime trends in Delhi")

    assert len(articles) == 1
    assert articles[0].url == "https://example.test/a"
    assert articles[0].relevance_score > 0