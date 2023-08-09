"""Top Models API route."""
import json
from textwrap import dedent

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import (
    HTTP_OK,
    MODEL_INFO_NAME,
    REPOS_NAME,
    check_auth,
    test_summaries_to_rank,
    test_summaries_to_status,
)


# @ROUTES.get("/api/top_models")
async def top_models(request: web.Request) -> web.Response:
    """Return a summary of the "top" reports.

    GET /api/top_models -H "Authorization: Bearer XXXXXX"

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
    model_info_db = request.app["model_info_db"]

    # construct a query to list reports from REPORTS_DB table, sorted by
    # multiple fields:
    # 0. have the most downloads
    # 1. length of the vulnerabilities array
    # 2. length of the upvoted array
    # 3. negative length of the downvoted array
    query = dedent(
        f"""
        SELECT mi.purl, mi.name, mi.owner, mi.commitdate, 
            JSON_LENGTH(mi.reports), JSON_LENGTH(mi.scans), JSON_LENGTH(mi.vulnerabilities), 
            mi.security_total, mi.security_pass, mi.security_fail, mi.security_warning, mi.security_severe, 
            mi.ethics_total, mi.ethics_pass, mi.ethics_fail, mi.ethics_warning, mi.ethics_severe, 
            mi.performance_total, mi.performance_pass, mi.performance_fail, mi.performance_warning, mi.performance_severe, 
            mi.overall_total, mi.overall_pass, mi.overall_fail, mi.overall_warning, mi.overall_severe, 
            JSON_EXTRACT(r.reputation, '$.downloads') AS downloads 
        FROM {MODEL_INFO_NAME} mi 
        JOIN {REPOS_NAME} r ON mi.basepurl = r.basepurl 
        WHERE mi.overall_total > 0 OR JSON_LENGTH(mi.reports) > 0 
        ORDER BY 
            downloads DESC, 
            JSON_LENGTH(mi.vulnerabilities) ASC, 
            JSON_LENGTH(mi.reports) ASC, 
            mi.overall_pass DESC, 
            mi.overall_total ASC, 
            mi.updated DESC 
        LIMIT 10
        """
    ).strip()
    results = await model_info_db.custom_query(query)
    top_model_list = []
    for _r in results:
        _d = {
            "purl": _r[0],
            "name": _r[1],
            "owner": _r[2],
            "date": _r[3],
            "reports": _r[4],
            "scans": _r[5],
            "vulnerabilities": _r[6],
            "security": {
                "total": _r[7],  # TODO: remove after transition to new scoring
                "pass": _r[8],  # TODO: remove after transition to new scoring
                "status": test_summaries_to_status(_r[7], _r[8], _r[9], _r[10], _r[11]),
                "rank": await test_summaries_to_rank(
                    _r[7],
                    _r[8],
                    _r[9],
                    _r[10],
                    _r[11],
                    category="security",
                    db=model_info_db,
                ),
            },
            "ethics": {
                "total": _r[12],  # TODO: remove after transition to new scoring
                "pass": _r[13],  # TODO: remove after transition to new scoring
                "status": test_summaries_to_status(
                    _r[12], _r[13], _r[14], _r[15], _r[16]
                ),
                "rank": await test_summaries_to_rank(
                    _r[12],
                    _r[13],
                    _r[14],
                    _r[15],
                    _r[16],
                    category="ethics",
                    db=model_info_db,
                ),
            },
            "performance": {
                "total": _r[17],  # TODO: remove after transition to new scoring
                "pass": _r[18],  # TODO: remove after transition to new scoring
                "status": test_summaries_to_status(
                    _r[17], _r[18], _r[19], _r[20], _r[21]
                ),
                "rank": await test_summaries_to_rank(
                    _r[17],
                    _r[18],
                    _r[19],
                    _r[20],
                    _r[21],
                    category="performance",
                    db=model_info_db,
                ),
            },
            "overall": {
                "total": _r[22],  # TODO: remove after transition to new scoring
                "pass": _r[23],  # TODO: remove after transition to new scoring
                "status": test_summaries_to_status(
                    _r[22], _r[23], _r[24], _r[25], _r[26]
                ),
                "rank": await test_summaries_to_rank(
                    _r[22],
                    _r[23],
                    _r[24],
                    _r[25],
                    _r[26],
                    category="overall",
                    db=model_info_db,
                ),
            },
        }
        top_model_list.append(_d)

    top_model_list = sanitize_json_output(top_model_list)
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": top_model_list,
        },
    )

    return web.Response(
        status=HTTP_OK, text=json.dumps(top_model_list), content_type="application/json"
    )
