"""Top Orgs API route."""
import json

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import HTTP_OK, REPORTS_NAME, USERS_NAME, check_auth


# @ROUTES.get("/api/top_orgs")
async def top_orgs(request: web.Request) -> web.Response:
    """Return a summary of the "top" orgs.

    GET /api/top_orgs -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json [list of objects]
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
            text=json.dumps({"query": dict(request.rel_url.query), "error": message}),
        )

    # for now, we'll return the top reports in each category
    reports_db = request.app["reports_db"]

    query = (
        """SELECT summary.* FROM ("""
        f""" SELECT """
        f""" COUNT(*) as num_reports, """
        f""" (report_upvotes_received - report_downvotes_received) as score, """
        f""" {USERS_NAME}.company """
        f""" FROM {REPORTS_NAME} """
        f""" LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id """
        f""" GROUP BY {USERS_NAME}.company """
        """) as summary """
        """WHERE summary.company <> '' """
        """ORDER BY num_reports DESC, score DESC """
        """LIMIT 10"""
    )

    top_orgs_list = []
    results = await reports_db.custom_query(query)
    for _r in results:
        _d = {"count": _r[0], "score": _r[1], "company": _r[2]}
        top_orgs_list.append(sanitize_json_output(_d))

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": top_orgs_list,
        },
    )

    return web.Response(
        status=HTTP_OK, text=json.dumps(top_orgs_list), content_type="application/json"
    )
