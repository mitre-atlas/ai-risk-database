"""GET /api/model_info?q=<url|purl|repo> -H "Authorization: Bearer XXXXXX"."""
import json
import urllib.parse
from typing import Tuple

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import (
    ARTIFACT_RARE_COUNT,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_OK,
    NOT_TESTED,
    check_auth,
    resolve_purl_async,
    test_summaries_to_rank,
    test_summaries_to_status,
)
from server.routes.utils.formatting import sizeof_fmt_human


async def get_model_info(query: str, db_lookup: dict) -> Tuple[int, dict]:
    """Get model info for a given query."""
    # is it a url? a purl? a repo?
    repos_db = db_lookup["repos_db"]
    sbom_db = db_lookup["sbom_db"]
    model_info_db = db_lookup["model_info_db"]
    filescans_db = db_lookup["filescans_db"]
    reports_db = db_lookup["reports_db"]
    users_db = db_lookup["users_db"]

    # get purl from query
    purl = await resolve_purl_async(query, db_lookup)

    # if it doesn't exist, return 404
    if purl is None:
        return HTTP_NOT_FOUND, {"error": "Not found"}

    # is there a version number in the query?
    if not "@" in purl:
        # unversioned ... get the latest version
        basepurl = purl
        repo_info = await repos_db.get(basepurl)
        versions = repo_info.get("versions", {})
        if not versions:
            # a clerical problem in the database
            # request.app["request_log"].error(f"no versions for {basepurl}")
            return HTTP_NOT_FOUND, {"error": "Not found"}

        # versions is a dict of {commithash: datetime}
        version = sorted(versions.items(), key=lambda x: x[1], reverse=True,)[
            0
        ][0]
        purl = f"{basepurl}@{version}"
    else:
        basepurl, version = purl.split("@")
        if not await repos_db.exists(basepurl):
            return HTTP_NOT_FOUND, {"error": "Not found"}
        repo_info = await repos_db.get(basepurl)

    # annotate repo_info with commitdate and commithash
    commitdate = repo_info.get("versions", {}).get(version, None)
    repo_info["commitdate"] = commitdate
    repo_info["commithash"] = version

    # patch a problem with huggingface standard that allows List OR str (singleton) for datasets
    if isinstance(repo_info.get('repo_info',{}).get('carddata',{}).get('datasets',[]), str):
        repo_info['repo_info']['carddata']['datasets'] = [repo_info['repo_info']['carddata']['datasets']]

    if isinstance(repo_info.get('repo_info',{}).get('carddata',{}).get('tags',[]), str):
        repo_info['repo_info']['carddata']['tags'] = [repo_info['repo_info']['carddata']['tags']]

    # assemble json to return
    response = {
        "repos": repo_info,
    }

    # get scans, reports and vulnerabilities from the model_info table
    if not await model_info_db.exists(purl):
        # default values
        response["risk_overview"] = {
            "security": {"status": NOT_TESTED, "rank": 0, "total": 0, "pass": 0},
            "ethics": {"status": NOT_TESTED, "rank": 0, "total": 0, "pass": 0},
            "performance": {"status": NOT_TESTED, "rank": 0, "total": 0, "pass": 0},
            "overall": {"status": NOT_TESTED, "rank": 0, "total": 0, "pass": 0},
        }

        response["reports"] = []

        response["model_info"] = {
            "purl": purl,
            "basepurl": basepurl,
            "name": repo_info.get("name", ""),
            "owner": repo_info.get("owner", ""),
            "commithash": repo_info.get("commithash", ""),
            "commitdate": repo_info.get("commitdate", ""),
            "repo_uri": repo_info.get("uri", ""),
            "commit_uri": "",
            "reports": [],
            "scans": [],
            "vulnerabilities": [],
            "updated": "",
        }

    else:
        model_info = await model_info_db.get(purl)

        response["risk_overview"] = {
            "security": {
                "status": test_summaries_to_status(
                    model_info.get("security_total", 0),
                    model_info.get("security_pass", 0),
                    model_info.get("security_fail", 0),
                    model_info.get("security_warning", 0),
                    model_info.get("security_severe", 0),
                ),
                "rank": await test_summaries_to_rank(
                    model_info.get("security_total", 0),
                    model_info.get("security_pass", 0),
                    model_info.get("security_fail", 0),
                    model_info.get("security_warning", 0),
                    model_info.get("security_severe", 0),
                    category="security",
                    db=model_info_db,
                ),
                "total": model_info.get(
                    "security_total", 0
                ),  # TODO: remove after new scoring
                "pass": model_info.get(
                    "security_pass", 0
                ),  # TODO: remove after new scoring
            },
            "ethics": {
                "status": test_summaries_to_status(
                    model_info.get("ethics_total", 0),
                    model_info.get("ethics_pass", 0),
                    model_info.get("ethics_fail", 0),
                    model_info.get("ethics_warning", 0),
                    model_info.get("ethics_severe", 0),
                ),
                "rank": await test_summaries_to_rank(
                    model_info.get("ethics_total", 0),
                    model_info.get("ethics_pass", 0),
                    model_info.get("ethics_fail", 0),
                    model_info.get("ethics_warning", 0),
                    model_info.get("ethics_severe", 0),
                    category="ethics",
                    db=model_info_db,
                ),
                "total": model_info.get(
                    "ethics_total", 0
                ),  # TODO: remove after new scoring
                "pass": model_info.get(
                    "ethics_pass", 0
                ),  # TODO: remove after new scoring
            },
            "performance": {
                "status": test_summaries_to_status(
                    model_info.get("performance_total", 0),
                    model_info.get("performance_pass", 0),
                    model_info.get("performance_fail", 0),
                    model_info.get("performance_warning", 0),
                    model_info.get("performance_severe", 0),
                ),
                "rank": await test_summaries_to_rank(
                    model_info.get("performance_total", 0),
                    model_info.get("performance_pass", 0),
                    model_info.get("performance_fail", 0),
                    model_info.get("performance_warning", 0),
                    model_info.get("performance_severe", 0),
                    category="performance",
                    db=model_info_db,
                ),
                "total": model_info.get(
                    "performance_total", 0
                ),  # TODO: remove after new scoring
                "pass": model_info.get(
                    "performance_pass", 0
                ),  # TODO: remove after new scoring
            },
            "overall": {
                "status": test_summaries_to_status(
                    model_info.get("overall_total", 0),
                    model_info.get("overall_pass", 0),
                    model_info.get("overall_fail", 0),
                    model_info.get("overall_warning", 0),
                    model_info.get("overall_severe", 0),
                ),
                "rank": await test_summaries_to_rank(
                    model_info.get("overall_total", 0),
                    model_info.get("overall_pass", 0),
                    model_info.get("overall_fail", 0),
                    model_info.get("overall_warning", 0),
                    model_info.get("overall_severe", 0),
                    category="overall",
                    db=model_info_db,
                ),
                "total": model_info.get(
                    "overall_total", 0
                ),  # TODO: remove after new scoring
                "pass": model_info.get(
                    "overall_pass", 0
                ),  # TODO: remove after new scoring
            },
        }

        for category in ["security", "ethics", "performance", "overall"]:
            for key in ["total", "fail", "warning", "severe"]:
                del model_info[f"{category}_{key}"]

        response["model_info"] = model_info

        # get report information
        reports = []
        for report_id in model_info.get("reports", []):
            report = await reports_db.get(report_id)
            if not report:  # was the report deleted?
                continue
            report_item = {
                "report_id": report_id,
                "user_id": report["user_id"],
                "title": report["title"],
                "domain": report["domain"],
                "vulnerabilities": report["vulnerabilities"],
                "updated": report["updated"],
                "models_affected": len(report["purls"]),
                "upvotes": len(report["upvoted"]),
                "downvotes": len(report["downvoted"]),
            }
            # from the user_id, get login, avatar_url, name, company
            user_info = await users_db.get(report["user_id"])
            author = {
                "login": user_info.get("login", "None"),
                "avatar_url": user_info.get("avatar_url", "None"),
                "name": user_info.get("name", "None"),
                "company": user_info.get("company", "None"),
            }
            report_item["author_info"] = author
            reports.append(report_item)
        response["reports"] = reports

    if not await sbom_db.exists(purl):
        response["rare_artifacts"] = []
        response["sbom"] = {"files": [], "purl": ""}
    else:
        sbom = await sbom_db.get(purl)
        sbom["rare_artifacts"] = []
        for filedat in sbom.get("files", []):
            filename = filedat.get("filename", "(error parsing file)")
            filedat["size"] = sizeof_fmt_human(
                filedat.get("size", 0)
            )  # convert to human readable string
            artifacts = set()
            if "module_info" in filedat:
                for _k, vlist in filedat["module_info"].items():
                    for _v in vlist:
                        artifacts.add(f"{_k}.{_v}")
            elif "tags" in filedat:
                for _t in filedat["tags"]:
                    artifacts.add(_t)

            rare = []
            for artifact in artifacts:
                if await filescans_db.exists(artifact):
                    info = await filescans_db.get(artifact)
                    if info["count"] < ARTIFACT_RARE_COUNT:
                        rare.append(artifact)

            if rare:
                filedat["rare"] = rare
                sbom["rare_artifacts"].append({"filename": filename, "artifacts": rare})

            if not 'sha256' in filedat:
                # no sha256 hash b/c of error, use the empty string sha256
                filedat['sha256'] = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

        response["sbom"] = sbom

    return HTTP_OK, sanitize_json_output(response)


# @ROUTES.get("/api/model_info")
async def model_info(request: web.Request) -> web.Response:
    """Query the database for the given URL, PURL or repository name.

    GET /api/model_info?q=<url|purl|repo> -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json [model data]
        400, json {"error": bad_input_message}
        401, json {"error": bad_auth_message}
        404, json {"error": not_found_message}
    """
    valid, status, message = check_auth(request)
    if not valid:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": message,
            },
        )
        return web.Response(
            status=status,
            text=json.dumps({"error": message}),
            content_type="application/json",
        )

    # get the query parameter
    if "q" not in request.rel_url.query:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "no ?q= in query",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
        )

    query = urllib.parse.unquote(request.rel_url.query.get("q"))

    status, result_dict = await get_model_info(query, request.app)

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": result_dict,
        },
    )

    return web.Response(
        status=status, text=json.dumps(result_dict), content_type="application/json"
    )
