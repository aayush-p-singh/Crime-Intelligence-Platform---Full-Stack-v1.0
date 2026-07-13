import os
from neo4j import GraphDatabase
import logging

# Set up logging so we can see errors in the Render dashboard
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Neo4jConnection:
    def __init__(self):
        # 1. Fetch values
        self.uri = os.environ.get("NEO4J_URI")
        self.user = os.environ.get("NEO4J_USERNAME")
        self.password = os.environ.get("NEO4J_PASSWORD")
        
        # 2. Force log the attempt (This will show in your Render logs!)
        logger.info(f"Attempting to connect to Neo4j at: {self.uri}")
        
        if not self.uri or not self.user or not self.password:
            logger.error("MISSING ENVIRONMENT VARIABLES!")
            raise ValueError("Environment variables are missing")

        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )
            self.driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j!")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {str(e)}")
            raise e

    def close(self):
        self.driver.close()

    def run_query(self, query, **params):
        with self.driver.session() as session:
            result = session.run(query, **params)
            return [dict(record) for record in result]