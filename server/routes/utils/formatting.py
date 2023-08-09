"""Formatting utilities for the server."""
from numbers import Number


# Utility functions
def sizeof_fmt_human(size: Number, decimal_places: int = 1) -> str:
    """Human readable file size."""
    # for a lot of fun options, see:
    #   https://stackoverflow.com/questions/1094841/get-human-readable-version-of-file-size
    for unit in ["bytes", "KB", "MB", "GB", "TB", "PB"]:
        if abs(size) < 1000.0 or unit == "PB":
            break
        size /= 1000.0
    if unit == "bytes":
        return f"{int(size)} {unit}"
    return f"{size:.{decimal_places}f} {unit}"
