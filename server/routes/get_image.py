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


# @ROUTES.get("/api/get_image")
async def get_image(request: web.Request) -> web.Response:
    """Get an image using an image_id.

    GET /api/get_image?id=xxxxxxxx -H "Authorization: Bearer XXXXXX"

    Returns (status, text):
        200, json {"image_id": "xxxxx", "b64image": "xxxxx", "user_id": "xxxxx", "created": "xxxxx", "encoding": "xxxxx"}
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

    image_id = urllib.parse.unquote(request.rel_url.query.get("id"))

    # does the report exist in the user_reports table?
    images_db = request.app["images_db"]
    if not await images_db.exists(image_id):
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

    info = await images_db.get(image_id)

    response = sanitize_json_output(info)

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            # "response": response, # don't log a giant image
        },
    )

    return web.Response(
        status=HTTP_OK,
        text=json.dumps(response),
        content_type="application/json",
    )
