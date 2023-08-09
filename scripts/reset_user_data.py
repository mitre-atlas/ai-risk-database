"""Script to purge the databases, except for certain users."""
import argparse
import json

from airdb.storage.mysql import MySQLDB

# global variables
DBNAME = "airdb"
SBOM_NAME = "sbom"
SCANS_TABLE = "scans"
REPORTS_TABLE = "user_reports"
USERS_TABLE = "users"


def get_args() -> argparse.Namespace:
    """Get command line arguments."""
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--keep",
        type=str,
        default="robustintelligence",
        help="Comma-separated list of users whose information should not be reset.",
    )

    parser.add_argument(
        "--only", type=str, default=None, help="Only reset data for this user."
    )

    args = parser.parse_args()
    return args


def main() -> None:
    """Main."""
    _args = get_args()

    # connect to tables
    scans_db = MySQLDB(SCANS_TABLE, DBNAME)
    reports_db = MySQLDB(REPORTS_TABLE, DBNAME)
    users_db = MySQLDB(USERS_TABLE, DBNAME)

    # lookup login from userid
    all_user_ids = list(users_db.keys())
    user_lookup = dict()
    for user_id in all_user_ids:
        user_info = users_db.get(user_id)
        user_lookup[user_info["login"]] = user_id

    if _args.only is None:
        # let's first create the rime user if it doesn't exist
        to_keep = _args.keep.split(",")
        to_delete = set(user_lookup.keys()) - set(to_keep)
    else:
        if users_db.exists(user_lookup[_args.only]):
            to_delete = [_args.only]
        else:
            raise ValueError(f"User {_args.only} does not exist in the database.")

    print("By continuing, you will reset data for the following users:")
    for user in to_delete:
        print(f"\t{user}")

    cont = input("Continue? [y/N] ")

    if cont.lower() == "y":
        for user in to_delete:
            print(f"Resetting data for {user} ({user_lookup[user]})...")
            # delete reports submitted by this user
            user_id = user_lookup[user]
            reports_db.custom_query(
                f"DELETE FROM {REPORTS_TABLE} WHERE user_id = '{user_id}'"
            )

            user_info = users_db.get(user_id)
            upvoted_reports = user_info["upvoted_reports"]
            downvoted_reports = user_info["downvoted_reports"]

            # remove upvotes by this user
            for report_id in upvoted_reports:
                report = reports_db.get(report_id)
                upvoted = dict(report.get("upvoted", []))
                if user_id in upvoted:
                    del upvoted[user_id]
                    report["upvoted"] = list(upvoted.items())
                    reports_db.set(report_id, report)

            # remove downvotes by this user
            for report_id in downvoted_reports:
                report = reports_db.get(report_id)
                downvoted = dict(report.get("downvoted", []))
                if user_id in downvoted:
                    del downvoted[user_id]
                    report["downvoted"] = list(downvoted.items())
                    reports_db.set(report_id, report)

            # reset upvoted/downvoted for this user
            user_info["upvoted_reports"] = []
            user_info["downvoted_reports"] = []

            users_db.set(user_id, user_info)

    # search for all user_reports for which a user no longer exists, and purge them
    reports_db.custom_query(
        """DELETE FROM user_reports
        WHERE user_id NOT IN (SELECT user_id FROM users)"""
    )

    # search model_info for reports (a json object list of strings) for which
    valid_report_ids = set(reports_db.keys())

    # in the model_info table, remove any report_ids that are not in the valid_report_ids list
    results = reports_db.custom_query(
        """SELECT purl, reports FROM model_info
        WHERE JSON_LENGTH(reports) > 0"""
    )
    for purl, reports in results:
        reports = json.loads(reports)
        new_reports = list(valid_report_ids.intersection(set(reports)))
        reports_db.custom_query(
            f"""UPDATE model_info
            SET reports = '{json.dumps(new_reports)}'
            WHERE purl = '{purl}'"""
        )


if __name__ == "__main__":
    main()
