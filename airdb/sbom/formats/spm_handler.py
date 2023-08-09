"""SPM File Inspection and Reporting."""
from typing import Any, Dict, Tuple

from airdb.sbom.base_handler import BaseFileHandler

# Marian Tokenizers: https://huggingface.co/docs/transformers/model_doc/marian

# https://huggingface.co/transformers/v3.3.1/_modules/transformers/tokenization_marian.html
# TODO:

# COMMON EXAMPLES:
# *** HuggingFace ***
# source.spm
#  - https://huggingface.co/Helsinki-NLP/opus-mt-mfe-en/blob/main/source.spm
# target.spm
#  - https://huggingface.co/Helsinki-NLP/opus-mt-en-de/blob/main/target.spm


class SPMHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = (
        "source.spm",
        "target.spm",
    )
    extensions: Tuple[str, ...] = (".spm",)

    # TODO: for now, do nothing extra
    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""
        return {}
