"""Main script to crawl and update the filescanning table."""
import argparse
import datetime
from collections import Counter, defaultdict

import tqdm

from airdb.storage.mysql import MySQLDB

# global variables
DBNAME = "airdb"
SBOM_NAME = "sbom"
FILESCAN_NAME = "filescans"
FILENAMES_NAME = "filenames"
COMMON_THRESHOLD = 1000


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    return args


def main() -> None:
    """Main."""
    args = get_args()

    # set up storage
    sbom_db = MySQLDB(SBOM_NAME, DBNAME)
    filescan_db = MySQLDB(FILESCAN_NAME, DBNAME)
    filenames_db = MySQLDB(FILENAMES_NAME, DBNAME)

    # iterate through all the Huggingface purls in the SBOM database
    purls_with_fileinfo = defaultdict(list)
    artifact_count = Counter()
    common_artifacts = set()

    filenames_with_artifacts = defaultdict(list)
    filenames_with_sha256 = defaultdict(list)
    filenames_with_purls = defaultdict(list)
    filenames_count = Counter()

    filenames_with_artifacts = defaultdict(list)
    filenames_with_sha256 = defaultdict(list)
    filenames_with_purls = defaultdict(list)
    filenames_count = Counter()

    for purl in tqdm.tqdm(sbom_db.keys(), desc="analyzing..."):
        # get the SBOM
        sbom = sbom_db.get(purl)
        if "files" in sbom:
            for fileinfo in sbom["files"] or []:
                filename = fileinfo["filename"]
                filenames_count[filename] += 1

                if "sha256" not in fileinfo:
                    print(f"no sha256 for {filename} in {purl}")

                if (
                    len(filenames_with_sha256[filename]) < COMMON_THRESHOLD
                    and "sha256" in fileinfo
                ):
                    filenames_with_sha256[filename].append(fileinfo["sha256"])

                if len(filenames_with_purls[filename]) < COMMON_THRESHOLD:
                    filenames_with_purls[filename].append(purl)

                # pytorch, numpy, pickle, etc.
                if "module_info" in fileinfo:
                    for lib, importlist in fileinfo["module_info"].items():
                        for imp in importlist:
                            name = lib + "." + imp
                            if name not in common_artifacts:
                                purls_with_fileinfo[name].append(purl)
                            artifact_count.update([name])
                            if artifact_count[name] > COMMON_THRESHOLD:
                                common_artifacts.add(name)

                            filenames_with_artifacts[filename].append(name)
                # yaml
                if "tags" in fileinfo:
                    # "!new:speechbrain.lobes.models.huggingface_wav2vec.HuggingFaceWav2Vec2"
                    for name in fileinfo["tags"]:
                        # skip "ref" tags that are too common
                        if name not in common_artifacts:
                            purls_with_fileinfo[name].append(purl)
                        artifact_count.update([name])
                        if artifact_count[name] > COMMON_THRESHOLD:
                            common_artifacts.add(name)

                        filenames_with_artifacts[filename].append(name)

    # save the tag associations and counts
    now = datetime.datetime.now().isoformat()
    for tag, purls in tqdm.tqdm(purls_with_fileinfo.items(), desc="writing..."):
        item = {
            "name": tag,
            "count": artifact_count[tag],
            "created": now,
            "updated": now,
            "purls": purls,
        }
        filescan_db.upsert(tag, item)

    # save the file associations
    now = datetime.datetime.now().isoformat()
    for filename, count in tqdm.tqdm(filenames_count.items(), desc="writing..."):
        item = {
            "filename": filename,
            "created": now,
            "updated": now,
            "count": count,
            "artifacts": filenames_with_artifacts[filename],
            "purls": filenames_with_purls[filename],
            "sha256s": filenames_with_sha256[filename],
        }
        filenames_db.upsert(filename, item)


if __name__ == "__main__":
    main()
