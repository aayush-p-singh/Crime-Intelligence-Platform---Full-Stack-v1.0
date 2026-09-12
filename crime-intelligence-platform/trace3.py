import sys, json, os, logging
from dotenv import load_dotenv
load_dotenv()
from services.retrieval.retrieval_service import RetrievalService
from services.retrieval.prompt_builder import build_live_prompt
from services.retrieval.prompt_builder import LIVE_INTELLIGENCE_PROMPT
from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

msg = 'Tell me about marital rape news of 2026'

res = RetrievalService().retrieve(msg)
enriched_prompt = build_live_prompt(question=msg, sources=res.source_records)
messages = [{"role": "system", "content": LIVE_INTELLIGENCE_PROMPT}, {"role": "user", "content": enriched_prompt}]

print("Calling Sarvam without max_tokens...")
response = client.chat.completions(model="sarvam-105b", messages=messages, max_tokens=4096)

print("Finish reason:", response.choices[0].finish_reason)
print("Usage:", response.usage)
