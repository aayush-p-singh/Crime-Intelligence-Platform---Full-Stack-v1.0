from graph.neo4j_connection import Neo4jConnection

db = Neo4jConnection()


class ChartService:

    @staticmethod
    def crime_rate():

        query = """
        MATCH (s:State)
        RETURN s.name AS name,
               s.crimeRate AS value
        ORDER BY value DESC
        """

        return db.run_query(query)

    @staticmethod
    def women_crime():

        query = """
        MATCH (s:State)
        RETURN s.name AS name,
               s.womenCrime AS value
        ORDER BY value DESC
        """

        return db.run_query(query)

    @staticmethod
    def chargesheet():

        query = """
        MATCH (s:State)
        RETURN s.name AS name,
               s.chargesheetRate AS value
        ORDER BY value DESC
        """

        return db.run_query(query)

    @staticmethod
    def risk_distribution():

        query = """
        MATCH (s:State)
        RETURN s.riskLevel AS risk,
               count(*) AS count
        """

        return db.run_query(query)