"""Tensorflow File Inspection and Reporting."""
from typing import Any, Dict, Tuple

from airdb.sbom.base_handler import BaseFileHandler

# TODO:
# (1) inspect for use of yaml unsafe tags

# Vulnerabilities:
# https://splint.gitbook.io/cyberblog/security-research/tensorflow-remote-code-execution-with-malicious-model
# https://www.cybersecurity-review.com/news-august-2022/three-vulnerabilities-in-hdf5-file-format-could-lead-to-remote-code-execution/

# COMMON EXAMPLES:
# *** HuggingFace ***
# tf_model.h5
# - https://huggingface.co/bert-base-uncased/blob/main/tf_model.h5


class TFHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = ("tf_model.h5",)
    extensions: Tuple[str, ...] = (".h5",)

    # TODO: for now, do nothing extra
    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""
        return {}
