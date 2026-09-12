import json
import os

from dotenv import load_dotenv
from sarvamai import SarvamAI

from services.ai.router_prompt import ROUTER_PROMPT

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)


class IntentRouter:

    def detect(self, message):

        response = client.chat.completions(
            model="sarvam-105b",
            messages=[
                {
                    "role": "system",
                    "content": ROUTER_PROMPT
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=2048
        )

        content = response.choices[0].message.content
        if content is None:
            content = ""
            
        content = content.strip()

        # Remove markdown fences if present
        content = content.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(content)

        except Exception:

            # Safe fallback
            return {
                "intent": "CHAT",
                "states": [],
                "metric": None,
                "limit": 5
            }


router = IntentRouter()