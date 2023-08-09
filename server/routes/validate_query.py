"""Validate a query."""
import json
import urllib.parse

from aiohttp import web

from server.routes.utils.common import (
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_OK,
    check_auth,
    resolve_purl_async,
)


# @ROUTES.get("/api/validate_query")
async def validate_query(request: web.Request) -> web.Response:
    """Check to see if query will produce a result.

    GET /api/validate_query?q=<url|purl|repo> -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json {"purl": <purl|basepurl>}
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

    # can this query be resolved to a purl
    purl = await resolve_purl_async(query, request.app)

    if purl is None:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "Not found",
            },
        )
        return web.Response(
            status=HTTP_NOT_FOUND,
            text=json.dumps(
                {"query": dict(request.rel_url.query), "error": "Not found"}
            ),
        )

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": {"purl": purl},
        },
    )
    return web.Response(
        status=HTTP_OK, text=json.dumps({"purl": purl}), content_type="application/json"
    )
