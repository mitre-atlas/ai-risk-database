"""Top Users API route."""
import json

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import HTTP_OK, REPORTS_NAME, USERS_NAME, check_auth


# @ROUTES.get("/api/top_users")
async def top_users(request: web.Request) -> web.Response:
    """Return a summary of the "top" users.

    GET /api/top_users -H "Authorization: Bearer XXXXXX"

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
        f"""SELECT """
        f"""{REPORTS_NAME}.user_id, {USERS_NAME}.login, """
        f"""COUNT(*) as num_reports, """
        f"""(report_upvotes_received - report_downvotes_received) as score """
        f"""FROM {REPORTS_NAME} """
        f"""LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id """
        f"""GROUP BY {REPORTS_NAME}.user_id """
        """ORDER BY """
        """num_reports DESC, """
        """score DESC """
        """LIMIT 10"""
    )

    top_users_list = []
    results = await reports_db.custom_query(query)
    for _r in results:
        _d = {"user_id": _r[0], "login": _r[1], "count": _r[2], "score": _r[3]}
        top_users_list.append(sanitize_json_output(_d))

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": top_users_list,
        },
    )

    return web.Response(
        status=HTTP_OK, text=json.dumps(top_users_list), content_type="application/json"
    )
