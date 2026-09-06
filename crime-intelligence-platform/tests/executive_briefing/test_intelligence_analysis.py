from services.executive_briefing.intelligence_analysis import build_intelligence_metadata
from services.executive_briefing.parser import ExecutiveBriefing
from services.executive_briefing.retriever import RetrievedArticle


def test_intelligence_metadata_is_bounded_and_deduplicated() -> None:
    articles = [
        RetrievedArticle("Cyber ransomware attack", "https://example.test/a", "2026-09-07", "A ransomware attack and fraud event.", "Source A", 8),
        RetrievedArticle("Cyber ransomware attack", "https://example.test/a", "2026-09-07", "Duplicate event.", "Source A", 8),
        RetrievedArticle("International terror threat", "https://example.test/b", "2026-09-06", "International terrorism warning.", "Source B", 7),
    ]
    briefing = ExecutiveBriefing(executive_summary="High cyber threat", risk_level="High", confidence="High")

    metadata = build_intelligence_metadata(articles, briefing)

    assert 0 <= metadata["confidenceEvidence"]["score"] <= 100
    assert metadata["confidenceEvidence"]["sourceCount"] == 3
    assert len(metadata["threatTimeline"][0]["events"]) == 1
    assert all(0 <= item["score"] <= 100 for item in metadata["severityMatrix"])
