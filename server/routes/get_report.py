"""Get report API Route."""
import json
import urllib.parse

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import (
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_OK,
    check_auth,
)


# @ROUTES.get("/api/get_report")
async def get_report(request: web.Request) -> web.Response:
    """Get a report using a report_id.

    GET /api/get_report?id=xxxxxxxx -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json {report_json}
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
    if "id" not in request.rel_url.query:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "missing ?id= in query",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
            content_type="application/json",
        )

    report_id = urllib.parse.unquote(request.rel_url.query.get("id"))

    # does the report exist in the user_reports table?
    reports_db = request.app["reports_db"]
    if not await reports_db.exists(report_id):
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "report does not exist",
            },
        )

        return web.Response(
            status=HTTP_NOT_FOUND,
            text=json.dumps({"error": "Not found"}),
            content_type="application/json",
        )

    report = await reports_db.get(report_id)

    # get user info from user table
    user_id = report["user_id"]
    users_db = request.app["users_db"]
    if await users_db.exists(user_id):
        user = await users_db.get(user_id)
    else:
        user = {}

    # get version info from the purls
    purls = report.get("purls", [])
    repos_db = request.app["repos_db"]
    version_dates = {}
    for purl in purls:
        # grab from model_info
        baserepo, version = purl.split("@")
        info = await repos_db.get(baserepo)
        version_dates[version] = info["versions"].get(version, None)

    response = sanitize_json_output(
        {
            "report": report,
            "user": user,
            "versions": version_dates,
        }
    )

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "response": response,
        },
    )

    return web.Response(
        status=HTTP_OK,
        text=json.dumps(response),
        content_type="application/json",
    )
