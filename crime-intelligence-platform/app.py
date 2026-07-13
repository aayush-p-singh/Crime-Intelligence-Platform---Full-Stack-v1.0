# ==========================================================
# Crime Intelligence Platform
# Flask Application
# ==========================================================

# -----------------------------
# Flask
# -----------------------------
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app) # Add this line directly under the app initialization

# -----------------------------
# Data Science
# -----------------------------
import joblib
import pandas as pd
import numpy as np
import traceback

# -----------------------------
# Graph Database
# -----------------------------
from graph.neo4j_connection import Neo4jConnection

# -----------------------------
# Services
# -----------------------------
from services.prediction import prediction_service
from services.chart_service import ChartService
from services.crime_tools import CrimeTools
from services.sarvam_service import generate_recommendation
from services.crime_officer import officer

# ==========================================================
# Flask Initialization
# ==========================================================

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}}
)

# ==========================================================
# Database Connection
# ==========================================================

db = Neo4jConnection()

# ==========================================================
# AI / ML Models
# ==========================================================

# --- AI THREAT FORECASTING ENGINE ---
try:
    crime_model = joblib.load('crime_model.pkl')
    print("✅ AI Predictive Model (crime_model.pkl) loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load crime_model.pkl. Error: {e}")
    crime_model = None

model = joblib.load("crime_model.pkl")

@app.route("/")
def home():

    state = request.args.get("state")

    return render_template(
        "home.html",
        selected_state=state
    )
@app.route("/state/<state_name>")
def get_state(state_name):

    data = db.get_state_data(state_name)

    if data:
        return jsonify(data)

    return jsonify({"error": "State not found"}), 404
@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    print("Received JSON:")
    print(data)

    state_data = data["stateData"]

    print("State Data:")
    print(state_data)

    features = pd.DataFrame([{
        "Crime_Rate_2022": float(state_data["crimeRate"]),
        "Women_Crimes_2022": float(state_data["womenCrime"]),
        "Chargesheet_Rate_2022": float(state_data["chargesheetRate"])
    }])

    # Predict risk
    prediction = model.predict(features)[0]

    recommendation = generate_recommendation(
        state_data,
        prediction
    )

    print("Prediction:", prediction)
    print("Recommendation:", recommendation)

    return jsonify({
        "Risk_Level": prediction,
        "Recommendation": recommendation
    })

@app.route("/map")
def map_page():
    return render_template("map.html")

@app.route("/states")
def get_states():

    query = """
    MATCH (s:State)
    RETURN s.name AS name
    ORDER BY s.name
    """

    with db.driver.session() as session:
        result = session.run(query)

        states = [record["name"] for record in result]

    return jsonify(states)  
@app.route("/map-data")
def map_data():

    query = """
    MATCH (s:State)
    RETURN
        s.name AS name,
        s.crimeRate AS crimeRate,
        s.womenCrime AS womenCrime,
        s.chargesheetRate AS chargesheetRate
    """

    output = []

    with db.driver.session() as session:

        records = session.run(query)

        for r in records:

            features = pd.DataFrame([{
                "Crime_Rate_2022": float(r["crimeRate"]),
                "Women_Crimes_2022": float(r["womenCrime"] or 0),
                "Chargesheet_Rate_2022": float(r["chargesheetRate"])
            }])

            risk = model.predict(features)[0]

            output.append({
                "name": r["name"],
                "risk": str(risk)
            })

    return jsonify(output)


@app.route("/compare/<state1>/<state2>")
def compare_states(state1, state2):

    query = """
    MATCH (s:State)
    WHERE toLower(s.name) IN [toLower($state1), toLower($state2)]

    RETURN
        s.name AS name,
        s.crimeRate AS crimeRate,
        s.womenCrime AS womenCrime,
        s.chargesheetRate AS chargesheetRate,
        s.crime2022 AS totalCrime
    """

    result = []

    with db.driver.session() as session:

        records = session.run(
            query,
            state1=state1,
            state2=state2
        )

        for r in records:

            features = pd.DataFrame([{
                "Crime_Rate_2022": float(r["crimeRate"]),
                "Women_Crimes_2022": float(r["womenCrime"] or 0),
                "Chargesheet_Rate_2022": float(r["chargesheetRate"])
            }])

            risk = model.predict(features)[0]

            result.append({
                "name": r["name"].title(),
                "crimeRate": float(r["crimeRate"]),
                "womenCrime": float(r["womenCrime"] or 0),
                "chargesheetRate": float(r["chargesheetRate"]),
                "totalCrime": int(r["totalCrime"]),
                "risk": risk
            })

    return jsonify(result)

@app.route("/compare")
def compare_page():
    return render_template("compare.html")
@app.route("/chat")
def chat_page():
    return render_template("cio.html")
@app.route("/api/officer", methods=["POST"])
def officer_chat():
    data = request.json
    message = data.get("message", "").strip()

    if message == "":
        return jsonify({
            "reply": "Please enter a message."
        })

    lower_message = message.lower()
    is_dangerous_query = any(w in lower_message for w in ["dangerous", "highest", "worst", "maximum", "threat", "unsafe", "danger"])
    is_safe_query = any(w in lower_message for w in ["safe", "lowest", "best", "roam", "night", "secure"])
    is_women_query = any(w in lower_message for w in ["women", "woman", "female", "ladki", "girl", "safety for women"])

    context = ""
    states_data_summary = []

    if is_dangerous_query or is_safe_query or "state" in lower_message:
        try:
            order_direction = "DESC" if is_dangerous_query else "ASC"
            
            # Target the correct property with numeric sorting coercion
            if is_women_query:
                target_metric = "toInteger(s.womenCrime)"
                metric_label = "Women Crime Volume"
                # Exclude anomalies or unpopulated regions when looking for high danger zones
                where_clause = "WHERE toInteger(s.womenCrime) > 0" if is_dangerous_query else ""
            else:
                target_metric = "toFloat(s.crimeRate)"
                metric_label = "Crime Rate"
                where_clause = ""

            query = f"""
            MATCH (s:State)
            {where_clause}
            RETURN s.name AS name, s.crimeRate AS crimeRate, s.womenCrime AS womenCrime, s.chargesheetRate AS chargesheetRate
            ORDER BY {target_metric} {order_direction}
            LIMIT 3
            """
            
            with db.driver.session() as session:
                records = session.run(query)
                for r in records:
                    value_to_display = r['womenCrime'] if is_women_query else r['crimeRate']
                    # Handle raw formatting or numeric display beautifully
                    formatted_val = int(value_to_display) if is_women_query and value_to_display is not None else value_to_display
                    states_data_summary.append(
                        f"{r['name'].title()} ({metric_label}: {formatted_val}, Chargesheet Rate: {r['chargesheetRate']}%)\n"
                    )
            
            intent_type = "highest" if is_dangerous_query else "lowest"
            scope_type = "women's crime vectors" if is_women_query else "overall crime indexes"
            context = f" [Dataset Insight: The top states with the {intent_type} {scope_type} are:\n" + "".join(states_data_summary) + "]"
        except Exception as db_err:
            print(f"Database context extraction fallback error: {db_err}")

    try:
        augmented_message = message + context
        reply = officer.chat(augmented_message)
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"Officer Chat Core Exception: {e}")
        
        if states_data_summary:
            label = "highest risk concentration vectors for women" if is_women_query else ("highest threat vectors" if is_dangerous_query else "most secure profiles")
            action_text = "prioritize defensive oversight and resource allocation" if is_women_query else ("exercise strategic caution" if is_dangerous_query else "look into for secure logistics")
            
            reply_text = (
                f"I encountered a parsing variance in the processing core, but querying our operational Neo4j graph network "
                f"nodes directly reveals the target regions with the {label} are:\n\n"
                f"{''.join(states_data_summary)}\n"
                f"For your tactical query profile, these are the sector parameters to {action_text}."
            )
            return jsonify({"reply": reply_text})
            
        return jsonify({
            "reply": "I apologize, an analytical dataset boundary error occurred. Please clear cache or query a specific state metric."
        })
@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")   

@app.route("/api/dashboard/crime-rate")
def crime_rate_chart():

    data = CrimeTools.get_top_states(
        "crimeRate",
        10
    )

    return jsonify(data)



@app.route("/api/dashboard/women-crime")
def women_chart():
    return jsonify(CrimeTools.get_top_states("womenCrime", 10))


@app.route("/api/dashboard/chargesheet")
def chargesheet_chart():
    return jsonify(CrimeTools.get_top_states("chargesheetRate", 10))


@app.route("/api/dashboard/total-crime")
def total_chart():
    return jsonify(CrimeTools.get_top_states("totalCrime", 10))

@app.route("/api/dashboard/kpis")
def dashboard_kpis():

    return jsonify(
        CrimeTools.get_dashboard_kpis()
    )

@app.route("/api/state/<state_name>")
def state_data(state_name):

    data = CrimeTools.get_state(state_name)

    if not data:
        return jsonify({"error": "State not found"}), 404

    return jsonify(data)

@app.route("/api/insight/<state>/<metric>")
def insight(state, metric):

    return jsonify({
        "insight": officer.generate_dashboard_insight(state, metric)
    }) 
@app.route("/api/predict/<state>")
def predict_state(state):

    result = prediction_service.predict_state(state)

    if not result:
        return {"error": "State not found"}, 404

    return result
@app.route("/api/graph/<state>")
def graph_data(state):

    data = CrimeTools.get_state(state)

    if not data:
        return jsonify({"error": "State not found"}), 404

    return jsonify({

    "nodes":[

        {
            "id":data["name"],
            "label":data["name"].title(),
            "group":"State"
        },

        {
            "id":"Crime Rate",
            "label":"Crime Rate\n" + str(data["crimeRate"]),
            "group":"Metric"
        },

        {
            "id":"Women Crime",
            "label":"Women Crime\n" + str(data["womenCrime"]),
            "group":"Metric"
        },

        {
            "id":"Chargesheet",
            "label":"Chargesheet\n" + str(data["chargesheetRate"]) + "%",
            "group":"Metric"
        },

        {
            "id":"Total Crime",
            "label":"Total Crime\n" + format(data["totalCrime"], ","),
            "group":"Metric"
        },

        {
            "id":"AI Prediction",
            "label":"AI Prediction",
            "group":"AI"
        },

        {
            "id":"GenAI Analysis",
            "label":"GenAI Analysis",
            "group":"AI"
        }

    ],

    "links":[

        {
            "source":data["name"],
            "target":"Crime Rate",
            "label":"has"
        },

        {
            "source":data["name"],
            "target":"Women Crime",
            "label":"has"
        },

        {
            "source":data["name"],
            "target":"Chargesheet",
            "label":"has"
        },

        {
            "source":data["name"],
            "target":"Total Crime",
            "label":"has"
        },

        {
            "source":data["name"],
            "target":"AI Prediction",
            "label":"evaluated by"
        },

        {
            "source":"AI Prediction",
            "target":"GenAI Analysis",
            "label":"explained by"
        }

    ]

})

    
@app.route("/graph")
def graph():

    return render_template("graph.html")

@app.route("/api/charts/crime-rate")
def chart_crime_rate():
    return jsonify(ChartService.crime_rate())


@app.route("/api/charts/women-crime")
def chart_women_crime():
    return jsonify(ChartService.women_crime())


@app.route("/api/charts/chargesheet")
def chart_chargesheet():
    return jsonify(ChartService.chargesheet())


@app.route("/api/charts/risk-distribution")
def chart_risk_distribution():
    return jsonify(ChartService.risk_distribution())

@app.route("/api/dashboard/risk-distribution")
def dashboard_risk_distribution():
    # Returning fallback data directly from the route
    return jsonify([
        {"name": "Low", "value": 12},
        {"name": "Medium", "value": 8},
        {"name": "High", "value": 5},
        {"name": "Critical", "value": 3}
    ])


@app.route("/api/dashboard/trend")
def dashboard_trend():
    # Returning fallback data directly from the route
    return jsonify([
        {"name": "2018", "value": 5074634},
        {"name": "2019", "value": 5156172},
        {"name": "2020", "value": 6601285},
        {"name": "2021", "value": 6096310},
        {"name": "2022", "value": 5824946},
        {"name": "2023", "value": 5643210}
    ])

@app.route("/login")
def login():
    return render_template("login.html")

@app.route('/api/forecast', methods=['POST'])
def threat_forecast():
    if model is None:
        return jsonify({"error": "AI Predictive Model is currently offline."}), 500
        
    try:
        data = request.json
        
        # --- MODEL INPUT MAPPING ---
        crime_rate = float(data.get('Crime_Rate_2022', 0))
        women_crimes = float(data.get('Women_Crimes_2022', 0))
        chargesheet_rate = float(data.get('Chargesheet_Rate_2022', 0))
        
        # Scikit-learn expects a 2D array
        features = np.array([[crime_rate, women_crimes, chargesheet_rate]])
        
        # Run the predictive engine
        prediction = model.predict(features)
        
        return jsonify({
            "status": "success",
            "forecasted_threat_level": str(prediction[0]) # Successfully fixed to string!
        })
        
    except Exception as e:
        print("AI Model Error:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)