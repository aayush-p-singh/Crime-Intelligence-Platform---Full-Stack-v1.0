from neo4j_connection import Neo4jConnection

db = Neo4jConnection()

state = db.get_state_data("Delhi")

print(state)

db.close()