from services.crime_tools import CrimeTools


class PredictionService:

    def __init__(self):

        self.tools = CrimeTools()
    def predict_state(self, state):

        data = self.tools.get_state(state)
        print("========== DATA ==========")
        print(data)
        print("==========================")

        if not data:
            return None

        crime_rate = float(data["crimeRate"])
        women_crime = float(data["womenCrime"])
        chargesheet = float(data["chargesheetRate"])
        total_crime = float(data["totalCrime"])
        crime2020 = float(data["crime2020"])
        crime2021 = float(data["crime2021"])
        crime2022 = float(data["crime2022"])

    # -----------------------------
    # Normalized Risk Score
    # -----------------------------

        crime_score = min(crime_rate / 1500, 1)

        women_score = min(women_crime / 70000, 1)

        chargesheet_score = 1 - (chargesheet / 100)

        risk_score = (
        crime_score * 0.45 +
        women_score * 0.35 +
        chargesheet_score * 0.20
    ) * 100

        risk_score = round(risk_score, 2)

        # -----------------------------
        # Crime Growth
        # -----------------------------

        growth1 = (crime2021 - crime2020) / crime2020

        growth2 = (crime2022 - crime2021) / crime2021

        average_growth = (growth1 + growth2) / 2   
        predicted_total = total_crime * (1 + average_growth)

        predicted_total = round(predicted_total)

        predicted_growth = round(average_growth * 100, 2)
        if predicted_growth > 5:
            trend = "Increasing"

        elif predicted_growth < -5:
            trend = "Decreasing"

        else:
            trend = "Stable"

    # -----------------------------
    # Risk Category
    # -----------------------------

        if risk_score < 30:
            risk = "Low"

        elif risk_score < 60:
            risk = "Moderate"

        elif risk_score < 80:
            risk = "High"

        else:
            risk = "Critical"

            

        return {

        "name": data["name"],

        "crimeRate": crime_rate,

        "womenCrime": women_crime,

        "chargesheetRate": chargesheet,

        "totalCrime": total_crime,

        "riskScore": risk_score,

        "riskLevel": risk,

        "predictedTotalCrime": predicted_total,

        "growthPercent": predicted_growth,

        "trend": trend,

    }
    
prediction_service = PredictionService()