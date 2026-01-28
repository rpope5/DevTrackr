import sqlite3

DB_FILE = "devtrackr.db"  # make sure this matches your engine url

conn = sqlite3.connect(DB_FILE)
cur = conn.cursor()

print("DB file:", DB_FILE)

print("\nTables:")
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
print(cur.fetchall())

print("\nAlembic version:")
try:
    cur.execute("SELECT version_num FROM alembic_version;")
    print(cur.fetchall())
except Exception as e:
    print("Error:", e)

conn.close()
