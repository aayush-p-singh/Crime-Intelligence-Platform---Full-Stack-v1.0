import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)


def generate_recommendation(state_data, risk_level):

    prompt = f"""
You are an expert Crime Intelligence Analyst.

Analyze the following crime statistics.

State: {state_data['name']}

Crime Rate(per lakh population): {state_data['crimeRate']}

Crimes Against Women (reported cases):
{state_data['womenCrime']}

Chargesheet Rate: {state_data['chargesheetRate']}

Predicted Risk: {risk_level}

Generate clean plain text.

Each section must start on a new line.

Summary:
...

Recommendations:
1.
2.
3.

Conclusion:
...

Do NOT use markdown.

Return the response in exactly this format:

Summary:
<2 sentences>

Recommendations:
• Recommendation 1
• Recommendation 2
• Recommendation 3

Conclusion:
<1 sentence>

Do not use markdown like ** or ##.

Keep the response under 120 words.
"""

    response = client.chat.completions(
        model="sarvam-105b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content
