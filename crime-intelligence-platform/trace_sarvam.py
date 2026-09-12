import sys, json, os, logging
from dotenv import load_dotenv
load_dotenv()
from services.retrieval.retrieval_service import RetrievalService
from services.ai.intent_router import router
from services.retrieval.prompt_builder import build_live_prompt
from services.retrieval.prompt_builder import LIVE_INTELLIGENCE_PROMPT
from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

msg = 'Tell me about latest terrorist attacks of 2026'
print('QUERY:', msg)

retrieval_service = RetrievalService()
res = retrieval_service.retrieve(msg)
print('SOURCES RETRIEVED:', len(res.sources))

enriched_prompt = build_live_prompt(
    question=msg,
    sources=res.source_records,
    dataset_context=None,
    retrieval_notice=res.notice,
)

print('RAG CONTEXT CHAR LENGTH:', len(enriched_prompt))

messages = [
    {"role": "system", "content": LIVE_INTELLIGENCE_PROMPT},
    {"role": "user", "content": enriched_prompt}
]

print("Calling Sarvam...")
try:
    response = client.chat.completions(
        model="sarvam-105b",
        messages=messages,
        max_tokens=4096
    )
    
    print("--- RAW RESPONSE START ---")
    print(repr(response))
    print("--- RAW RESPONSE END ---")
    
    print("Has choices?", hasattr(response, "choices"))
    if hasattr(response, "choices") and len(response.choices) > 0:
        c = response.choices[0]
        print("Choice 0:")
        print("  finish_reason:", getattr(c, "finish_reason", "N/A"))
        if hasattr(c, "message"):
            print("  message.content:", repr(getattr(c.message, "content", "N/A"))[:500])
        else:
            print("  No message attribute")
    else:
        print("  No choices or empty choices list.")
except Exception as e:
    print("EXCEPTION:", repr(e))
