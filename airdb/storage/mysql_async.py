""" Local file storage for database. """
import glob
import json
import os
from typing import Any, Dict, Generator, List, Optional

import yaml
from databases import Database

from airdb.storage.interface import AirDBBase
from airdb.utils.json_decoder import sanitize_json_output

#
ENDPOINT = os.environ["DB_ENDPOINT"]
PORT = 3306
USER = os.environ["DB_USER"]
REGION = "us-west-1"
DBNAME = "airdb"
PASSWORD = os.environ["DB_PASSWORD"]
os.environ["LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN"] = "1"


def _format_helper(sql_type: str, value: Any) -> Any:
    # JSON converted to a string
    if sql_type.startswith("JSON") and isinstance(value, (dict, list)):
        value = json.dumps(value)
    # numeric types listed as a number
    elif sql_type.startswith(("FLOAT", "DOUBLE")) and isinstance(value, str):
        value = float(value)
    elif sql_type.startswith(
        (
            "INT",
            "TINYINT",
            "SMALLINT",
            "MEDIUMINT",
            "BIGINT",
        )
    ) and isinstance(value, str):
        value = int(value)
    else:
        pass

    return value


class AsyncMySQLDB(AirDBBase):
    """Local file storage for database."""

    def __init__(
        self,
        tablename: str,
        dbname: str,
        endpoint: str = ENDPOINT,
        user: str = USER,
        password: str = PASSWORD,
        port: str = PORT,
        **kwargs: Any,
    ):
        """Initialize the database.

        :param dbname: The name of the database.
        :param path: The path to the database.
        """
        super().__init__(dbname, **kwargs)

        # does a schema exist for this table?
        schemas = self._get_schemas()

        if not tablename in schemas:
            raise ValueError(f"Schema for table {tablename} not found.")

        self.schema = schemas[tablename]
        self.tablename = tablename
        self.dbname = dbname
        self.tablename = tablename

        self.connection_string = (
            f"mysql+aiomysql://{user}:{password}@{endpoint}:{port}/{dbname}"
        )
        self.initialize_check = False

    async def ensure_initialized(self):
        """Initialize the database."""
        if self.initialize_check:
            return

        self.db = Database(self.connection_string, min_size=5, max_size=20)
        await self.db.connect()

        try:
            async with self.db.connection() as conn:
                result = await conn.fetch_all("""SELECT now()""")
        except Exception as e:
            print("Database connection failed due to {}".format(e))

        # ensure database exists
        async with self.db.connection() as conn:
            await conn.execute(f"CREATE DATABASE IF NOT EXISTS {self.dbname}")

        # ensure the table exists
        await self._create_table_from_schema()

        # set that we've initialized
        self.initialize_check = True

    @classmethod
    def _get_schemas(cls) -> Dict[str, Any]:
        """Get the schema from a file."""
        # get an absolute path to "schema/mysql/"
        schema_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "schema", "mysql"
        )
        # list all the .yml files
        schema_files = glob.glob(os.path.join(schema_path, "*.yml"))
        # return a dictionary of the {filename}.yml (without extension) and the json extension
        tables = {}
        for f in schema_files:
            table = os.path.splitext(os.path.basename(f))[0]
            with open(f, "r", encoding="utf-8") as infile:
                tables[table] = yaml.safe_load(infile)
        return tables

    async def _create_table_from_schema(self) -> None:
        """Create a table from a schema."""
        columns = []
        for field in self.schema["fields"]:
            columns.append(f"{field['name']} {field['sql_type']}")
        definition = ", ".join(columns)
        keys = f", PRIMARY KEY ({self.schema['primary_key']})"
        if "secondary_key" in self.schema:
            keys += f", UNIQUE ({self.schema['secondary_key']})"
        definition += keys
        query = f"CREATE TABLE IF NOT EXISTS {self.tablename} ({definition});"

        async with self.db.connection() as conn:
            await conn.execute(query)

    async def get(self, key: str, keyname: Optional[str] = None) -> Dict[str, Any]:
        """Get a key from the database."""
        await self.ensure_initialized()

        if keyname is None:
            keyname = self.schema["primary_key"]

        async with self.db.connection() as conn:
            query_results = await conn.fetch_one(
                f"SELECT * FROM {self.tablename} WHERE {keyname} = '{key}'"
            )

        # format the results according to the python_type in self.schema
        result = {}
        if query_results:
            # return as properly formatted dict
            # by handling JSON type
            # JSON converted to a string
            for item, value in zip(self.schema["fields"], query_results):
                column = item["name"]
                sql_type = item["sql_type"]
                if (
                    sql_type.startswith("JSON")
                    and isinstance(value, str)
                    and len(value) > 0
                ):
                    result[column] = json.loads(value)
                else:
                    result[column] = value
        return result

    async def set(self, key: str, value: Dict[str, Any]) -> None:
        """Set a value in the database."""
        await self.ensure_initialized()

        value = sanitize_json_output(value)  # numpy -> builtin, datetime->str, etc.
        name_value_pairs = []
        for field in self.schema["fields"]:
            _n = field["name"]
            _v = value.get(field["name"], None)
            if _v is not None:
                _v = _format_helper(field["sql_type"], _v)
                name_value_pairs.append((_n, _v))

        columns, values = list(zip(*name_value_pairs))
        sql = f"""REPLACE INTO {self.tablename} ({','.join(columns)})
                  VALUES ({", ".join([f':{k}' for k in columns])})"""

        async with self.db.connection() as conn:
            await conn.execute(query=sql, values=dict(name_value_pairs))

    async def custom_query(
        self,
        query: str,
        values: Optional[Dict[str, Any]] = None,
        session_init_commands: Optional[List[str]] = None,
    ) -> List[Any]:
        """Run a custom query.

        This uses the SQLAlchemy syntax:
        await db.custom_query(query="SELECT * from users WHERE login = :user", values={"user":"drhyrum"})"""
        await self.ensure_initialized()

        async with self.db.connection() as conn:
            if session_init_commands:
                for command in session_init_commands:
                    await conn.execute(command)
            query_results = await conn.fetch_all(query, values)
        return query_results

    async def upsert(self, key: str, value: Any) -> None:
        """Merge (or insert) values at key with new values."""
        await self.ensure_initialized()

        value = sanitize_json_output(value)  # numpy -> builtin, datetime->str, etc.
        name_value_pairs = []
        for field in self.schema["fields"]:
            _n = field["name"]
            _v = value.get(field["name"], None)
            if _v is not None:
                _v = _format_helper(field["sql_type"], _v)
                name_value_pairs.append((_n, _v))

        columns, values = list(zip(*name_value_pairs))
        sql = (
            f"""INSERT INTO {self.tablename} ({','.join(columns)})"""
            f"""VALUES ({", ".join([f':{k}' for k in columns])})"""
            f"""ON DUPLICATE KEY UPDATE {','.join([f'{c}=:{c}' for c in columns])}"""
        )

        async with self.db.connection() as conn:
            await conn.execute(query=sql, values=dict(name_value_pairs))

    async def delete(self, key: str) -> None:
        """Delete a key from the database."""
        raise NotImplementedError("Delete not implemented for AsyncMySQLDB.")

    async def exists(self, key: str, keyname: Optional[str] = None) -> bool:
        """Check if a key exists in the database."""
        await self.ensure_initialized()

        if keyname is None:
            keyname = self.schema["primary_key"]
        async with self.db.connection() as conn:
            query_results = await conn.fetch_one(
                f"SELECT * FROM {self.tablename} WHERE {keyname} = '{key}'"
            )
        return query_results is not None

    async def keys(self, pattern: Optional[str] = None) -> Generator[str, None, None]:
        """Get all keys in the database."""
        await self.ensure_initialized()

        if pattern is None:
            sql = f"SELECT {self.schema['primary_key']} FROM {self.tablename}"
        else:
            # SQL keyname must match pattern
            # '{pattern}%' starts with {pattern}
            # '%{pattern}%' contains {pattern}
            # '%{pattern}' ends with {pattern}
            pattern = pattern.replace("*", "%")
            sql = f"""SELECT {self.schema['primary_key']} FROM {self.tablename}
                      WHERE {self.schema['primary_key']} LIKE '{pattern}'"""

        async with self.db.connection() as conn:
            query_results = await conn.fetch_all(sql)

        for row in query_results:
            yield row[0]

        return

    async def flush(self) -> None:
        """Flush the database."""
        pass

    async def close(self) -> None:
        """Close the database."""
        pass
