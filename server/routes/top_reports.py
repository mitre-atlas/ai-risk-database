"""Return a summary of the "top" reports."""
import json

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import HTTP_OK, REPORTS_NAME, USERS_NAME, check_auth


# @ROUTES.get("/api/top_reports")
async def top_reports(request: web.Request) -> web.Response:
    """Return a summary of the "top" reports.

    GET /api/top_reports -H "Authorization: Bearer XXXXXX"

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
            text=json.dumps({"error": message}),
        )

    # someday we'll have a table
    # for now, we'll return the top reports in each category
    reports_db = request.app["reports_db"]

    # construct a query to list reports from REPORTS_DB table, sorted by
    # multiple fields:
    # 1. length of the vulnerabilities array
    # 2. length of the upvoted array
    # 3. negative length of the downvoted array
    top_reports_list = []
    for domain in ["ethics", "security", "performance"]:
        query = (
            f"""SELECT """
            f"""   report_id, {REPORTS_NAME}.user_id, {REPORTS_NAME}.updated, title, """
            f"""   JSON_LENGTH(purls), {USERS_NAME}.login """
            f"""FROM {REPORTS_NAME} """
            f"""LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id """
            f"""WHERE domain = '{domain}' """
            """ORDER BY """
            """   LENGTH(vulnerabilities) DESC, """
            """   LENGTH(upvoted) DESC, """
            """   LENGTH(downvoted) ASC, """
            """   LENGTH(purls) DESC, """
            """   updated DESC """
            """LIMIT 2"""
        )
        results = await reports_db.custom_query(query)
        for _r in results:
            _d = {
                "report_id": _r[0],
                "user_id": _r[1],
                "updated": _r[2],
                "title": _r[3],
                "affects": _r[4],
                "login": _r[5],
                "domain": domain,
            }
            top_reports_list.append(sanitize_json_output(_d))

    top_reports_list = sanitize_json_output(top_reports_list)
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": top_reports_list,
        },
    )

    return web.Response(
        status=HTTP_OK,
        text=json.dumps(top_reports_list),
        content_type="application/json",
    )
