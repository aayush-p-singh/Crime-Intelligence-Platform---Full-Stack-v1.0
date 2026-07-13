# ==========================================================
# Crime Intelligence Platform - Pure API Backend
# ==========================================================

from flask import Flask, request, jsonify
from flask_cors import CORS



import joblib
import pandas as pd
import numpy as np
import traceback

from graph.neo4j_connection import Neo4jConnection

from services.prediction import prediction_service
from services.chart_service import ChartService
from services.crime_tools import CrimeTools
from services.sarvam_service import generate_recommendation
from services.crime_officer import officer

# ==========================================================
# Flask Initialization
# ==========================================================
app = Flask(__name__)
# The "*" acts as a wildcard, letting ANY frontend connect to it
CORS(app, resources={r"/*": {"origins": "*"}})


# ==========================================================
# Database Connection
# ==========================================================
# Using a try/except to prevent deployment crash if env vars are missing
try:
    db = Neo4jConnection()
except Exception as e:
    print(f"⚠️ Database connection skipped: {e}")
    db = None

# ==========================================================
# AI / ML Models
# ==========================================================
try:
    model = joblib.load("crime_model.pkl")
    print("✅ AI Predictive Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load crime_model.pkl. Error: {e}")
    model = None

# ==========================================================
# API Routes (No HTML Templates)
# ==========================================================

@app.route("/state/<state_name>")
def get_state(state_name):
    if not db: return jsonify({"error": "DB Offline"}), 500
    data = db.get_state_data(state_name)
    if data: return jsonify(data)
    return jsonify({"error": "State not found"}), 404

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    state_data = data["stateData"]
    features = pd.DataFrame([{
        "Crime_Rate_2022": float(state_data["crimeRate"]),
        "Women_Crimes_2022": float(state_data["womenCrime"]),
        "Chargesheet_Rate_2022": float(state_data["chargesheetRate"])
    }])
    prediction = model.predict(features)[0]
    recommendation = generate_recommendation(state_data, prediction)
    return jsonify({"Risk_Level": prediction, "Recommendation": recommendation})

@app.route("/states")
def get_states():
    if not db: return jsonify([])
    query = "MATCH (s:State) RETURN s.name AS name ORDER BY s.name"
    with db.driver.session() as session:
        result = session.run(query)
        states = [record["name"] for record in result]
    return jsonify(states)  

@app.route("/map-data")
def map_data():
    if not db: return jsonify([])
    query = "MATCH (s:State) RETURN s.name AS name, s.crimeRate AS crimeRate, s.womenCrime AS womenCrime, s.chargesheetRate AS chargesheetRate"
    output = []
    with db.driver.session() as session:
        records = session.run(query)
        for r in records:
            features = pd.DataFrame([{"Crime_Rate_2022": float(r["crimeRate"]), "Women_Crimes_2022": float(r["womenCrime"] or 0), "Chargesheet_Rate_2022": float(r["chargesheetRate"])}])
            risk = model.predict(features)[0]
            output.append({"name": r["name"], "risk": str(risk)})
    return jsonify(output)

@app.route("/compare/<state1>/<state2>")
def compare_states(state1, state2):
    if not db: return jsonify([])
    query = "MATCH (s:State) WHERE toLower(s.name) IN [toLower($state1), toLower($state2)] RETURN s.name AS name, s.crimeRate AS crimeRate, s.womenCrime AS womenCrime, s.chargesheetRate AS chargesheetRate, s.crime2022 AS totalCrime"
    result = []
    with db.driver.session() as session:
        records = session.run(query, state1=state1, state2=state2)
        for r in records:
            features = pd.DataFrame([{"Crime_Rate_2022": float(r["crimeRate"]), "Women_Crimes_2022": float(r["womenCrime"] or 0), "Chargesheet_Rate_2022": float(r["chargesheetRate"])}])
            risk = model.predict(features)[0]
            result.append({"name": r["name"].title(), "crimeRate": float(r["crimeRate"]), "womenCrime": float(r["womenCrime"] or 0), "chargesheetRate": float(r["chargesheetRate"]), "totalCrime": int(r["totalCrime"]), "risk": risk})
    return jsonify(result)

@app.route("/api/officer", methods=["POST"])
def officer_chat():
    # (Kept your logic, just ensured it's an API route)
    data = request.json
    reply = officer.chat(data.get("message", ""))
    return jsonify({"reply": reply})

@app.route("/api/dashboard/crime-rate")
def crime_rate_chart(): return jsonify(CrimeTools.get_top_states("crimeRate", 10))

@app.route("/api/dashboard/women-crime")
def women_chart(): return jsonify(CrimeTools.get_top_states("womenCrime", 10))

@app.route("/api/dashboard/chargesheet")
def chargesheet_chart(): return jsonify(CrimeTools.get_top_states("chargesheetRate", 10))

@app.route("/api/dashboard/total-crime")
def total_chart(): return jsonify(CrimeTools.get_top_states("totalCrime", 10))

@app.route("/api/dashboard/kpis")
def dashboard_kpis(): return jsonify(CrimeTools.get_dashboard_kpis())

@app.route("/api/state/<state_name>")
def state_data(state_name): return jsonify(CrimeTools.get_state(state_name))

@app.route("/api/insight/<state>/<metric>")
def insight(state, metric): return jsonify({"insight": officer.generate_dashboard_insight(state, metric)}) 

@app.route("/api/predict/<state>")
def predict_state(state): return jsonify(prediction_service.predict_state(state))

@app.route("/api/graph/<state>")
def graph_data(state):
    data = CrimeTools.get_state(state)
    if not data: return jsonify({"error": "State not found"}), 404
    return jsonify({
        "nodes": [{"id": data["name"], "label": data["name"].title(), "group": "State"}, {"id": "Crime Rate", "label": "Crime Rate\n" + str(data["crimeRate"]), "group": "Metric"}],
        "links": [{"source": data["name"], "target": "Crime Rate", "label": "has"}]
    })

@app.route("/api/charts/crime-rate")
def chart_crime_rate(): return jsonify(ChartService.crime_rate())

@app.route("/api/charts/women-crime")
def chart_women_crime(): return jsonify(ChartService.women_crime())

@app.route("/api/charts/chargesheet")
def chart_chargesheet(): return jsonify(ChartService.chargesheet())

@app.route("/api/charts/risk-distribution")
def chart_risk_distribution(): return jsonify(ChartService.risk_distribution())

@app.route("/api/dashboard/risk-distribution")
def dashboard_risk_distribution(): return jsonify([{"name": "Low", "value": 12}, {"name": "Medium", "value": 8}])

@app.route("/api/dashboard/trend")
def dashboard_trend(): return jsonify([{"name": "2023", "value": 5643210}])

@app.route('/api/forecast', methods=['POST'])
def threat_forecast():
    if model is None: return jsonify({"error": "Model offline"}), 500
    try:
        data = request.json
        features = np.array([[float(data.get('Crime_Rate_2022', 0)), float(data.get('Women_Crimes_2022', 0)), float(data.get('Chargesheet_Rate_2022', 0))]])
        prediction = model.predict(features)
        return jsonify({"status": "success", "forecasted_threat_level": str(prediction[0])})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
