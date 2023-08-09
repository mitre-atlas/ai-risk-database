"""Main script to crawl and update the SHA256 table."""
import argparse
import datetime
from textwrap import dedent

import tqdm

from airdb.storage.mysql import MySQLDB

# global variables
DBNAME = "airdb"
SCANS_TABLE = "scans"
REPOS_TABLE = "repos"
REPORTS_TABLE = "user_reports"
MODEL_INFO_TABLE = "model_info"


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repos-from-scratch",
        action="store_true",
        help="skip transfer from repos, which can take a long time",
    )
    parser.add_argument(
        "--reports-from-scratch",
        action="store_true",
        help="only refresh from the reports table",
    )
    parser.add_argument(
        "--update-reports",
        action="store_true",
        help="update the reports table",
    )
    args = parser.parse_args()
    return args


def create_base_model_info(purl: str, repos_db: MySQLDB) -> dict:
    """Create a base model_info dict."""
    if "@" in purl:
        basepurl, commithash = purl.split("@")
    else:
        basepurl = purl
        commithash = None
    name = basepurl.split("/")[-1]
    owner = (
        basepurl.removesuffix(name)
        .removesuffix("/")
        .removeprefix("pkg:huggingface")
        .removeprefix("pkg:github")
        .removeprefix("/")
    )

    # query the repos_db and parse additional info about this
    repo_data = repos_db.get(basepurl)
    repo_uri = repo_data.get("uri", "")
    versions = repo_data.get("versions", {})
    commitdate = versions.get(commithash, None)
    if repo_uri.startswith(("https://huggingface.co/", "https://github.com")):
        commit_uri = f"{repo_uri}/commit/{commithash}"
    else:
        commit_uri = None

    # populate the table
    model_info = {
        "purl": purl,
        "basepurl": basepurl,
        "name": name,
        "owner": owner,
        "commithash": commithash,
        "commitdate": commitdate,
        "repo_uri": repo_uri,
        "commit_uri": commit_uri,
        "reports": [],
        "scans": [],
        "vulnerabilities": [],
        "security_total": 0,
        "security_pass": 0,
        "security_fail": 0,
        "security_warning": 0,
        "security_severe": 0,
        "ethics_total": 0,
        "ethics_pass": 0,
        "ethics_fail": 0,
        "ethics_warning": 0,
        "ethics_severe": 0,
        "performance_total": 0,
        "performance_pass": 0,
        "performance_fail": 0,
        "performance_warning": 0,
        "performance_severe": 0,
        "overall_total": 0,
        "overall_pass": 0,
        "overall_fail": 0,
        "overall_warning": 0,
        "overall_severe": 0,
        "updated": datetime.datetime.now().isoformat(),
    }
    return model_info


def main() -> None:
    """Main."""
    _args = get_args()

    # connect to tables
    scans_db = MySQLDB(SCANS_TABLE, DBNAME)
    reports_db = MySQLDB(REPORTS_TABLE, DBNAME)
    model_info_db = MySQLDB(MODEL_INFO_TABLE, DBNAME)
    repos_db = MySQLDB(REPOS_TABLE, DBNAME)

    if _args.repos_from_scratch:
        # create a model_id for every model in the repos_db
        for basepurl in tqdm.tqdm(repos_db.keys(), desc="analyzing repos..."):
            data = repos_db.get(basepurl)
            for commithash in data.get("versions", {}).keys():
                purl = f"{basepurl}@{commithash}"
                # iterate through the versions
                model_info = create_base_model_info(purl, repos_db)
                model_info_db.set(purl, model_info)
    else:
        # only get basepurls from repos_db that don't already exist in model_info_db table
        results = model_info_db.custom_query(
            dedent(
                f"""SELECT basepurl FROM {REPOS_TABLE}
            WHERE basepurl NOT IN (SELECT basepurl FROM {MODEL_INFO_TABLE})"""
            ).strip("\n")
        )
        for result in tqdm.tqdm(results, desc="analyzing repos..."):
            basepurl = result[0]
            data = repos_db.get(basepurl)
            for commithash in data.get("versions", {}).keys():
                purl = f"{basepurl}@{commithash}"
                # iterate through the versions
                model_info = create_base_model_info(purl, repos_db)
                model_info_db.set(purl, model_info)

    if _args.reports_from_scratch:
        # clear scans, reports,  and {security,ethics,performance,overall}_{total,pass,fail,warning,severe}
        model_info_db.custom_query(
            dedent(
                f"""UPDATE {MODEL_INFO_TABLE} 
            SET scans = '[]', reports = '[]',
            security_total = 0, security_pass = 0, security_fail = 0, security_warning = 0, security_severe = 0,
            ethics_total = 0, ethics_pass = 0, ethics_fail = 0, ethics_warning = 0, ethics_severe = 0,
            performance_total = 0, performance_pass = 0, performance_fail = 0, performance_warning = 0, performance_severe = 0,
            overall_total = 0, overall_pass = 0, overall_fail = 0, overall_warning = 0, overall_severe = 0"""
            ).strip("\n")
        )

    if _args.update_reports:
        # iterate through all the purls in reports database
        for report_id in tqdm.tqdm(reports_db.keys(), desc="analyzing reports..."):
            data = reports_db.get(report_id)
            purls = data.get("purls", []) or []  # handle data['purls'] == None
            for purl in purls:
                # does this record already exist?
                if not model_info_db.exists(purl):
                    model_info = create_base_model_info(purl, repos_db)
                    model_info["reports"]: [report_id]
                    model_info_db.set(purl, model_info)
                else:
                    # use server side JSON_ARRAY_APPEND to append the report_id
                    model_info_db.custom_query(
                        f"""UPDATE {MODEL_INFO_TABLE} SET reports = ("""
                        f"""JSON_ARRAY_APPEND(reports, '$', '{report_id}')"""
                        f""") WHERE purl = '{purl}'"""
                    )

        for scan_id in tqdm.tqdm(scans_db.keys(), desc="analyzing scans..."):
            data = scans_db.get(scan_id)
            purl = data["purl"]
            if not model_info_db.exists(purl):
                model_info = create_base_model_info(purl, repos_db)
                model_info["scans"]: [scan_id]
                model_info_db.set(purl, model_info)
            else:
                # use server side JSON_ARRAY_APPEND to append the report_id
                model_info_db.custom_query(
                    f"""UPDATE {MODEL_INFO_TABLE} SET scans = ("""
                    f"""JSON_ARRAY_APPEND(scans, '$', '{scan_id}')"""
                    f""") WHERE purl = '{purl}'"""
                )
                # increment integer values for total and pass for each category
                for category in [
                    "security",
                    "ethics",
                    "performance",
                    "overall",
                ]:
                    for part in ["total", "pass", "fail", "warning", "severe"]:
                        reference_key = f"{category}_{part}"
                        model_info_db.custom_query(
                            f"""UPDATE {MODEL_INFO_TABLE} """
                            f"""SET {reference_key} = {reference_key} + {data[reference_key]} """
                            f"""WHERE purl = '{purl}'"""
                        )


if __name__ == "__main__":
    main()
