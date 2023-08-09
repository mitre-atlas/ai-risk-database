"""Register user API route."""
import datetime
import json
import uuid
from typing import Dict, Optional, Set, Tuple

import aiohttp
from aiohttp import web

from server.routes.utils.common import HTTP_BAD_REQUEST, HTTP_OK, check_auth


# @ROUTES.post("/api/register_user")
async def register_user(request: web.Request) -> web.Response:
    """Register a user (if not already registered), returning a user_id.

    Expects a post of userdata returned by github oauth callback.

    POST /api/register_user -H "Authorization: Bearer XXXXXX"
    {
        "login": "drhyrum",
        "avatar_url": "https://avatars.githubusercontent.com/u/7817863?v=4",
        "name": "Hyrum Anderson",
        "company": "Robust Intelligence",
        "location": "Mountain Time Zone",
        "email": "hyrum@robustintelligence.com",
        "twitter_username": "drhyrum",
        "terms_version": docusign_integer,      # optional
        "created_at": "2014-06-06T17:22:38Z",
    }


    Returns (status, text):
        200, json {"user_id": user_id, "terms_version": terms_version}"
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
        user_info = await request.json()
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

    async def fields_are_valid(
        required_fields: Set[str], user_info: Dict[str, any]
    ) -> Tuple[bool, Optional[web.Response]]:
        missing_fields = list(required_fields.difference(user_info.keys()))
        if missing_fields:
            result = {
                "error": "missing fields",
                "missing_fields": missing_fields,
            }

            request.app["request_log"].error(
                "error",
                extra={
                    "headers": dict(request.headers),
                    "body": await request.text(),
                    **result,
                },
            )

            return (
                False,
                web.Response(
                    text=json.dumps(result),
                    content_type="application/json",
                    status=HTTP_BAD_REQUEST,
                ),
            )
        return True, None

    # check if the user already exists
    users_db = request.app["users_db"]

    # does this user already exist in the database?
    login = user_info["login"]

    # update last_login
    now = datetime.datetime.now().isoformat()

    if await users_db.exists(login, keyname="login"):
        # user already registered, let's retrieve info
        # validate input
        required_fields = set(("login",))
        valid, ret_val = await fields_are_valid(required_fields, user_info)
        if not valid:
            return ret_val

        db_user_info = await users_db.get(login, keyname="login")
        user_id = db_user_info["user_id"]
        # update the last_login time and any changes from github
        db_user_info.update(user_info)
        db_user_info["last_login"] = now
        db_user_info["updated"] = now
        # is terms_version in the payload?
        if "terms_version" in user_info:
            db_user_info["terms_version"] = user_info["terms_version"]
        user_info = db_user_info  # we'll return this data
        await users_db.upsert(user_id, user_info)
    else:
        # user has never before registered
        # validate input
        required_fields = set(
            (
                "login",
                "avatar_url",
                "name",
                "company",
                "location",
                "email",
                "twitter_username",
                "created_at",
            )
        )
        valid, ret_val = await fields_are_valid(required_fields, user_info)
        if not valid:
            return ret_val

        # otherwise, create a new user
        user_id = f"user-{uuid.uuid4().hex}"
        # append our fields to what is returned by GitHub
        user_info.update(
            {
                "user_id": user_id,
                "registered": now,
                "last_login": now,
                "updated": now,
            }
        )
        await users_db.set(user_id, user_info)

        # Zapier notification
        if request.app["zapier_endpoint"]:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    request.app["zapier_endpoint"], data="New user signup: " + login
                )

    terms_version = user_info.get("terms_version", None)

    # return the user_id
    result = {"data": {"user_id": user_id, "terms_version": terms_version}}

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "body": user_info,
            **result,
        },
    )

    return web.Response(
        text=json.dumps(result),
        content_type="application/json",
        status=HTTP_OK,
    )
