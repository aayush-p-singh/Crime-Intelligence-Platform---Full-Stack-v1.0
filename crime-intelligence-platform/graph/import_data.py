from neo4j import GraphDatabase
from dotenv import load_dotenv
import pandas as pd
import os

# Load environment variables
load_dotenv()

# Connect to Neo4j
driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(
        os.getenv("NEO4J_USERNAME"),
        os.getenv("NEO4J_PASSWORD")
    )
)

# Load dataset
df = pd.read_csv("data/processed/final_project_dataset.csv")

with driver.session() as session:

    # Clear existing graph
    session.run("MATCH (n) DETACH DELETE n")

    # Import every state
    for _, row in df.iterrows():

        session.run("""
        CREATE (s:State {
            name: $state,
            crime2020: $crime2020,
            crime2021: $crime2021,
            crime2022: $crime2022,
            population2022: $population,
            population2011: $population2011,
            crimeRate: $crimeRate,
            chargesheetRate: $chargesheetRate,
            womenCrime: $womenCrime,
            crimePer100k: $crimePer100k,
            womenCrimePercent: $womenCrimePercent
        })
        """,

        state=row["State"],
        crime2020=float(row["Crime_2020"]),
        crime2021=float(row["Crime_2021"]),
        crime2022=float(row["Crime_2022"]),
        population=float(row["Population_Lakh_2022"]),
        population2011=float(row["Population_2011"]),
        crimeRate=float(row["Crime_Rate_2022"]),
        chargesheetRate=float(row["Chargesheet_Rate_2022"]),
        womenCrime=float(row["Women_Crimes_2022"]),
        crimePer100k=float(row["Crime_per_100k"]),
        womenCrimePercent=float(row["Women_Crime_%"])
        )

driver.close()

print("✅ Dataset Imported Successfully!")