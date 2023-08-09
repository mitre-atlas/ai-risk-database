"""Upload image API route."""
import base64
import datetime
import json
import uuid

from aiohttp import web

from server.routes.utils.common import HTTP_BAD_REQUEST, HTTP_OK, check_auth

MAX_B64IMAGE_SIZE = 2_000_000


def is_base64(data: bytes) -> bool:
    """test if data is base64 encoded"""
    try:
        # Attempt to decode the data as base64
        base64.b64decode(data)
        # If successful, return True
        return True
    except:
        # If there is an error, return False
        return False


# @ROUTES.post("/api/upload_image")
async def upload_image(request: web.Request) -> web.Response:
    """Return a summary of the "top" users.

    POST /api/upload_image -H "Authorization: Bearer XXXXXX"
    {"user_id": "xxxxxx", "b64image": "xxxxxx", "encoding": "xxxxxxx"}

    "encoding" is optional, and will simply be returned in a get_image query

    Returns (status, text):
        200, json {"image_id": "xxxxxx"}
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
                "body": await request.text(),
                "error": message,
            },
        )

        return web.Response(
            status=status,
            text=json.dumps({"error": message}),
        )

    # get payload
    try:
        payload = await request.json()
    except json.JSONDecodeError:
        result = {"error": "invalid JSON"}

        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                **result,
            },
        )

        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # expecting payload to contain keys: user_id and b64image
    if "b64image" not in payload or "user_id" not in payload:
        result = {"error": "missing user_id or b64image"}

        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                **result,
            },
        )

        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    try:
        b64data = payload["b64image"].encode("ascii")  # convert str to bytes
        if not is_base64(b64data):
            raise UnicodeError
    except UnicodeError:
        # validate payload
        result = {"error": "invalid base64 data"}

        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                **result,
            },
        )

        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # is the image too large?
    if len(payload["b64image"]) > MAX_B64IMAGE_SIZE:
        result = {"error": "image too large"}

        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                **result,
            },
        )

        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # validate that the user exists
    users_db = request.app["users_db"]
    if not await users_db.exists(payload["user_id"]):
        result = {"error": "invalid user_id"}

        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                **result,
            },
        )

        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # upload into the database
    images_db = request.app["images_db"]

    image_id = f"image-{uuid.uuid4().hex}"

    now = datetime.datetime.now().isoformat()

    # validate base64 data
    record = {
        "image_id": image_id,
        "user_id": payload["user_id"],
        "b64image": payload["b64image"],
        "created": now,
    }

    if "encoding" in payload:
        record["encoding"] = payload["encoding"]

    # insert into database
    await images_db.set(image_id, record)

    # return the image_id
    result = {"image_id": image_id}

    # log the successful request
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "payload_size": len(record["b64image"]),
            **result,
        },
    )

    return web.Response(
        text=json.dumps(result),
        content_type="application/json",
        status=HTTP_OK,
    )
