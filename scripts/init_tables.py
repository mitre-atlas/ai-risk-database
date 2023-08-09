"""Initializes the necessary tables for bare-bones system running."""
import glob
import os
from typing import Any, Dict

import pymysql
import yaml

ENDPOINT = os.environ["DB_ENDPOINT"]
PORT = 3306
USER = os.environ["DB_USER"]
REGION = "us-west-1"
DBNAME = "airdb"
PASSWORD = os.environ["DB_PASSWORD"]
os.environ["LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN"] = "1"

NEEDED_SCHEMA_FILENAMES = [
  'repos',
  'users'
]

# Lifted from airdb/storage/mysql.py
def _get_schemas() -> Dict[str, Any]:
    """Get the schema from a file."""
    # get an absolute path to "schema/mysql/"
    schema_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "airdb", "storage", "schema", "mysql"
    )
    print(schema_path)
    # list all the .yml files
    schema_files = glob.glob(os.path.join(schema_path, "*.yml"))
    # return a dictionary of the {filename}.yml (without extension) and the json extension
    tables = {}
    for f in schema_files:
        table = os.path.splitext(os.path.basename(f))[0]
        if table in NEEDED_SCHEMA_FILENAMES:
          with open(f, "r", encoding="utf-8") as infile:
              tables[table] = yaml.safe_load(infile)
    return tables

def _create_table_from_schema(conn, schema, tablename) -> None:
    """Create a table from a schema."""
    columns = []
    for field in schema["fields"]:
        columns.append(f"{field['name']} {field['sql_type']}")
    definition = ", ".join(columns)
    keys = f", PRIMARY KEY ({schema['primary_key']})"
    if "secondary_key" in schema:
        keys += f", UNIQUE ({schema['secondary_key']})"
    definition += keys
    query = f"CREATE TABLE IF NOT EXISTS {tablename} ({definition});"


    cur = conn.cursor()
    cur.execute(query)
    conn.commit()
    print(f'Created table - {tablename}')


def main():
    schemas = _get_schemas()

    try:
        conn = pymysql.connect(
            host=ENDPOINT,
            user=USER,
            password=PASSWORD,
            port=PORT,
        )
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS {DBNAME}")
        conn.close()


        conn = pymysql.connect(
            host=ENDPOINT,
            user=USER,
            password=PASSWORD,
            port=PORT,
            database=DBNAME
        )
        cur = conn.cursor()
        for tablename, schema in schemas.items():
          _create_table_from_schema(conn, schema, tablename)

        conn.close()
    except Exception as e:
        print("Database connection failed due to {}".format(e))


if __name__ == '__main__':
    main()