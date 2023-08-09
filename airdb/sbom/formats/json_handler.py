"""JSON File Inspection and Reporting."""
import json
from typing import Any, Dict, Optional, Tuple

from airdb.sbom.base_handler import BaseFileHandler

# TODO:
# (1) reorder tokens and provide a content hash

# Why?
# (1) Model relationships can be linked by common vocabular, config, etc.

# COMMON EXAMPLES:
# *** HuggingFace ***
# tokenizer_config.json:
#    https://huggingface.co/bert-base-uncased/blob/2f8677524bcd13c4384ca89d93bdcc00adef251c/tokenizer_config.json
# special_tokens_map.json:
#    https://huggingface.co/saburbutt/roberta_base_tweetqa_model/blob/main/special_tokens_map.json
# tokenizer.json
#   https://huggingface.co/aditeyabaral/additionalpretrained-bert-base-cased/blob/main/tokenizer.json
#   from transformers import PreTrainedTokenizerFast
#   fast_tokenizer = PreTrainedTokenizerFast(tokenizer_file="tokenizer.json")
# vocab.json
#   https://huggingface.co/facebook/bart-base/blob/main/vocab.json
# modules.json
#  https://huggingface.co/nazarenodefrancesco/sample_model_1/blob/main/modules.json


class JSONHandler(BaseFileHandler):
    """Base class for file handlers."""

    filenames: Tuple[str, ...] = (
        "tokenizer_config.json",
        "special_tokens_map.json",
        "tokenizer.json",
        "vocab.json",
        "modules.json",
    )
    extensions: Tuple[str, ...] = (".json",)
    binary_file: Optional[bool] = False

    def handle(self, filepath: str) -> Dict[str, Any]:
        """Handle the file and return a dictionary of relevant information."""
        with open(filepath, "rb") as infile:
            contents = infile.read()

        data = json.loads(contents.decode("utf-8"))
        ordered_contents = json.dumps(data, sort_keys=True)  # sort keys, no indent

        ordered_hash = self.hashbytes(ordered_contents.encode("utf-8"))
        return {"ordered_sha256": ordered_hash}
