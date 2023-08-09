"""Main script to crawl and update the SBOM table."""
import argparse
import multiprocessing
from functools import partial
from typing import Generator, Set

from airdb.repos import RepoScanner
from airdb.sbom.file_handler import FileHandler, process_purl
from airdb.storage.mysql import MySQLDB

# global variables
DBNAME = "airdb"

SBOM_NAME = "sbom"
REPOS_NAME = "repos"

CONTAINER_NAME = "airdb-filescan"


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
        "--purl-file",
        type=str,
        default=None,
        help="""File containing list of purls (one per line) to process. If not
        specified, all purls will be processed.""",
    )
    parser.add_argument(
        "--from-repos-table",
        action="store_true",
        default=False,
        help="""Iterate through repo db and process all purls.""",
    )

    args = parser.parse_args()
    if args.purl_file and args.from_repos_table:
        raise ValueError("Cannot specify both --purl-file and --from-repos-table.")
    return args


def purls_from_file(filename: str, to_skip: Set[str]) -> Generator[str, None, None]:
    """Generator for purls from a file."""
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            purl = line.strip()
            if purl in to_skip:
                continue
            yield purl


def purls_from_repo(to_skip: Set[str]) -> Generator[str, None, None]:
    """Generator for purls from a repo."""
    repos_db = MySQLDB(REPOS_NAME, DBNAME)

    for repostr in repos_db.keys():
        for version in repos_db.get(repostr).get("versions", {}):
            purl = f"{repostr}@{version}"
            if purl in to_skip:
                continue
            yield purl


def main() -> None:
    """Main."""
    args = get_args()

    # set up storage
    remote_db = MySQLDB(SBOM_NAME, DBNAME)

    to_skip = set()
    if not args.force:
        to_skip = set([purl for purl in remote_db.keys()])

    # set up file handler
    handler = FileHandler()

    # set up repo scanner
    repo = RepoScanner()

    # function to handle a purl
    handle = partial(process_purl, repo=repo, handler=handler)

    # repo generator
    repo_generator: Generator[str, None, None]
    if args.purl_file:
        repo_generator = purls_from_file(args.purl_file, to_skip)

    elif args.from_repos_table:
        repo_generator = purls_from_repo(to_skip)

    else:
        repo_generator = repo.repo_iter(to_skip)

    if args.jobs > 1:
        print(f"Starting {args.jobs} jobs...")
        pool = multiprocessing.Pool(args.jobs)
        for entry in pool.imap_unordered(handle, repo_generator):
            purl = entry["purl"]
            print(purl)
            remote_db.set(purl, entry)

    else:
        for purl in repo_generator:
            entry = handle(purl)
            print(purl)
            remote_db.set(purl, entry)


if __name__ == "__main__":
    main()
