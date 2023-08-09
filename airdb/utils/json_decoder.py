"""Utilities for working with JSON data."""
from datetime import date, datetime
from typing import Any

import numpy as np


# sanitize JSON output, convert bytes to utf-8 strings, etc.
def sanitize_json_output(obj: Any) -> Any:
    """Utility function to sanitize JSON output."""
    sanitized: Any
    if isinstance(obj, bytes):
        sanitized = obj.decode("utf-8")
    elif isinstance(obj, dict):
        sanitized = {k: sanitize_json_output(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        sanitized = [sanitize_json_output(v) for v in obj]
    elif isinstance(obj, tuple):
        sanitized = tuple(sanitize_json_output(v) for v in obj)
    elif isinstance(obj, (datetime, date)):
        sanitized = obj.isoformat()
    elif isinstance(obj, np.integer):
        sanitized = int(obj)
    elif isinstance(obj, np.floating):
        sanitized = float(obj)
    elif isinstance(obj, np.ndarray):
        sanitized = obj.tolist()
    elif isinstance(obj, np.bool_):
        sanitized = bool(obj)
    else:
        sanitized = obj
    return sanitized
