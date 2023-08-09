"""Query the database for a specific file (by sha256)."""
import json
import urllib.parse
from typing import Any, Dict

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import (
    ARTIFACT_RARE_COUNT,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_OK,
    check_auth,
)
from server.routes.utils.formatting import sizeof_fmt_human


# @ROUTES.get("/api/file_info")
async def file_info(request: web.Request) -> web.Response:
    """Query the database for a specific file (by sha256)

    GET /api/file_info?sha256=<sha256> -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json [file data]
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
    if "sha256" not in request.rel_url.query:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "no sha256 in query",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps(
                {"error": "Bad input"},
                content_type="application/json",
            ),
        )

    sha256 = urllib.parse.unquote(request.rel_url.query.get("sha256"))

    sha256_db = request.app["sha256_db"]
    if not await sha256_db.exists(sha256):
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "sha256 not found",
            },
        )

        return web.Response(
            status=HTTP_NOT_FOUND,
            text=json.dumps(
                {"error": "Not found"},
            ),
            content_type="application/json",
        )

    sha256_info: Dict[str, Any] = await sha256_db.get(sha256)
    sha256_info["size"] = sizeof_fmt_human(
        sha256_info["size"]
    )  # convert to human readable string
    # which artifacts are rare?
    filescans_db = request.app["filescans_db"]
    artifact_info = []
    for artifact in sha256_info.get("artifacts", []) or []:
        if await filescans_db.exists(artifact):
            info = await filescans_db.get(artifact)
            if info["count"] < ARTIFACT_RARE_COUNT:
                artifact_info.append({"name": artifact, "rare": True})
            else:
                artifact_info.append({"name": artifact})
    sha256_info["artifacts"] = artifact_info

    sha256_info = sanitize_json_output(sha256_info)

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": sha256_info,
        },
    )

    return web.Response(
        status=HTTP_OK, text=json.dumps(sha256_info), content_type="application/json"
    )
