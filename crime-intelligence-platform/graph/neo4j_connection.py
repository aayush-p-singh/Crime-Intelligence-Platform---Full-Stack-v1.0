import os
from neo4j import GraphDatabase
import logging
from dotenv import load_dotenv

load_dotenv()  # This forces Python to read your .env file

# Set up logging so we can see errors in the Render dashboard
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Neo4jConnection:
    def __init__(self):
        # 1. Fetch values
        self.uri = os.environ.get("NEO4J_URI")
        self.user = os.environ.get("NEO4J_USERNAME")
        self.password = os.environ.get("NEO4J_PASSWORD")
        
        self._driver = None
        
        if not self.uri or not self.user or not self.password:
            logger.error("MISSING ENVIRONMENT VARIABLES!")
            raise ValueError("Environment variables are missing")

    @property
    def driver(self):
        """
        Lazy initialization of the Neo4j driver.
        This prevents the SSL state from being shared across Gunicorn worker forks,
        which causes DECRYPTION_FAILED_OR_BAD_RECORD_MAC and ConnectionResetError.
        """
        if self._driver is None:
            logger.info(f"Attempting to connect to Neo4j at: {self.uri}")
            
            try:
                self._driver = GraphDatabase.driver(
                    self.uri,
                    auth=(self.user, self.password),
                    max_connection_lifetime=200, # Drop stale connections faster
                    keep_alive=True
                )
                self._driver.verify_connectivity()
                logger.info("Successfully connected to Neo4j!")
            except Exception as e:
                logger.error(f"Failed to connect to Neo4j: {str(e)}")
                raise e
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()

    def run_query(self, query, **params):
        with self.driver.session() as session:
            result = session.run(query, **params)
            return [dict(record) for record in result]