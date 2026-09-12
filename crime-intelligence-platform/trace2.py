import sys, json, os
from dotenv import load_dotenv
load_dotenv()
from services.retrieval.retrieval_service import RetrievalService
from services.ai.intent_router import router
from services.retrieval.prompt_builder import build_live_prompt
from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

msg = 'Tell me about marital rape news of 2026'
print('QUERY:\n' + msg + '\n')

route = router.detect(msg)
print('INTENT:\n' + route['intent'] + '\n')

retrieval_service = RetrievalService()
required = retrieval_service.requires_retrieval(msg)
if not required:
    print('RETRIEVAL REQUIRED: False')
    # Even if false, let's force it for the sake of RAG testing
    print('FORCING RETRIEVAL FOR TEST')
    required = True

res = retrieval_service.retrieve(msg)
print('GOOGLE NEWS SEARCH QUERY:\n' + res.query + '\n')

print('SOURCES RETRIEVED:')
for i, s in enumerate(res.sources, 1):
    print(f"{i}. {s['title']} ({s['url']})")
print()

enriched_prompt = build_live_prompt(
    question=msg,
    sources=res.source_records,
    dataset_context=None,
    retrieval_notice=res.notice,
)

print('RAG CONTEXT LENGTH:\n' + str(len(enriched_prompt)) + '\n')

print('SARVAM PROMPT/CONTEXT:\n' + enriched_prompt[:500] + '...\n')

from services.retrieval.prompt_builder import LIVE_INTELLIGENCE_PROMPT

messages = [
    {"role": "system", "content": LIVE_INTELLIGENCE_PROMPT},
    {"role": "user", "content": enriched_prompt}
]

response = client.chat.completions(
    model="sarvam-105b",
    messages=messages,
    max_tokens=4096
)

print('SARVAM RESPONSE:\n' + str(response.choices[0].message.content) + '\n')
