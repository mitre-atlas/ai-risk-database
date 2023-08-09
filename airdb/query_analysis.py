"""Analyze queries and present results. """
import re
from typing import Optional, Tuple

from airdb.storage.filestorage import AirDBBase

HUGGINGFACE_PREFIXES = (
    "albert-",
    "bert-",
    "camembert-",
    "ctrl-",
    "distilbert-",
    "flaubert-",
    "distil",  # distilbert, distilgpt2, ...
    "gpt2-",
    "openai-",
    "roberta-",
    "t5-",
    "transfo-",
    "xlm-",
    "xlnet-",
)


def is_purl(query: str) -> bool:
    """Return True if the query is a purl."""
    return query.startswith("pkg:")


def is_url(query: str) -> bool:
    """Return True if the query is a URL."""
    return query.startswith("https://")


def url_to_purl(url: str) -> Optional[str]:
    """Convert a URL to a purl."""
    if "hf.co/" in url:
        url = url.replace("hf.co/", "huggingface.co/")
    if "huggingface.co/" in url:
        return "pkg:" + url.removeprefix("https://").removeprefix(
            "http://"
        ).removesuffix("/").replace("huggingface.co", "huggingface")
    elif "github.com" in url:
        return url.replace("https://github.com/", "pkg:github/")
    return None


def is_repo_name(query: str) -> bool:
    """Return True if the query is a huggingface / github repo name (without prefix)."""
    # a bunch of huggingface repos have no {org}/{repo} format
    if query.startswith(HUGGINGFACE_PREFIXES):
        return True

    # check for {org}/{repo} format
    return re.match("[A-Za-zz0-9-_]*/[A-Za-zz0-9-_]*", query) is not None


def is_sha256(query: str) -> bool:
    """Return True if the query is a sha256 hash."""
    return re.match("[a-f0-9]{64}", query, re.IGNORECASE) is not None


class QueryHandler(object):
    """Analyze queries and present results."""

    def __init__(
        self,
        sbom: Optional[AirDBBase] = None,
        rime: Optional[AirDBBase] = None,
        filescan: Optional[AirDBBase] = None,
        sha256: Optional[AirDBBase] = None,
        tags: Optional[AirDBBase] = None,
        repo: Optional[AirDBBase] = None,
    ):
        self.sbom = sbom
        self.rime = rime
        self.filescan = filescan
        self.sha256 = sha256
        self.tags = tags
        self.repo = repo

    def can_handle(self, query: str) -> bool:
        """Return the type of query."""
        if is_purl(query):
            return True
        if is_url(query):
            return True
        if is_sha256(query):
            return True
        if is_repo_name(query):
            return True
        if is_sha256(query):
            return True
        if self.filescan.exists(query):
            return True
        if self.tags.exists(query):
            return True

    def handle(self, query: str) -> Tuple[str, dict]:
        """Return relevant information about the query."""
        if is_purl(query):
            return "purl", self.handle_purl(query)
        if is_url(query):
            purl = url_to_purl(query)
            if purl:
                return "url", self.handle_purl(purl)
            return "error", {}
        if is_repo_name(query):
            # convert to a purl
            for base in ["pkg:huggingface/", "pkg:github/"]:
                if self.repo.exists(f"{base}{query}"):
                    purl = f"{base}{query}"
                    return "repo", self.handle_purl(purl)
            return "error", {}

        if is_sha256(query):
            return "sha256", self.handle_sha256(query)

        # try filescan
        if self.filescan.exists(query):
            return "filescan", self.handle_filescan(query)

        # try tags
        if self.tags.exists(query):
            return "tag", self.handle_tag(query)

        return "error", {}

    def handle_purl(self, purl: str) -> dict:
        """Return relevant information about the purl."""
        item: dict = {}

        # get repo info by removing "@" from the purl
        basepurl = purl.split("@")[0]
        if self.repo.exists(basepurl):
            item.update({"repo": self.repo.get(basepurl)})

            # get the last version if none is specified
            if "@" not in purl:
                if item.get("repo", {}).get("versions", {}):
                    versions = sorted(
                        item["repo"]["versions"].items(),
                        key=lambda x: x[1],
                        reverse=True,
                    )
                    latest_version = versions[0][0]
                    purl = f"{purl}@{latest_version}"

        if self.sbom.exists(purl):
            item.update({"sbom": self.sbom.get(purl)})

        if self.rime.exists(purl):
            item.update({"rime": self.rime.get(purl)})

        if item:
            # if we found anything, include the purl also
            # set the purl for use in template rendering
            item["purl"] = purl

        return item

    def handle_sha256(self, purl: str) -> dict:
        """Return relevant information about the sha256."""
        if self.sha256.exists(purl):
            return self.sha256.get(purl)
        return {}

    def handle_filescan(self, purl: str) -> dict:
        """Return relevant information about the filescan."""
        if self.filescan.exists(purl):
            return self.filescan.get(purl)
        return {}

    def handle_tag(self, purl: str) -> dict:
        """Return relevant information about the tag."""
        if self.tags.exists(purl):
            return self.tags.get(purl)
        return {}
