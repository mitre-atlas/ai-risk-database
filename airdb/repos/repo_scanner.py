"""Repository management for AirDB."""
from typing import Any, Dict, Generator, Optional, Set, Tuple

from airdb.repos.base_repo_scanner import BaseRepoScanner
from airdb.utils.modules import import_subclass


class RepoScanner(object):
    """A single object to handle all repo scanning."""

    def __init__(self) -> None:
        # auto-register file handlers that inherit from BaseRepoScanner
        self.scanners = [
            obj()
            for _, obj in import_subclass(
                "airdb/repos/scanners", BaseRepoScanner
            ).items()
        ]

    def can_handle(self, purl: str) -> bool:
        """Determine if the purl is handled by this handler."""
        return any(scanner.can_handle(purl) for scanner in self.scanners)

    def handle(self, purl: str) -> Dict[str, str]:
        """Handle the purl."""
        for scanner in self.scanners:
            if scanner.can_handle(purl):
                return scanner.handle(purl)
        return {}

    def repo_iter(
        self, skip: Optional[Set[str]] = None, with_latest: bool = True
    ) -> Generator[str, None, None]:
        """Iterate through purls in a repo."""
        for scanner in self.scanners:
            yield from scanner.repo_iter(skip, with_latest)

    def file_iter(self, purl: str) -> Generator[Tuple[str, str], None, None]:
        """Iterate through files in a repo."""
        for scanner in self.scanners:
            if scanner.can_handle(purl):
                yield from scanner.file_iter(purl)
                break

    def get_repo_info(self, purl: str) -> Dict[str, Any]:
        """Get repo info for this purl."""
        for scanner in self.scanners:
            if scanner.can_handle(purl):
                return scanner.get_repo_info(purl)
        return {}
