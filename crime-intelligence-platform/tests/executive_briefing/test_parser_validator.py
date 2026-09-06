from services.executive_briefing.parser import BriefingParser
from services.executive_briefing.validator import BriefingValidator, MISSING_SECTION_TEXT


def test_parser_reads_strict_json() -> None:
    parsed = BriefingParser().parse(
        '{"executiveSummary":"A concise assessment.","riskLevel":"High","confidence":"High"}'
    )

    assert parsed.executive_summary == "A concise assessment."
    assert parsed.risk_level == "High"
    assert parsed.confidence == "High"


def test_parser_repairs_fences_single_quotes_and_trailing_commas() -> None:
    parsed = BriefingParser().parse(
        "```json\n{'executiveSummary': 'Recovered', 'riskLevel': 'Guarded',}\n```"
    )

    assert parsed.executive_summary == "Recovered"
    assert parsed.risk_level == "Guarded"


def test_validator_fills_only_missing_sections() -> None:
    parsed = BriefingParser().parse('{"executiveSummary":"Valid assessment."}')
    result = BriefingValidator().validate(parsed)

    assert result.briefing.executive_summary == "Valid assessment."
    assert result.briefing.cybercrime_updates == MISSING_SECTION_TEXT
    assert any("cybercrime_updates" in warning for warning in result.warnings)