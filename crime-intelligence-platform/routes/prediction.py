from flask import Blueprint, request, jsonify
import joblib
import pandas as pd

prediction_bp = Blueprint("prediction", __name__)

# Load trained model
model = joblib.load("model/crime_model.pkl")


@prediction_bp.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    features = pd.DataFrame([{
        "Crime_Rate_2022": data["Crime_Rate_2022"],
        "Women_Crime_%": data["Women_Crime_%"],
        "Chargesheet_Rate_2022": data["Chargesheet_Rate_2022"]
    }])

    prediction = model.predict(features)[0]

    return jsonify({
        "Risk_Level": prediction
    })