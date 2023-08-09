"""Handle Huggingface Package URLSs (PURLs)."""
# since packageurl doesn't yet support huggingface
from typing import Optional, Tuple

from packageurl import PackageURL


# common utility function to transform purl string into repo info
def purl2repo(
    purl: str,
    default_basename: Optional[str] = "https://huggingface.co",
) -> Tuple[str, str, str]:
    """Return a repo name and commit hash from a purl."""
    purl_struct = PackageURL.from_string(purl)
    if purl_struct.namespace:
        repo = f"{purl_struct.namespace}/{purl_struct.name}"
    else:
        repo = purl_struct.name

    commithash = purl_struct.version

    repository_url = purl_struct.qualifiers.get("repository_url", default_basename)

    return repo, commithash, repository_url


def repo2purl(
    repo: str,
    commithash: Optional[str] = None,
    repository_url: str = "https://huggingface.co",
) -> str:
    """Convert huggingface repo to a purl."""

    if commithash:
        purl: str = f"pkg:huggingface/{repo}@{commithash}"
    else:
        purl = f"pkg:huggingface/{repo}"

    if repository_url not in ("https://huggingface.co", "huggingface.co"):
        purl += f"?repository_url={repository_url}"

    return purl
