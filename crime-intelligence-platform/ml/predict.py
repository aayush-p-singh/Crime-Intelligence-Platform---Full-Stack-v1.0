import joblib

model = joblib.load("model/crime_model.pkl")


def predict_risk(crime_rate, women_crime, chargesheet):

    prediction = model.predict(
        [[crime_rate, women_crime, chargesheet]]
    )[0]

    confidence = max(
        model.predict_proba(
            [[crime_rate, women_crime, chargesheet]]
        )[0]
    )

    return {
        "risk": prediction,
        "confidence": round(confidence * 100, 2)
    }