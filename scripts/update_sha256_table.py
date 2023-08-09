"""Main script to crawl and update the SHA256 table."""
import argparse
import datetime
import json
from collections import Counter, defaultdict

import tqdm

from airdb.storage.mysql import MySQLDB

# it's a simple index of sha256: [purl, purl, ...]
# and may include both sha256 and ordered_sha256

# global variables
DBNAME = "airdb"
SBOM_TABLE = "sbom"
SHA256_TABLE = "sha256"

MAX_PURLS_TO_TRACK = 100


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    return args


def main() -> None:
    """Main."""
    _args = get_args()

    # set up storage
    sbom_db = MySQLDB(SBOM_TABLE, DBNAME)
    sha256_db = MySQLDB(SHA256_TABLE, DBNAME)

    # for purl in tqdm.tqdm(sbom_db.keys(), desc="analyzing..."):
    #     # get the SBOM
    #     try:
    #         sbom = sbom_db.get(purl)
    #     except json.decoder.JSONDecodeError:
    #         print(f"error decoding {purl}")
    #         continue
    #     for fileinfo in sbom.get("files", []) or []: # in case None
    #         for sha256_field, ordered in zip(
    #             ["sha256", "ordered_sha256"], [False, True]
    #         ):
    #             if sha256_field in fileinfo:
    #                 sha256 = fileinfo[sha256_field]

    #                 now = datetime.datetime.now().isoformat()
    #                 # check if this sha256 is already in the database
    #                 if not sha256_db.exists(sha256):
    #                     item = {
    #                         "sha256": sha256,
    #                         "ordered": ordered,
    #                         "size": fileinfo["size"],
    #                         "purls": [purl],
    #                         "artifacts": fileinfo.get("artifacts", []),
    #                         "created": now,
    #                         "updated": now,
    #                     }
    #                     sha256_db.set(sha256, item)
    #                 else:
    #                     item = sha256_db.get(sha256)
    #                     item.update(
    #                         {
    #                             "purls": list(set(item["purls"] + [purl])),
    #                             "updated": now,
    #                         }
    #                     )
    #                     sha256_db.upsert(sha256, item)

    # iterate through all the purls in the SBOM database
    purls_with_sha256 = defaultdict(list)
    names_with_sha256 = defaultdict(Counter)
    ordered = defaultdict(bool)
    artifacts_by_sha256 = defaultdict(list)
    filesize_of_sha256 = {}
    sha256_count = Counter()
    for purl in tqdm.tqdm(sbom_db.keys(), desc="analyzing..."):
        # get the SBOM
        try:
            sbom = sbom_db.get(purl)
        except json.decoder.JSONDecodeError:
            print(f"error decoding {purl}")
            continue

        if "files" in sbom:
            for fileinfo in sbom.get("files", []) or []:  # in case None
                if "sha256" in fileinfo:
                    if len(purls_with_sha256[fileinfo["sha256"]]) < MAX_PURLS_TO_TRACK:
                        purls_with_sha256[fileinfo["sha256"]].append(purl)
                    names_with_sha256[fileinfo["sha256"]][fileinfo["filename"]] += 1
                    filesize_of_sha256[fileinfo["sha256"]] = fileinfo["size"]
                    sha256_count[fileinfo["sha256"]] += 1
                if "ordered_sha256" in fileinfo:
                    ordered[fileinfo["ordered_sha256"]] = True
                    if (
                        len(purls_with_sha256[fileinfo["ordered_sha256"]])
                        < MAX_PURLS_TO_TRACK
                    ):
                        purls_with_sha256[fileinfo["ordered_sha256"]].append(purl)
                    names_with_sha256[fileinfo["ordered_sha256"]][
                        fileinfo["filename"]
                    ] += 1
                    filesize_of_sha256[fileinfo["ordered_sha256"]] = fileinfo["size"]
                    sha256_count[fileinfo["ordered_sha256"]] += 1

                artifacts = set()
                if "module_info" in fileinfo:
                    for _k, vlist in fileinfo["module_info"].items():
                        for _v in vlist:
                            artifacts.add(f"{_k}.{_v}")
                elif "tags" in fileinfo:
                    for _t in fileinfo["tags"]:
                        artifacts.add(_t)

                if artifacts:
                    artifacts_by_sha256[fileinfo["sha256"]] = list(artifacts)

    # save the sha256 associations to the database
    now = datetime.datetime.now().isoformat()
    for sha256, purls in tqdm.tqdm(purls_with_sha256.items(), desc="writing..."):
        item = {
            "sha256": sha256,
            "ordered": ordered[sha256],
            "count": sha256_count[sha256],
            "purls": purls,
            "size": filesize_of_sha256[sha256],
            "filenames": dict(names_with_sha256[sha256].most_common(10)),
            "artifacts": artifacts_by_sha256[sha256],
            "created": now,
            "updated": now,
        }
        sha256_db.upsert(sha256, item)


if __name__ == "__main__":
    main()
