""" Local file storage for database. """
import glob
import json
import os
from typing import Any, Dict, Generator, Optional

from airdb.storage.interface import AirDBBase
from airdb.utils.json_decoder import sanitize_json_output


class LocalFileStorage(AirDBBase):
    """Local file storage for database."""

    def __init__(self, dbname: str, path: str, **kwargs: Any):
        """Initialize the database.

        :param dbname: The name of the database.
        :param path: The path to the database.
        """
        super().__init__(dbname, **kwargs)

        self.basepath = path
        self.dbpath = os.path.join(self.basepath, self.dbname)

        # create directory if it doesn't exist
        if not os.path.exists(self.dbpath):
            os.makedirs(self.dbpath)

    def get(self, key: str) -> Dict[str, Any]:
        """Get a key from the database."""
        key = self._sanitize_key(key)
        try:
            with open(os.path.join(self.dbpath, key), "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def set(self, key: str, value: Any) -> None:
        """Set a value in the database."""
        key = self._sanitize_key(key)
        value = sanitize_json_output(value)
        with open(os.path.join(self.dbpath, key), "w", encoding="utf-8") as f:
            json.dump(value, f)

    def upsert(self, key: str, value: Any) -> None:
        """Merge (or insert) values at key with new values."""
        key = self._sanitize_key(key)
        value = sanitize_json_output(value)
        if self.exists(key):
            data = self.get(key)
        else:
            data = {}
        data.update(value)
        self.set(key, value)

    def delete(self, key: str) -> None:
        """Delete a key from the database."""
        key = self._sanitize_key(key)
        os.remove(os.path.join(self.dbpath, key))

    def exists(self, key: str) -> bool:
        """Check if a key exists in the database."""
        key = self._sanitize_key(key)
        return os.path.exists(os.path.join(self.dbpath, key))

    def keys(self, pattern: Optional[str] = None) -> Generator[str, None, None]:
        """Get all keys in the database."""
        if pattern is None:
            pattern = "*"
        else:
            pattern = self._sanitize_key(pattern) + "*"
        prefix = os.path.join(self.dbpath, "")
        for fname in glob.glob(os.path.join(self.dbpath, pattern)):
            yield self._unsanitize_key(fname.removeprefix(prefix))

    def flush(self) -> None:
        """Flush the database."""
        pass

    def close(self) -> None:
        """Close the database."""
        pass

    def _sanitize_key(self, key: str) -> str:
        """Sanitize a key."""
        # a file separator isn't allowed in the key
        return key.replace("/", "--")

    def _unsanitize_key(self, key: str) -> str:
        """Unsanitize a key."""
        return key.replace("--", "/")
