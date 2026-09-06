from services.executive_briefing.prompt_builder import BriefingPromptBuilder, REQUIRED_FIELDS
from services.executive_briefing.retriever import RetrievedArticle


def test_prompt_builder_contains_evidence_and_all_sections() -> None:
    article = RetrievedArticle("Cyber alert", "https://example.test/a", "2026-09-07", "Summary", "Source", 4.0)
    prompt = BriefingPromptBuilder().build([article])

    assert "Cyber alert" in prompt
    assert "Summary" in prompt
    assert "valid JSON object" in prompt
    assert "markdown tables" in prompt
    for field in REQUIRED_FIELDS:
        assert f'"{field}"' in prompt