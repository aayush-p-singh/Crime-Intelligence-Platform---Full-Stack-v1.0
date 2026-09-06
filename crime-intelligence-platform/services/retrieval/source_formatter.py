"""Serialization and prompt formatting for retrieved sources."""

from __future__ import annotations

from typing import Any

from services.retrieval.search_provider import SearchResult


def source_to_dict(source: SearchResult) -> dict[str, Any]:
    """Return the stable API representation shown by the chat clients."""

    return {
        "title": source.title,
        "url": source.url,
        "publicationDate": source.publication_date,
        "summary": source.summary,
        "sourceName": source.source_name,
    }


def format_sources_for_prompt(sources: list[SearchResult]) -> str:
    """Render normalized sources as bounded context for Sarvam AI."""

    if not sources:
        return "No public sources were retrieved."

    blocks = []
    for index, source in enumerate(sources, start=1):
        blocks.append(
            "\n".join(
                [
                    f"Source {index}: {source.title}",
                    f"URL: {source.url}",
                    f"Publication date: {source.publication_date or 'Not provided'}",
                    f"Summary: {source.summary or 'No summary provided.'}",
                ]
            )
        )
    return "\n\n".join(blocks)
