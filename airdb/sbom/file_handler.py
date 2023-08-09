""" File Handling for SBOM."""
import datetime
import json
import os
from typing import Any, Dict

from airdb.repos.repo_scanner import RepoScanner
from airdb.sbom.base_handler import BaseFileHandler
from airdb.utils import import_subclass


class FileHandler(object):
    """FileHandler class."""

    def __init__(self) -> None:
        # auto-register file handlers that inherit from BaseFileHandler
        self.handlers = [
            obj()
            for _, obj in import_subclass("airdb/sbom/formats", BaseFileHandler).items()
        ]
        self.default_handler = BaseFileHandler()

    def process(self, filepath: str) -> Dict[str, str]:
        """Process a file and return a dictionary of relevant information."""
        try:
            final = self.default_handler.handle(filepath)
            for handler in self.handlers:
                handled, result = handler.handle_if_supported(filepath)
                if handled:
                    final.update(result)
                    break

            return final
        except FileNotFoundError:
            return { "error": "not found", "size": 0, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            # happens, for example, when a logical link points to nowher4e


def process_path(filepath: str, handler: FileHandler) -> Dict[str, Any]:
    """Extract SBOM from a directory tree."""
    entry: Dict[str, Any] = {"created": datetime.datetime.now().isoformat()}
    # enumerate through files in this repo
    sbom = []
    remove_prefix = os.path.isdir(filepath)
    for directory, _, files in os.walk(filepath):
        for filename in files:
            fullpath = os.path.join(directory, filename)
            item = {
                "filename": filename.removeprefix(filepath)
                if remove_prefix
                else filename
            }
            info = handler.process(fullpath)
            item.update(info)
            sbom.append(item)

    entry.update({"files": sbom})

    return entry


def process_purl(purl: str, handler: FileHandler, repo: RepoScanner) -> Dict[str, str]:
    """Extract SBOM by downloading a purl from a repo."""
    entry: Dict[str, Any] = {"created": datetime.datetime.now().isoformat()}

    # enumerate through files in this repo
    sbom = []
    for directory, filename in repo.file_iter(purl):
        fullpath = os.path.join(directory, filename)
        item = {"filename": filename}
        info = handler.process(fullpath)
        item.update(info)
        sbom.append(item)

    entry.update({"files": sbom})
    entry.update({"purl": purl})

    return entry


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str, help="path to directory to process")
    parser.add_argument("--purl", type=str, help="purl to process")
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        required=True,
        help="output path to store JSON results",
    )
    args = parser.parse_args()

    if args.path and args.purl:
        raise ValueError("Cannot specify both --path and --purl.")

    if not args.path and not args.purl:
        raise ValueError("Must specify either --path or --purl.")

    handler = FileHandler()

    if args.path:
        json_result = process_path(args.path, handler)
    else:
        json_result = process_purl(args.purl, handler, RepoScanner())

    with open(args.output, "w", encoding="utf-8") as _f:
        json.dump(json_result, _f)
