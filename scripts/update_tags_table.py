"""Main script to crawl and update the TAGS table."""
import argparse
import datetime
from collections import Counter, defaultdict

import tqdm

from airdb.storage.mysql import MySQLDB

# global variables
DBNAME = "airdb"
REPO_NAME = "repos"
TAGS_NAME = "tags"


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    return args


def main() -> None:
    """Main."""
    args = get_args()

    # set up storage
    repo_db = MySQLDB(REPO_NAME, DBNAME)
    tags_db = MySQLDB(TAGS_NAME, DBNAME)

    # iterate through all the Huggingface purls in the SBOM database
    tag_associations = defaultdict(Counter)
    purls_with_tag = defaultdict(list)
    for purl in tqdm.tqdm(
        repo_db.keys(pattern="pkg:huggingface*"), desc="analyzing..."
    ):
        # get the SBOM
        info = repo_db.get(purl)
        if "repo_info" in info:
            if "tags" in info["repo_info"]:
                tags = set(info["repo_info"]["tags"])
                for tag in tags:
                    tag_associations[tag].update(tags.difference([tag]))
                    purls_with_tag[tag].append(purl)

    # save the tag associations
    now = datetime.datetime.now().isoformat()
    for tag, associations in tqdm.tqdm(tag_associations.items(), desc="writing..."):
        item = {
            "tag": tag,
            "associations": associations,
            "purls": purls_with_tag[tag],
            "created": now,
            "updated": now,
        }
        tags_db.upsert(tag, item)


if __name__ == "__main__":
    main()
