"""Msgpack (FLAX / JAX) File Inspection and Reporting."""
from typing import Any, Dict, Tuple


from airdb.sbom.base_handler import BaseFileHandler

# TODO:

# COMMON EXAMPLES:
# *** HuggingFace ***
# flax_model.msgpack
#  - https://huggingface.co/roberta-base/blob/main/flax_model.msgpack


class MsgpackHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = ("flax_model.msgpack",)
    extensions: Tuple[str, ...] = (".msgpack",)

    # TODO: for now, do nothing extra
    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""
        return {}
