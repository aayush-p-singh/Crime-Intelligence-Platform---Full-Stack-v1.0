from graph.neo4j_connection import Neo4jConnection

db = Neo4jConnection()


class CrimeTools:

    @staticmethod
    def get_state(state_name):

        query = """
        MATCH (s:State)
        WHERE toLower(s.name)=toLower($name)

        RETURN
        s.name AS name,
        s.crimeRate AS crimeRate,
        s.totalCrime AS totalCrime,
        s.womenCrime AS womenCrime,
        s.chargesheetRate AS chargesheetRate,
        s.crime2020 AS crime2020,
        s.crime2021 AS crime2021,
        s.crime2022 AS crime2022
        """

        with db.driver.session() as session:

            record = session.run(
                query,
                name=state_name
            ).single()

        if not record:
            return None

        return {

        "name": record["name"],

        "crimeRate": float(record["crimeRate"]),

        "womenCrime": float(record["womenCrime"] or 0),

        "chargesheetRate": float(record["chargesheetRate"]),

        "totalCrime": int(record["totalCrime"]),

        "crime2020": float(record["crime2020"]),

        "crime2021": float(record["crime2021"]),

        "crime2022": float(record["crime2022"])

}

    @staticmethod
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

        with db.driver.session() as session:

            records = session.run(
                query,
                state1=state1,
                state2=state2
            )

            result = []

            for r in records:

                result.append({
                    "name": r["name"],
                    "crimeRate": float(r["crimeRate"]),
                    "womenCrime": float(r["womenCrime"] or 0),
                    "chargesheetRate": float(r["chargesheetRate"]),
                    "totalCrime": int(r["totalCrime"])
                })

        return result

    @staticmethod
    def get_dashboard_kpis():

        query = """
    MATCH (s:State)

    RETURN
        avg(s.crimeRate) AS averageCrimeRate,
        sum(s.crime2022) AS totalCrime,
        sum(s.womenCrime) AS totalWomenCrime,
        avg(s.chargesheetRate) AS averageChargesheetRate
    """

        with db.driver.session() as session:

            record = session.run(query).single()

        return {

        "averageCrimeRate": round(record["averageCrimeRate"], 1),

        "totalCrime": int(record["totalCrime"]),

        "totalWomenCrime": int(record["totalWomenCrime"]),

        "averageChargesheetRate": round(record["averageChargesheetRate"], 1)

    }
    @staticmethod
    def get_top_states(metric, limit=5):

        allowed = {
            "crimeRate": "crimeRate",
            "womenCrime": "womenCrime",
            "chargesheetRate": "chargesheetRate",
            "totalCrime": "crime2022"
        }

        field = allowed.get(metric)

        if not field:
            return []

        query = f"""
        MATCH (s:State)

        RETURN
            s.name AS name,
            s.{field} AS value

        ORDER BY value DESC

        LIMIT $limit
        """

        with db.driver.session() as session:

            return [
                dict(record)
                for record in session.run(query, limit=limit)
            ]
        
    @staticmethod
    def get_state_data(state):

        query = """
        MATCH (s:State)
        WHERE toLower(s.name)=toLower($state)

        RETURN
            s.name AS name,
            s.crimeRate AS crimeRate,
            s.totalCrime AS totalCrime,
            s.womenCrime AS womenCrime,
            s.chargesheetRate AS chargesheetRate
    """

        with db.driver.session() as session:

            result = session.run(
            query,
            state=state
        ).single()

        if not result:
            return None

        return dict(result)    