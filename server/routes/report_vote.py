"""Report vote API route."""
import datetime
import json

from aiohttp import web

from server.routes.utils.common import HTTP_BAD_REQUEST, HTTP_OK, check_auth


# @ROUTES.post("/api/report_vote")
async def report_vote(request: web.Request) -> web.Response:
    """Set the state of a user's vote on a report.

    POST /api/report_vote -H "Authorization: Bearer XXXXXX"
    {
        "state": "up",  # "up" or "down" or "none"  (all strings)
        "user_id": "xxxxx",
        "report_id": "xxxxxx"
    }

    Returns (status, text):
        200, json {"upvotes": 10, "downvotes": 20}"
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
            content_type="application/json",
        )

    # get payload
    try:
        parameters = await request.json()
    except json.JSONDecodeError:
        result = {"error": "invalid JSON"}
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "body": await request.text(),
                "error": result,
            },
        )
        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # get the vote parameter
    required_fields = ["state", "user_id", "report_id"]
    for _f in required_fields:
        if _f not in parameters:
            request.app["request_log"].error(
                "error",
                extra={
                    "headers": dict(request.headers),
                    "parameters": parameters,
                    "error": "Bad input: missing required field",
                },
            )
            return web.Response(
                status=HTTP_BAD_REQUEST,
                text=json.dumps(
                    {"error": "Bad input"},
                    content_type="application/json",
                ),
            )
    state = parameters["state"]

    # validate the input
    if state not in {"up", "down", "none"}:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "parameters": parameters,
                "error": "Bad input: state should be one of up/down/none",
            },
        )
        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps(
                {"error": "Bad input"},
                content_type="application/json",
            ),
        )

    user_id = parameters["user_id"]
    users_db = request.app["users_db"]
    if not await users_db.exists(user_id):
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "parameters": parameters,
                "error": "No such user",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps(
                {"query": dict(request.rel_url.query), "error": "No such user"},
                content_type="application/json",
            ),
        )

    report_id = parameters["report_id"]
    reports_db = request.app["reports_db"]
    if not await reports_db.exists(report_id):
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "parameters": parameters,
                "error": "No such report",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "No such report"}),
            content_type="application/json",
        )

    report = await reports_db.get(report_id)

    new_state = {"upvoted": 0, "downvoted": 0}
    if state == "up":
        new_state["upvoted"] = 1
    elif state == "down":
        new_state["downvoted"] = 1
    # else state == "none"

    # what is the current state?
    current_state = {"upvoted": 0, "downvoted": 0}
    for _field in ["upvoted", "downvoted"]:
        _votes = dict(report[_field])
        if user_id in _votes:
            current_state[_field] = 1

    now = datetime.datetime.now().isoformat()
    # set the current state for this report
    for _field in ["upvoted", "downvoted"]:
        _votes = dict(report[_field])
        if new_state[_field] == 1:
            _votes[user_id] = now
        else:
            if user_id in _votes:
                del _votes[user_id]
        report[_field] = list(_votes.items())

    # update fields for the submitting user
    user_info = await users_db.get(user_id)
    for _field in ["upvoted", "downvoted"]:
        _action_reports = set(user_info[f"{_field}_reports"])
        if new_state[_field] == 1:
            _action_reports.add(report_id)
        else:
            if report_id in _action_reports:
                _action_reports.remove(report_id)
        user_info[f"{_field}_reports"] = list(_action_reports)

    # update field for the report owner
    report_owner_user_id = report["user_id"]
    owner_user_info = await users_db.get(report_owner_user_id)
    for _field in ["upvoted", "downvoted"]:
        net = new_state[_field] - current_state[_field]
        owner_user_info[f"report_{_field[:-1]}s_received"] += net
    owner_user_info["updated"] = now

    # update the databases
    await users_db.set(user_id, user_info)
    await users_db.set(report_owner_user_id, owner_user_info)
    await reports_db.set(report_id, report)

    # return the total number of upvotes and downvotes
    upvotes = len(report["upvoted"])
    downvotes = len(report["downvoted"])

    result = {"upvotes": upvotes, "downvotes": downvotes}
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "parameters": parameters,
            "result": result,
        },
    )

    return web.Response(
        status=HTTP_OK, text=json.dumps(result), content_type="application/json"
    )
