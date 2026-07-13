from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")


class Neo4jConnection:
    def __init__(self):
        # Sanity check: verify these are actually loaded
        if not all([URI, USERNAME, PASSWORD]):
            raise ValueError(f"CRITICAL: Missing environment variables! URI={URI}, USER={USERNAME}")
            
        self.driver = GraphDatabase.driver(
            URI,
            auth=(USERNAME, PASSWORD)
        )

    def close(self):
        self.driver.close()
    def run_query(self, query, **params):

        with self.driver.session() as session:

            result = session.run(query, **params)

        return [dict(record) for record in result]

    def get_state_data(self, state_name):

        

        import math

        query = """
        MATCH (s:State)
        WHERE toLower(s.name)=toLower($state)

        RETURN
        s.name AS name,
        s.crimeRate AS crimeRate,
        s.womenCrime AS womenCrime,
        s.womenCrimePercent AS womenCrimePercent,
        s.chargesheetRate AS chargesheetRate,
        s.population2022 AS population,
        s.crime2022 AS totalCrime
        """

        with self.driver.session() as session:

            result = session.run(query, state=state_name)

            record = result.single()      # <-- MOVE THIS HERE

        if not record:
            return None
 
        data = dict(record)

        if data["womenCrimePercent"] is None or (
        isinstance(data["womenCrimePercent"], float)
        and math.isnan(data["womenCrimePercent"])
    ):
            data["womenCrimePercent"] = 0

        return data
    