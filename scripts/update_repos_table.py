"""Main script to crawl and update the repo table."""
import argparse
import concurrent.futures
import json
from datetime import datetime
from functools import partial
from typing import Any, Dict, Generator, Set

from huggingface_hub.utils import HfHubHTTPError, RepositoryNotFoundError

from airdb.repos import RepoScanner
from airdb.storage.mysql import AirDBBase, MySQLDB

# global variables
DBNAME = "airdb"
TABLE_NAME = "repos"


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--jobs",
        type=int,
        default=1,
        help="Number of jobs to run in parallel",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        default=False,
        help="Force update of all repos, even if already in the database.",
    )
    parser.add_argument(
        "--force-older-than-days",
        type=int,
        default=None,
        help="""Force update of all repos that have not been updated
        in the last force-older-than-days `days`.""",
    )
    parser.add_argument(
        "--purl-file",
        type=str,
        default=None,
        help="""File containing list of purls (one per line) to process. If not
        specified, all purls will be processed.""",
    )

    args = parser.parse_args()
    return args


def process_purl(
    purl: str,
    dbase: AirDBBase,
    repo: RepoScanner,
    verbose: bool = True,
) -> None:
    """Process a purl."""
    if verbose:
        print(purl)

    entry: Dict[str, Any] = {}

    if "@" not in purl:
        basepurl = purl
    else:
        basepurl = purl.split("@")[0]

    # does the repo already exist?
    versions = {}  # {version: visited}
    if dbase.exists(basepurl):
        try:
            entry = dbase.get(basepurl)
            versions = entry.get("versions", {})
        except json.decoder.JSONDecodeError:
            print(f"corrupted entry for {purl}")

    # get basic repo info
    try:
        info = repo.get_repo_info(purl)
    except (RepositoryNotFoundError, HfHubHTTPError):
        print(f"can't find repo {purl}")
        return  # do nothing, try again later?
    entry.update(info)
    versions.update(
        entry.get("versions", {})
    )  # merge data from all the versions we've seen

    now = datetime.now().isoformat()
    entry.update({"basepurl": basepurl, "versions": versions, "created": now})

    # store the sbom in the database
    dbase.set(basepurl, entry)


def purls_from_file(filename: str, to_skip: Set[str]) -> Generator[str, None, None]:
    """Generator for purls from a file."""
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            purl = line.strip()
            if purl in to_skip:
                continue
            yield purl


def repo_generator(to_skip):
    _repo = RepoScanner()
    for purl in _repo.repo_iter(to_skip):
        yield purl


def main() -> None:
    """Main."""
    args = get_args()

    # set up storage
    remote_db = MySQLDB(TABLE_NAME, DBNAME)

    to_skip: Set[str] = set()
    if args.force_older_than_days:
        now = datetime.now()
        for purl in remote_db.keys():
            entry = remote_db.get(purl)
            visited = entry.get("created", None)
            if isinstance(visited, str):
                visited = datetime.fromisoformat(visited)
            if not isinstance(visited, datetime):
                continue
            if (now - visited).days < args.force_older_than_days:
                to_skip.add(purl.split("@")[0])
    elif not args.force:
        for purl in remote_db.keys():
            to_skip.add(purl.split("@")[0])

    # set up repo scanner
    repo = RepoScanner()

    # funtion to handle a purl
    handle = partial(process_purl, dbase=remote_db, repo=repo)

    # repo generator
    repo_generator_func: Generator[str, None, None]
    if args.purl_file:
        repo_generator_func = purls_from_file(args.purl_file, to_skip)

    else:
        repo_generator_func = repo_generator(to_skip)

    if args.jobs > 1:
        print(f"Starting {args.jobs} jobs...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as executor:
            for _ in executor.map(handle, repo_generator_func):
                pass

    else:
        # iterate through all purls in the database
        for purl in repo_generator_func:
            handle(purl)


if __name__ == "__main__":
    main()
