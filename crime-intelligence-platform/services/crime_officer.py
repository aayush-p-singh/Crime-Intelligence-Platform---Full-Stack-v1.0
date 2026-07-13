import json
from services.ai.prompts import (
    COMPARE_PROMPT,
    STATE_PROMPT,
    TOP_STATES_PROMPT
)
from dotenv import load_dotenv
from sarvamai import SarvamAI
from graph.neo4j_connection import Neo4jConnection
from services.crime_tools import CrimeTools
from services.ai.intent_router import router
import os

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)

db = Neo4jConnection()


SYSTEM_PROMPT = """
You are CIO (Crime Intelligence Officer), the AI assistant of the Crime Intelligence Platform.

You are an experienced crime analyst who helps users understand NCRB crime data.

Your personality:

- Friendly
- Professional
- Intelligent
- Curious
- Natural
- Never robotic

Rules:

1. Hold natural conversations.
2. Don't immediately jump into crime statistics.
3. Greet users naturally.
4. Answer general knowledge normally.
5. Use NCRB data ONLY when it is supplied.
6. Never invent crime statistics.
7. If data is unavailable, say so honestly.
8. Explain insights instead of only listing numbers.
9. When comparing states, discuss both strengths and weaknesses.
10. Keep responses concise unless the user requests detail.
11. If the user asks follow-up questions, use previous conversation context whenever possible.
12. You are an assistant first, and a crime analyst second.
"""


class CrimeOfficer:

    def __init__(self):

        self.history = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]
    def check_tools(self, message):

        msg = message.lower()

        trigger_words = [
        "crime rate",
        "women crime",
        "chargesheet",
        "chargesheet rate",
        "statistics",
        "crime in",
        "data"
    ]

        if not any(word in msg for word in trigger_words):
            return None

        query = """
    MATCH (s:State)
    RETURN s.name AS name
    ORDER BY s.name
    """

        with db.driver.session() as session:
            states = [r["name"].lower() for r in session.run(query)]

        for state in states:
            if state in msg:
                return CrimeTools.get_state(state)

        return None     
    COMPARE_PROMPT = """
You are CIO (Crime Intelligence Officer).

You are preparing a professional intelligence comparison using VERIFIED NCRB data.

The supplied dataset is your ONLY source of information.

STRICT RULES

- Never invent statistics.
- Never use outside knowledge.
- Never explain WHY differences exist.
- Never discuss politics, economy, literacy, policing, urbanization or social factors.
- Never repeat statistics unnecessarily.

Your job:

1. Compare the supplied states.
2. Focus primarily on the metric requested by the user, if provided.
3. Mention other supplied metrics only as supporting context.
4. End with one concise takeaway.

If information is unavailable, say:

"The available NCRB dataset does not contain this information."

Maximum 150 words.

Do not use markdown headings.

Write like a professional intelligence officer briefing a senior official.
""" 
    def handle_compare(self, message, route):

        comparison = CrimeTools.compare_states(
        route["states"][0],
        route["states"][1]
    )

        if not comparison:
            return message

        dataset = {
        "states": comparison,
        "focusMetric": route.get("metric"),
        "userQuestion": message
    }

        return json.dumps(
    dataset,
    indent=2
)
    def handle_state_data(self, message):

        tool_result = self.check_tools(message)

        if not tool_result:
            return message

        dataset = {
        "state": tool_result["name"],
        "crimeRate": tool_result["crimeRate"],
        "womenCrime": tool_result["womenCrime"],
        "chargesheetRate": tool_result["chargesheetRate"],
        "totalCrime": tool_result["totalCrime"]
    }

        return json.dumps(
    {
        "dataset": dataset,
        "question": message
    },
    indent=2
)
          
           
    def handle_top_states(self, message, route):

        metric = route.get("metric") or "crimeRate"
        limit = route.get("limit") or 5

        states = CrimeTools.get_top_states(
            metric,
            limit
    )

        dataset = {
        "metric": metric,
        "topStates": states,
        "userQuestion": message
    }

        return json.dumps(
    dataset,
    indent=2
)       
    def ask_llm(self, message, system_prompt=SYSTEM_PROMPT):

        messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

        messages.extend(self.history[1:])

        messages.append({
        "role": "user",
        "content": message
    })

        response = client.chat.completions(
            model="sarvam-105b",
            messages=messages
    )

        reply = response.choices[0].message.content

        self.history.append({
        "role": "user",
        "content": message
    })

        self.history.append({
            "role": "assistant",
            "content": reply
    })

        return reply 
    

             
    def chat(self, message):

        route = router.detect(message)

        print(route)

        intent = route["intent"]

        if intent == "COMPARE":
            message = self.handle_compare(
            message,
            route
        )

        elif intent == "STATE_DATA":
            message = self.handle_state_data(message)

        elif intent == "TOP_STATES":
            message = self.handle_top_states(
            message,
            route["metric"],
            route["limit"]
    )

        if intent == "COMPARE":
            return self.ask_llm(message, COMPARE_PROMPT)

        elif intent == "STATE_DATA":
            return self.ask_llm(message, STATE_PROMPT)

        elif intent == "TOP_STATES":
            return self.ask_llm(message, TOP_STATES_PROMPT)

        return self.ask_llm(message)
    def generate_dashboard_insight(self, state, metric):

        data = CrimeTools.get_state_data(state)

        if not data:
            return "State not found."

        prompt = f"""
        You are Crime Intelligence Officer.

        You are provided VERIFIED NCRB statistics.

        Use ONLY these values.

        State:
        {data['name']}

        Crime Rate:
        {data['crimeRate']}

        Total Crime:
        {data['totalCrime']}

        Women Crime:
        {data['womenCrime']}

        Chargesheet Rate:
        {data['chargesheetRate']}

        The user clicked the metric:

        {metric}

        Rules

        - Maximum 60 words.
        - Mention the clicked metric first.
        - Mention one or two supporting statistics.
        - Never invent numbers.
        - Never speculate.
        - Never explain causes.
        - Never use outside knowledge.
        - Professional intelligence analyst tone.
        """

        response = client.chat.completions(

            model="sarvam-105b",

            messages=[
            {
                "role":"system",
                "content":STATE_PROMPT
            },
            {
                "role":"user",
                "content":prompt
            }
        ]

    )

        return response.choices[0].message.content

officer = CrimeOfficer()    