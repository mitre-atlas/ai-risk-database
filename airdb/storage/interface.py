""" Database interface for AirDB. """
from typing import Any, Dict, Generator, Optional


class AirDBBase(object):
    """Base class for AirDB implementations."""

    def __init__(self, dbname: str, **kwargs: Any):
        """Initialize the database."""
        self.dbname = dbname

    def get(self, key: str) -> Dict[str, Any]:
        """Get a key from the database."""
        raise NotImplementedError

    def set(self, key: str, value: Any) -> None:
        """Set a value in the database."""
        raise NotImplementedError

    def upsert(self, key: str, value: Any) -> None:
        """Merge (or insert) values at key with new values."""
        raise NotImplementedError

    def delete(self, key: str) -> None:
        """Delete a key from the database."""
        raise NotImplementedError

    def exists(self, key: str) -> bool:
        """Check if a key exists in the database."""
        raise NotImplementedError

    def keys(self, pattern: Optional[Any] = None) -> Generator[str, None, None]:
        """Get all keys in the database."""
        raise NotImplementedError

    def flush(self) -> None:
        """Flush the database."""
        raise NotImplementedError

    def close(self) -> None:
        """Close the database."""
        raise NotImplementedError
