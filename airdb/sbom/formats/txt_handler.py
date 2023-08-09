"""Text File Inspection and Reporting."""
import os
import tempfile
from typing import Any, Dict, Optional, Tuple

from airdb.sbom.base_handler import BaseFileHandler

# TODO:

# COMMON EXAMPLES:
# *** HuggingFace ***
# merges.txt
# - https://github.com/huggingface/transformers/issues/1083
# vocab.txt
# - https://huggingface.co/bert-base-cased/blob/main/vocab.txt
# eval_results.txt
# - https://huggingface.co/datummd/NCBI_BC5CDR_disease/blob/main/eval_results.txt
# unigrams.txt
# - https://huggingface.co/saattrupdan/wav2vec2-xls-r-300m-ftspeech/blob/main/language_model/unigrams.txt


class TXTHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = (
        "merges.txt",
        "vocab.txt",
        "unigrams.txt",
    )
    extensions: Tuple[str, ...] = (".txt",)
    binary_file: Optional[bool] = False

    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""

        lines = []
        with open(filepath, "r", encoding="utf-8") as infile:
            for line in infile:
                if line.strip():
                    lines.append(line.strip())

        # sort the lines
        lines.sort()

        # persist to a temporary file
        with tempfile.TemporaryDirectory() as tmpdirname:
            with open(
                os.path.join(tmpdirname, "ordered.csv"), "w", encoding="utf-8"
            ) as outfile:
                outfile.writelines(lines)
            ordered_hash = self.hashfile(os.path.join(tmpdirname, "ordered.csv"))

        return {"ordered_sha256": ordered_hash}
