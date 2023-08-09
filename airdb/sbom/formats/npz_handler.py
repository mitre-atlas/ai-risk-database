"""Numpy File Inspection and Reporting."""
from typing import Any, Dict, List, Tuple

from picklescan.scanner import scan_file_path

from airdb.sbom.base_handler import BaseFileHandler

# COMMON EXAMPLES:
# *** HuggingFace ***
# feats_stats.npz
# - https://huggingface.co/spaces/Siddhant/ESPnet2-SLU/blob/main/grabo/feats_stats.npz


class NPZHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = ("feats_stats.npz",)
    extensions: Tuple[str, ...] = (
        ".npz",
        ".npy",
    )

    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""
        module_info: Dict[str, List[str]] = {}

        scan_results = scan_file_path(filepath)

        # these are already categorized by severity...
        # ...but to for compatability (for now), we're going to be unopinionated
        # and just return the raw results

        raw_globals = [(g.module, g.name) for g in scan_results.globals]

        # get module_info from this, as {module: sorted(set(names))}
        # first, list names (with possible duplicates) by module
        module_info: Dict[str, Any] = {}
        for module, name in raw_globals:
            module_info.setdefault(module, []).append(name)

        return {
            "module_info": module_info,
        }
