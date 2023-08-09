"""Submit report API route."""
import datetime
import json
import uuid

from aiohttp import web

from server.routes.utils.common import HTTP_BAD_REQUEST, check_auth, resolve_purl_async


# @ROUTES.post("/api/submit_report")
async def submit_report(request: web.Request) -> web.Response:
    """Submit a report and return a report_id.

    POST /api/submit_report -H "Authorization: Bearer XXXXXX"
    {
        "purls": [purl_for_model1, purl_for_model2],
        "name": "user-xxxxxxxx", #  user_id for logged-in user],
        "title": "string",
        "description":  "string_markdown_ok",
        "reference_uris": ["twitter.com/drhyrum/adsfasd", "alpha.airisk.io/asdfasdf"],
        "domain": "fairness",  # one of ethics/security/operational
        "vulnerabilities": ["CVE-1", "CVE-2", "CWE-3"],
    }

    Returns (status, text):
        200, json {"report_id": report_id}
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
        data = await request.json()
    except json.JSONDecodeError:
        result = {"error": "invalid JSON"}
        request.app["request_log"].error(
            "error",
            extra={
                **result,
                "body": await request.text(),
                "headers": dict(request.headers),
            },
        )
        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # validate input
    required_fields = set(
        ("purls", "user_id", "title", "description", "reference_uris", "domain")
    )
    missing_fields = list(required_fields.difference(data.keys()))
    if missing_fields:
        result = {"error": "missing fields", "missing_fields": missing_fields}
        request.app["request_log"].error(
            "error", extra={**result, "body": data, "headers": dict(request.headers)}
        )
        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )
    optional_fields = set(
        ("vulnerabilities",)
    )
    extra_fields = list(set(data.keys()).difference(required_fields).difference(optional_fields))
    if extra_fields:
        result = {"error": "extra fields", "extra_fields": extra_fields}
        request.app["request_log"].error(
            "error", extra={**result, "body": data, "headers": dict(request.headers)}
        )
        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    # list may include PURLs or URLs: resulve to PURLs
    resolved_purls = []
    for purl in data["purls"]:
        resolved = await resolve_purl_async(purl, request.app)
        if resolved is None:
            result = {"error": f"purl {purl} not found"}
            request.app["request_log"].error(
                "error",
                extra={**result, "body": data, "headers": dict(request.headers)},
            )
            return web.Response(
                text=json.dumps(result),
                content_type="application/json",
                status=HTTP_BAD_REQUEST,
            )
        resolved_purls.append(resolved)

    data["purls"] = resolved_purls

    # make sure inputs are of the correct type for the database
    reports_db = request.app["reports_db"]
    try:
        expected_types = {
            item["name"]: __builtins__[item["python_type"]]
            for item in reports_db.schema["fields"]
        }
    except KeyError:
        expected_types = {
            item["name"]: getattr(__builtins__, item["python_type"])
            for item in reports_db.schema["fields"]
        }

    for key, value in data.items():
        if not isinstance(value, expected_types[key]):
            result = {"error": f"expecting {key} to be a {expected_types[key]}"}
            request.app["request_log"].error(
                "error",
                extra={**result, "body": data, "headers": dict(request.headers)},
            )
            return web.Response(
                text=json.dumps(result),
                content_type="application/json",
                status=HTTP_BAD_REQUEST,
            )

    if data["domain"] not in ("ethics", "security", "performance"):
        result = {
            "error": 'domain must be one of ["ethics", "security", "performance"]'
        }
        request.app["request_log"].error(
            "error", extra={**result, "body": data, "headers": dict(request.headers)}
        )
        return web.Response(
            text=json.dumps(result),
            content_type="application/json",
            status=HTTP_BAD_REQUEST,
        )

    now = datetime.datetime.now().isoformat()
    report_id = f"report-{uuid.uuid4().hex}"
    report = {
        "report_id": report_id,
        "purls": data["purls"],
        "user_id": data["user_id"],
        "title": data["title"],
        "description": data["description"],
        "reference_uris": data["reference_uris"],
        "domain": data["domain"],
        "created": now,
        "updated": now,
    }

    # update optional fields
    for field in optional_fields:
        if field in data:
            report[field] = data[field]

    await reports_db.set(report_id, report)

    request.app["request_log"].info(
        "success",
        extra={
            "data": data,
            "result": {"report_id": report_id},
            "headers": dict(request.headers),
        },
    )

    return web.Response(text=json.dumps({"report_id": report_id}))
