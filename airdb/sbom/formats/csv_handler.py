"""CSV File Inspection and Reporting."""
import os
import tempfile
from typing import Any, Dict, Optional, Tuple

from airdb.sbom.base_handler import BaseFileHandler

# TODO:

# COMMON EXAMPLES:
# *** HuggingFace ***
# similarity_evaluation_results.csv
# - https://huggingface.co/jamescalam/mpnet-nli-sts/blob/main/eval/similarity_evaluation_results.csv


class CSVHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = ()
    extensions: Tuple[str, ...] = (".csv",)
    binary_file: Optional[bool] = False

    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""

        lines = []
        with open(filepath, "r", encoding="utf-8") as infile:
            for line in infile:
                if line.strip():
                    if not line.startswith("#"):
                        lines.append(line.strip())

        # TODO: this ignores headers
        #       ideally, should remove headers and sort the remaining lines
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
