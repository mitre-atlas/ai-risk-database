""" Module to crawl pytorch repositories on GitHub. """
# from github import Github
import tempfile
from typing import Any, Dict, Generator, Optional, Set, Tuple

import git
import requests
from github import Github
from packageurl.contrib import url2purl

from airdb.repos.base_repo_scanner import (
    BaseRepoScanner,
    get_latest_commit_hash_from_remote,
    purl2repo,
)

# url2purl.get_purl("https://github.com/package-url/packageurl-python")
# purl2url.get_url('pkg:github/package-url/packageurl-python')


class PytorchRepoScanner(BaseRepoScanner):
    purls_handled: Tuple[str, ...] = ("pkg:github",)

    def is_a_pytorch_hub_repo(self, url: str) -> Tuple[bool, Optional[str]]:
        """Check to see if this url contains hubconf.py"""
        if not url.startswith("https://github.com"):
            return False, None
        # form a url to check for the existence of file
        commithash, _ = get_latest_commit_hash_from_remote(url)
        fileurl = f"{url}/{commithash}/hubconf.py".replace(
            "https://github.com", "https://raw.githubusercontent.com"
        )
        # check to see if the file exists
        resp = requests.get(fileurl)
        if resp.status_code == 200:
            return True, commithash
        else:
            return False, None

    def repo_iter(
        self, skip: Optional[Set[str]] = None, with_latest: bool = True
    ) -> Generator[str, None, None]:
        """Iterate through pytorch hub repos linked to from the pytorch hub page."""
        # TODO: replace with a github crawler that looks for either
        # (1) any github location URL found via webcrawl on pytorch.org/hub (use a webcrawler)
        # (2) any github repo that contains hubconf.py (use github API)

        known_repos = [
            "pytorch/vision",
            "snakers4/silero-models",
            "ultralytics/yolov5",
            "facebookresearch/WSL-Images",
            "facebookresearch/pytorch_GAN_zoo",
            "facebookresearch/pytorchvideo",
            "facebookresearch/semi-supervised-ImageNet1K-models",
            "huggingface/pytorch-transformers",
            "nvidia/deeplearningexamples",
            "intel-isl/MiDaS",
            "datvuthanh/HybridNets",
            "hustvl/YOLOP",
        ]
        for reponame in known_repos:
            if skip and (reponame in skip or f"pkg:github/{reponame}" in skip):
                print("skipping", reponame)
                continue  # skip this one
            url = f"https://github.com/{reponame}"
            is_repo, commithash = self.is_a_pytorch_hub_repo(url)
            if is_repo:
                if with_latest:
                    # turn this into a url, using latest commithash
                    yield url2purl.get_purl(url).to_string() + f"@{commithash}"
                else:
                    # don't return the version
                    yield url2purl.get(url).to_string()

            # # There is a torch.hub.list() method, but it requires
            # # a repo name, and also loads all dependencies...
            # for url in crawler("https://pytorch.org/hub", maxpages=1000):
            #     # is this a link to a github repo?
            #     is_repo, commithash = self.is_a_pytorch_hub_repo(url)
            #     if is_repo:
            #         # turn this into a url, using latest commithash
            #         yield url2purl.get_purl(url).to_string() + f"@{commithash}"

    def get_repo_info(self, purl: str) -> Dict[str, Any]:
        """Get repo info from github API"""
        reponame, commithash, baseurl = purl2repo(purl, None)
        if not baseurl:
            baseurl = "https://github.com"
        github = Github()
        repo_info = github.get_repo(reponame)

        # NOTE: we could get latest commithash from the repo_info.get_commits() iterator,
        # but that quickly throws a RateLimitExceededException for unauthorized users.
        # So, instead, we use the utility function to do a shallow checkout of the repo
        # downside is that this requires git to be installed, and may require ask for a login
        # to private repos.
        uri = f"{baseurl}/{reponame}"
        commithash, commitdate = get_latest_commit_hash_from_remote(uri)
        name = reponame.split("/")[-1]

        # git verify-commit
        return {
            "type": "pytorch-hub",
            "uri": f"{baseurl}/{reponame}",
            "versions": {
                commithash: commitdate
            },  # this may be updated in future crawls
            "name": name,
            "fullname": reponame,
            "owner": repo_info.owner.login,
            "reputation": {
                "forks": repo_info.forks,
                "watchers": repo_info.watchers_count,
                "subscribers": repo_info.subscribers_count,
                "issues": repo_info.open_issues_count,
                "archived": repo_info.archived,
                "created": repo_info.created_at,
                "updated": repo_info.updated_at,
            },
            "repo_info": {
                "language": repo_info.language,
                "description": repo_info.description,
                "size": repo_info.size,
            },
        }

    def file_iter(self, purl: str) -> Generator[Tuple[str, str], None, None]:
        """Iterate through files in a repo."""
        # a commithash via @{commit-hashid} is expected
        reponame, commithash, baseurl = purl2repo(purl, None)

        if baseurl is None:
            baseurl = "https://github.com"

        if commithash is None:
            commithash, _ = get_latest_commit_hash_from_remote(f"{baseurl}/{reponame}")

        # create a temporary download directory
        with tempfile.TemporaryDirectory() as tmpdirname:
            repo = git.Repo.clone_from(
                f"{baseurl}/{reponame}", tmpdirname, no_checkout=True
            )

            # checkout the commit we want
            repo.git.checkout(commithash)

            # repo.commit().gpgsig
            # repo.commit().author.name
            # repo.commit().author.email
            # f'pushd {repo.working_dir}; git verify-commit {commithash}; popd'
            # (.venv) ubuntu@ip-172-31-49-92:~/src/AIRiskDatabase/tmp$ git verify-commit 72686211e2a8b78e5a5dc8c28be34eb9cfcdad4c
            # gpg: Signature made Fri Nov 25 17:11:39 2022 UTC
            # gpg:                using RSA key 4AEE18F83AFDEB23
            # gpg: Can't check signature: No public key
            # (.venv) ubuntu@ip-172-31-49-92:~/src/AIRiskDatabase/tmp$ echo $?
            # 1

            # crawl the files in this directory and yield the path for processing
            for fname in list_files_in_commit(repo.commit()):
                yield (tmpdirname, fname)


def list_files_in_commit(
    commit: git.objects.commit.Commit,
) -> Generator[str, None, None]:
    """
    Lists all the files in a repo at a given commit

    :param commit: A gitpython Commit object
    """
    stack = [commit.tree]
    while len(stack) > 0:
        tree = stack.pop()
        # enumerate blobs (files) at this level
        for b in tree.blobs:
            yield str(b.path)
        for subtree in tree.trees:
            stack.append(subtree)
