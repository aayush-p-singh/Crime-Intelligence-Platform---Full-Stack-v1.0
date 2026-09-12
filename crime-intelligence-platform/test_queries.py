import requests
import json

url = "http://127.0.0.1:5000/api/officer"

queries = [
    "Tell me about latest terrorist attacks of 2026",
    "Tell me about recent murders in Delhi",
    "Tell me about marital rape news of 2026"
]

for q in queries:
    print(f"\n{'='*60}\nTEST QUERY: {q}\n{'='*60}")
    try:
        response = requests.post(url, json={"message": q})
        data = response.json()
        
        reply = data.get("reply", "")
        retrieval = data.get("retrieval", {})
        sources = retrieval.get("sources", [])
        
        print("STATUS:", response.status_code)
        print("SOURCES RETRIEVED:", len(sources))
        if sources:
            for i, s in enumerate(sources, 1):
                print(f"  {i}. {s.get('title')}")
                
        print("\nINTELLIGENCE ASSESSMENT (first 500 chars):")
        print(reply[:500] + "..." if len(reply) > 500 else reply)
        print()
    except Exception as e:
        print("ERROR:", e)
