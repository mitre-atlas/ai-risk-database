""" base Crawler class """
import tempfile
from typing import Any, Dict, Generator, Optional, Set, Tuple

import git
from packageurl import PackageURL

# TODO: scancode -lcpu --ignore "*.pyc" --ignore "__pycache__" --json-pp sample.json airdb
# - use scancode for basic scanning to detect
#   - license
#   - copyright
#   - authors
#   - dependencies
#   - programming language
#   - URL
# see: https://pypi.org/project/scancode-toolkit/
#
# TODO: ML models from other sources
#   - Azure ML: ``https://<region>.api.azureml.ms/mlflow/v1.0/subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.MachineLearningServices/workspaces/<workspace-name>``
#   - Azure Databricks: ``https://adb-<numbers>.<number>.azuredatabricks.net/api/2.0/mlflow``
#   - AWS Databricks: ``https://dbc-<alphanumeric>-<alphanumeric>.cloud.databricks.com/api/2.0/mlflow``
#   - GCP Databricks: ``https://<numbers>.<number>.gcp.databricks.com/api/2.0/mlflow``
# pkg:mlflow/creditfraud@3?repository_url=https://westus2.api.azureml.ms/mlflow/v1.0/subscriptions/a50f2011-fab8-4164-af23-c62881ef8c95/resourceGroups/TestResourceGroup/providers/Microsoft.MachineLearningServices/workspaces/TestWorkspace
# pkg:mlflow/trafficsigns@10?model_uuid=36233173b22f4c89b451f1228d700d49&run_id=410a3121-2709-4f88-98dd-dba0ef056b0a&repository_url=https://adb-5245952564735461.0.azuredatabricks.net/api/2.0/mlflow


def get_latest_commit_hash_from_remote(repo_url: str) -> Tuple[str, str]:
    """Get the latest commit hash from a remote repo."""
    with tempfile.TemporaryDirectory() as tmpdirname:
        # download the repo
        repo = git.Repo.clone_from(
            repo_url, tmpdirname, depth=1
        )  # shallow clone for speed
        # get the latest commit hash
        commit_hash = repo.head.object.hexsha
        commit_date = repo.head.object.committed_datetime.isoformat()
    return commit_hash, commit_date


def get_commit_date(repo_url: str, commit_hash: str) -> str:
    """Get the date of a commit in iso format."""
    with tempfile.TemporaryDirectory() as tmpdirname:
        # download the repo
        repo = git.Repo.clone_from(
            repo_url, tmpdirname, depth=1
        )  # shallow clone for speed
        # find the commit commit_hash
        commit = repo.commit(commit_hash)
        commit_date = commit.committed_datetime.isoformat()
    return commit_date


# common utility function to transform purl string into repo info
def purl2repo(
    purl: str,
    default_basename: Optional[str] = None,
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


class BaseRepoScanner(object):
    """Base class for repo scanners."""

    # subclasses should override this
    purls_handled: Tuple[str, ...] = ()

    def can_handle(self, purl: str) -> bool:
        """Determine if the purl is handled by this handler."""
        return purl.startswith(
            self.purls_handled
        )  # .startswith accepts a tuple of suffixes

    # subclasses may overwrite this
    def handle(self, purl: str) -> Dict[str, str]:
        """Handle the purl."""
        # scancode -lcpu --ignore "*.pyc" --ignore "__pycache__" --json-pp sample.json airdb
        return {}

    # iterate through repos, returning a purl string that "handle" knows how to deal with
    def repo_iter(self, toskip: Set[str]) -> Generator[str, None, None]:
        """Iterate through purls in a repo."""
        raise NotImplementedError

    # given a purl string, return metadata about the repo, e.g., downloads, tags, etc.
    # a list of key/value pairs
    def get_repo_info(self, purl: str) -> Dict[str, Any]:
        """Return metadata about the repo."""
        raise NotImplementedError

    # given a purl string, iterate through files in the repo
    # returning a directory and filename (full path is os.join(directory, filename))
    def file_iter(self, purl: str) -> Generator[Tuple[str, str], None, None]:
        """Iterate through files in a repo, specified via purl."""
        raise NotImplementedError
