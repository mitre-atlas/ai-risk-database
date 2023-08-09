"""Pickle File Inspection and Reporting."""
from typing import Any, Dict, List, Tuple

from picklescan.scanner import scan_file_path

from airdb.sbom.base_handler import BaseFileHandler

# COMMON EXAMPLES:
# *** HuggingFace ***
# pytorch_model.bin
#    https://huggingface.co/transformers/v3.3.1/model_sharing.html
# training_args.bin
#    https://github.com/huggingface/transformers/issues/1456
# scheduler.pt
#    https://huggingface.co/Language-Media-Lab/byt5-small-ain-jpn-mt/blame/main/scheduler.pt
# optimizer.pt
#    https://discuss.huggingface.co/t/checkpoint-missing-optimizer-pt-how-to-resume/6138
# rng_state.pth
#    https://huggingface.co/Brendan/meta-baseline-t5-small/blame/main/rng_state.pth


class PytorchHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = (
        "pytorch_model.bin",
        "training_args.bin",
        "scheduler.pt",
        "optimizer.pt",
    )
    extensions: Tuple[str, ...] = (".bin", ".pt", ".pth", ".ckpt")

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
            if module.lower() == "torch" and "Storage" in name:
                # skip these
                continue
            module_info.setdefault(module, []).append(name)

        # sort modules alphabetically
        module_info = {k: sorted(set(v)) for k, v in module_info.items()}

        return {"module_info": module_info}
