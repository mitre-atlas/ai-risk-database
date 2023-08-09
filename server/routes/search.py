"""Search API route."""
import json
import urllib.parse
from textwrap import dedent
from typing import Optional

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.utils.common import (
    ARTIFACT_RARE_COUNT,
    FILENAMES_NAME,
    FILESCANS_NAME,
    HTTP_BAD_REQUEST,
    HTTP_OK,
    MODEL_INFO_NAME,
    REPORTS_NAME,
    REPOS_NAME,
    USERS_NAME,
    check_auth,
    test_summaries_to_rank,
    test_summaries_to_status,
)

PAGE_DEFAULT = "1"
ITEMS_DEFAULT = "20"
TYPE_DEFAULT = "models"
SORT_DEFAULT = None  # default
FILTER_DEFAULT = None  # default


# @ROUTES.get("/api/search")
async def search(request: web.Request) -> web.Response:
    """Return search results for a query string.

    GET /api/search?q=bert[&page=1&items=20&type=model&s=field:asc&f=field:string] -H "Authorization: Bearer XXXXX

    @q:     query string [required]
    @page:  what page of results [optional, default: 1]
    @items: how many items per page [optional, default: 20]
    @type:  what item to search: "models", "reports", "artifacts", "files" [optional, default: models]
    @s:     sort by field:asc|desc,field:asc|desc,... [optional]
            For type=="models",
                sorting options include:
                    name:asc|desc
                    date:asc|desc
                    purl:asc|desc  (pkg:source/org/name, which sorts by source, org, name)
                    reports:asc|desc  (number of reports)
                    scans:asc|desc   (number of scans)
                    vulns:asc|desc  (number of vulns)
                and default is
                    name:asc;date:desc
            For type=="reports",
                sorting options include:
                    votes:asc|desc
                    title:asc|desc
                    date:asc|desc
                and default is
                    votes:desc;title:asc;date:desc
            For type=="artifacts",
                sorting options include:
                    name:asc|desc
                    count:asc|desc
                    date:asc|desc
                and default is
                    count:asc;name:asc  # rarest first, then alphabetical
            For type=="files",
                sorting options include:
                    name:asc|desc
                    count:asc|desc
                    date:asc|desc
                and default is
                    count:desc;name:asc  # most common first, then alphabetical
    @f:     filter by field:value [optional, default: none]
            For type=="models",
                filtering options include:
                    owner:str (e.g., owner:drhyrum)
                    source:str (e.g., source:huggingface, source:pytorch-hub)
                    task:str (e.g., task:image-classification)
            For type=="reports",
                filtering options include:
                    author:str (e.g., author:drhyrum)
                    type:str (e.g., type:security)
            For type=="artifacts",
                filtering options include:
                    only_rare:bool (e.g., only_rare:true)
            For type=="artifacts"
                [no filtering options]


    Returns (status, text):
    200, json
        reports: {"count": 10, "results": [...], "filters": {"owner": [...], "source": [...], "task": [...], "framework": [...]}}
        models: {"count": 0, "results": [], "filters": {"author": [...], "type": [...]}}
        artifacts: {"count": 0, "results": [], "filters": {"only_rare": ["true", "false"]}}
    400, json {"error": bad_input_message}
    401, json {"error": bad_auth_message}
    404, json {"error": not_found_message}"""

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

    search_term = urllib.parse.unquote(request.rel_url.query.get("q"))
    try:
        page = int(request.rel_url.query.get("page", PAGE_DEFAULT))
        items = int(request.rel_url.query.get("items", ITEMS_DEFAULT))
    except ValueError:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "expecting integer in query",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
        )

    query_type = request.rel_url.query.get("type", TYPE_DEFAULT)
    if query_type not in ["models", "reports", "artifacts", "files"]:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "type must be one of 'models', 'reports', 'artifacts', 'files'",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
        )

    # these are type-dependent, so validation will happen below
    sortby = request.rel_url.query.get("s", SORT_DEFAULT)
    filterby = request.rel_url.query.get("f", FILTER_DEFAULT)

    # are there any other query parameters?
    for k in request.rel_url.query.keys():
        if k not in ["q", "page", "items", "type", "s", "f"]:
            request.app["request_log"].error(
                "error",
                extra={
                    "headers": dict(request.headers),
                    "query": dict(request.rel_url.query),
                    "error": f"unknown query parameter: {k}",
                },
            )

            return web.Response(
                status=HTTP_BAD_REQUEST,
                text=json.dumps({"error": "Bad input"}),
            )

    if query_type == "models":
        return await _search_models(request, search_term, page, items, sortby, filterby)

    elif query_type == "reports":
        return await _search_reports(
            request, search_term, page, items, sortby, filterby
        )

    elif query_type == "artifacts":
        return await _search_artifacts(
            request, search_term, page, items, sortby, filterby
        )

    elif query_type == "files":
        return await _search_files(request, search_term, page, items, sortby, filterby)

    else:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "unknown query type",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
        )


###########################################
# models
###########################################
async def _search_models(
    request: web.Request,
    search_term: str,
    page: int,
    items: int,
    sortby: Optional[str],
    filterby: str,
):
    """Search for models"""

    # TODO: what if an exact purl or url is returned?
    model_info_db = request.app["model_info_db"]
    # parse sort order
    if sortby is None:
        sortby = "name:asc;date:desc"
    sort_map = {
        "name": f"{MODEL_INFO_NAME}.name",
        "date": f"{MODEL_INFO_NAME}.commitdate",
        "purl": f"{MODEL_INFO_NAME}.basepurl",
        "reports": f"JSON_LENGTH({MODEL_INFO_NAME}.reports)",
        "scans": f"JSON_LENGTH({MODEL_INFO_NAME}.scans)",
        "vulns": f"JSON_LENGTH({MODEL_INFO_NAME}.vulnerabilities)",
    }
    sortby = sortby.split(";")
    orderby_additions = []
    for sort in sortby:
        field, order = sort.split(":")
        if field not in sort_map:
            request.app["request_log"].error(
                "error",
                extra={
                    "headers": dict(request.headers),
                    "query": dict(request.rel_url.query),
                    "error": f"sortby field must be one of {', '.join(sort_map.keys())}",
                },
            )

            return web.Response(
                status=HTTP_BAD_REQUEST,
                text=json.dumps({"error": "Bad input"}),
            )
        orderby_additions.append(f"{sort_map[field]} {order.upper()}")

    orderby_string = f"ORDER BY {', '.join(orderby_additions)} "

    # parse additional filters
    if filterby is None:
        filterby = ""
    filter_map = {
        "owner": f"{REPOS_NAME}.owner",
        "source": f"{REPOS_NAME}.type",
        "task": f"{REPOS_NAME}.task",
    }
    filterby = filterby.split(";")
    search_clause = (
        f"({MODEL_INFO_NAME}.basepurl LIKE '%{search_term}%' OR "  # match the basepurl
        f"{MODEL_INFO_NAME}.repo_uri LIKE '%{search_term}%' OR "  # or repo_uri
        f"{MODEL_INFO_NAME}.name like '%{search_term}%') "  # or name
    )
    where_clauses = []
    for _filter in filterby:
        if _filter.rstrip():
            field, values_string = _filter.split(":")
            if field not in filter_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"filterby field must be one of {', '.join(filter_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            values_tuple = tuple(values_string.split(","))
            if len(values_tuple) == 1:
                where_clauses.append(f"{filter_map[field]} = '{values_tuple[0]}'")
            else:
                where_clauses.append(f"{filter_map[field]} IN {values_tuple}")

    if where_clauses:
        where_string = f"WHERE {' AND '.join(where_clauses)}"
    else:
        where_string = ""

    query = dedent(
        f"""
        SELECT {MODEL_INFO_NAME}.purl, {MODEL_INFO_NAME}.name, {MODEL_INFO_NAME}.owner, {MODEL_INFO_NAME}.commitdate,
            JSON_LENGTH(reports), JSON_LENGTH(scans), JSON_LENGTH(vulnerabilities),
            security_total, security_pass, security_fail, security_warning, security_severe,
            ethics_total, ethics_pass, ethics_fail, ethics_warning, ethics_severe,
            performance_total, performance_pass, performance_fail, performance_warning, performance_severe,
            overall_total, overall_pass, overall_fail, overall_warning, overall_severe,
            {REPOS_NAME}.type, {REPOS_NAME}.owner, {REPOS_NAME}.task, {REPOS_NAME}.libraries
        FROM (
            SELECT *
            FROM {MODEL_INFO_NAME}
            WHERE {search_clause}
        ) {MODEL_INFO_NAME}
        LEFT JOIN {REPOS_NAME} ON {MODEL_INFO_NAME}.basepurl = {REPOS_NAME}.basepurl
        {where_string}
        {orderby_string}
        LIMIT {items*(page-1)}, {items}
    """
    ).strip("\n")
    results = await model_info_db.custom_query(query)
    models_results = []
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
            "type": _r[27],
            "task": _r[29],
            "libraries": json.loads(_r[30]),
        }
        models_results.append(_d)

    # count the number of results
    query = dedent(
        f"""
        SELECT COUNT(*)
        FROM (SELECT * FROM {MODEL_INFO_NAME} WHERE {search_clause}) {MODEL_INFO_NAME}
        LEFT JOIN {REPOS_NAME} ON {MODEL_INFO_NAME}.basepurl = {REPOS_NAME}.basepurl
        {where_string}
    """
    ).strip("\n")
    results = await model_info_db.custom_query(query)
    count = results[0][0] if len(results) > 0 and len(results[0]) > 0 else 0

    # get the unique categories for filtering
    query = dedent(
        f"""
        SELECT
        GROUP_CONCAT(DISTINCT {REPOS_NAME}.owner),
        GROUP_CONCAT(DISTINCT {REPOS_NAME}.type),
        GROUP_CONCAT(DISTINCT {REPOS_NAME}.task)
        FROM {REPOS_NAME}
        LEFT JOIN {MODEL_INFO_NAME} ON {MODEL_INFO_NAME}.basepurl = {REPOS_NAME}.basepurl
        WHERE {search_clause}
    """
    ).strip("\n")

    results = await model_info_db.custom_query(query)
    if len(results) > 0 and len(results[0]) >= 3:
        filters = {
            "owner": results[0][0].split(",") if results[0][0] else [],
            "source": results[0][1].split(",") if results[0][1] else [],
            "task": results[0][2].split(",") if results[0][2] else [],
        }
    else:
        filters = {
            "owner": [],
            "source": [],
            "task": [],
        }

    result = {
        "count": count,
        "results": models_results,
        "filters": filters,
    }

    # sanitize the output
    result = sanitize_json_output(result)

    # log the query
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": result,
        },
    )

    # return the results
    return web.Response(
        status=HTTP_OK,
        text=json.dumps(result),
    )


###########################################
# reports
###########################################
async def _search_reports(
    request: web.Request,
    search_term: str,
    page: int,
    items: int,
    sortby: Optional[str],
    filterby: str,
):
    """Search for reports"""
    reports_db = request.app["reports_db"]
    # parse sort order
    if sortby is None:
        sortby = "votes:desc;title:asc;date:desc"
    sortby = sortby.split(";")
    orderby_additions = []
    sort_map = {
        "votes": "difference",
        "title": "title",
        "date": "updated",
    }
    for _sort in sortby:
        if _sort.rstrip():
            field, direction = _sort.split(":")
            if field not in sort_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"orderby field must be one of {', '.join(sort_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            if direction not in ["asc", "desc"]:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": "orderby direction must be one of asc, desc",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            orderby_additions.append(f"{sort_map[field]} {direction.upper()}")
    orderby_string = "ORDER BY " + ", ".join(orderby_additions)

    # parse filters
    if filterby is None:
        filterby = ""
    filterby = filterby.split(";")
    filter_map = {
        "author": f"{USERS_NAME}.login",
        "type": "domain",
    }
    where_clauses = [
        (
            f"(title LIKE '%{search_term}%' OR description LIKE '%{search_term}%' "  # match the report
            f"OR {USERS_NAME}.login LIKE '%{search_term}%' "  # match the author
            f"OR JSON_SEARCH(purls, 'one', '%{search_term}%') IS NOT NULL)"  # match the purl
        )
    ]
    for _filter in filterby:
        if _filter.rstrip():
            field, values_string = _filter.split(":")
            if field not in filter_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"filterby field must be one of {', '.join(filter_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            values_tuple = tuple(values_string.split(","))
            if len(values_tuple) == 1:
                where_clauses.append(f"{filter_map[field]} = '{values_tuple[0]}'")
            else:
                where_clauses.append(f"{filter_map[field]} IN {values_tuple}")
    where_string = f"WHERE {' AND '.join(where_clauses)}"

    query = dedent(
        f"""
        SELECT report_id, title, {REPORTS_NAME}.updated, domain, JSON_LENGTH(upvoted),
        JSON_LENGTH(downvoted), {REPORTS_NAME}.user_id, purls,
        (JSON_LENGTH(upvoted) - JSON_LENGTH(downvoted)) as difference,
        {USERS_NAME}.login
        FROM {REPORTS_NAME}
        LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id
        {where_string}
        {orderby_string}
        LIMIT {items*(page-1)}, {items}
    """
    ).strip("\n")
    results = await reports_db.custom_query(query)
    reports_results = []
    for _r in results:
        purls = json.loads(_r[7])
        _d = {
            "report_id": _r[0],
            "title": _r[1],
            "updated": _r[2],
            "domain": _r[3],
            "upvoted": _r[4],
            "downvoted": _r[5],
            "user_id": _r[6],
            "models_affected": len(purls),
            "purls": purls,
            "votes": _r[8],
            "author": _r[9],
        }
        reports_results.append(_d)

    # count the number of results
    query = dedent(
        f"""
        SELECT COUNT(*) FROM {REPORTS_NAME}
        LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id
        {where_string}
    """
    ).strip("\n")
    results = await reports_db.custom_query(query)
    if len(results) > 0 and len(results[0]) > 0:
        count = results[0][0]
    else:
        count = 0

    # get the filters
    query = dedent(
        f"""
        SELECT
        GROUP_CONCAT(DISTINCT {USERS_NAME}.login),
        GROUP_CONCAT(DISTINCT domain)
        FROM {REPORTS_NAME}
        LEFT JOIN {USERS_NAME} ON {REPORTS_NAME}.user_id = {USERS_NAME}.user_id
        WHERE {where_clauses[0]}
    """
    ).strip("\n")
    results = await reports_db.custom_query(query)
    if len(results) > 0 and len(results[0]) >= 2:
        filters = {
            "author": results[0][0].split(",") if results[0][0] else [],
            "type": results[0][1].split(",") if results[0][1] else [],
        }
    else:
        filters = {
            "author": [],
            "type": [],
        }

    result = {
        "count": count,
        "results": reports_results,
        "filters": filters,
    }

    # sanitize the output
    result = sanitize_json_output(result)

    # log the query
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": result,
        },
    )

    # return the results
    return web.Response(
        status=HTTP_OK,
        text=json.dumps(result),
    )


###########################################
# artifacts
###########################################
async def _search_artifacts(
    request: web.Request,
    search_term: str,
    page: int,
    items: int,
    sortby: Optional[str],
    filterby: str,
):
    """Search for artifacts."""
    filescans_db = request.app["filescans_db"]
    # parse sortby
    orderby_additions = []
    if sortby is None:
        sortby = "count:asc;name:asc"
    sortby = sortby.split(";")
    sort_map = {
        "name": "name",
        "count": "count",
        "date": "updated",
    }
    for _sort in sortby:
        if _sort.rstrip():
            field, direction = _sort.split(":")
            if field not in sort_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"orderby field must be one of {', '.join(sort_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            if direction not in ["asc", "desc"]:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": "orderby direction must be one of asc, desc",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            orderby_additions.append(f"{sort_map[field]} {direction.upper()}")
    orderby_string = f"ORDER BY {' ,'.join(orderby_additions)}"

    # parse filterby
    if filterby is None:
        filterby = ""
    filterby = filterby.split(";")
    filter_map = {
        "rare_only": f"count < {ARTIFACT_RARE_COUNT}",
    }
    where_clauses = [f"name LIKE '%{search_term}%'"]  # match the name of the artifact
    for _filter in filterby:
        if _filter.rstrip():
            field, value = _filter.split(":")
            if field not in filter_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"filterby field must be one of {', '.join(filter_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )

            if field == "rare_only" and value.lower() == "true":
                where_clauses.append(f"{filter_map[field]}")

    where_string = f"WHERE {' AND '.join(where_clauses)}"

    # name
    query = dedent(
        f"""
        SELECT {FILESCANS_NAME}.name, {FILESCANS_NAME}.count, purls
        FROM {FILESCANS_NAME}
        {where_string}
        {orderby_string}
        LIMIT {items*(page-1)}, {items}
    """
    ).strip("\n")

    # this is how I'd get the artifacts within a filename...but it's too slow
    # SELECT DISTINCT jt.artifact FROM filenames f CROSS JOIN JSON_TABLE(f.artifacts, '$[*]' COLUMNS (artifact VARCHAR(255) PATH '$')) AS jt WHERE f.filename LIKE '%pytorch%' AND JSON_LENGTH(f.artifacts) > 0;
    # ...and then use this in a subqery
    # SELECT filescans.name, filescans.count FROM filescans WHERE filescans.name LIKE '%pytorch%' OR filescans.name in (SELECT DISTINCT jt.artifact FROM filenames f CROSS JOIN JSON_TABLE(f.artifacts, '$[*]' COLUMNS (artifact VARCHAR(255) PATH '$')) AS jt WHERE f.filename LIKE '%pytorch%' AND JSON_LENGTH(f.artifacts) > 0);

    results = await filescans_db.custom_query(query)
    artifacts_results = []
    for _r in results:
        purls = json.loads(_r[2])[:ARTIFACT_RARE_COUNT] if _r[2] else []
        _d = {
            "name": _r[0],
            "count": _r[1],
            "rare": _r[1] < ARTIFACT_RARE_COUNT,
            "purls": purls,
        }
        artifacts_results.append(_d)

    # count the number of results
    query = f"""SELECT COUNT(*) FROM {FILESCANS_NAME} """ f"""{where_string} """
    results = await filescans_db.custom_query(query)
    if len(results) > 0 and len(results[0]) > 0:
        count = results[0][0]
    else:
        count = 0

    # get the filters
    filters = {
        "rare_only": ["true", "false"],
    }

    result = {
        "count": count,
        "results": artifacts_results,
        "filters": filters,
    }

    # sanitize the output
    result = sanitize_json_output(result)

    # log the query
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": result,
        },
    )

    # return the results
    return web.Response(
        status=HTTP_OK,
        text=json.dumps(result),
    )


###########################################
# files
###########################################
async def _search_files(
    request: web.Request,
    search_term: str,
    page: int,
    items: int,
    sortby: Optional[str],
    filterby: str,
):
    """Search for files by name."""
    filenames_db = request.app["filenames_db"]
    # parse sortby
    orderby_additions = []
    if sortby is None:
        sortby = "count:desc;name:asc"
    sortby = sortby.split(";")
    sort_map = {
        "name": "filename",
        "count": "count",
        "date": "updated",
    }
    for _sort in sortby:
        if _sort.rstrip():
            field, direction = _sort.split(":")
            if field not in sort_map:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": f"orderby field must be one of {', '.join(sort_map.keys())}",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            if direction not in ["asc", "desc"]:
                request.app["request_log"].error(
                    "error",
                    extra={
                        "headers": dict(request.headers),
                        "query": dict(request.rel_url.query),
                        "error": "orderby direction must be one of asc, desc",
                    },
                )

                return web.Response(
                    status=HTTP_BAD_REQUEST,
                    text=json.dumps({"error": "Bad input"}),
                )
            orderby_additions.append(f"{sort_map[field]} {direction.upper()}")
    orderby_string = f"ORDER BY {' ,'.join(orderby_additions)}"

    where_string = f"WHERE filename LIKE '%{search_term}%'"

    # name
    query = dedent(
        f"""
        SELECT 
          filename,
          count,
          purls
        FROM {FILENAMES_NAME} f
        {where_string}
        {orderby_string}
        LIMIT {items*(page-1)}, {items}
    """
    ).strip("\n")

    results = await filenames_db.custom_query(
        query, session_init_commands=["SET sort_buffer_size = 10 * 1024 * 1024"]
    )
    artifacts_results = []
    for _r in results:
        purls = json.loads(_r[2])[:10] if _r[2] else []
        # artifacts = json.loads(_r[3])[:10] if _r[3] else []
        # sha256s = json.loads(_r[4])[:10] if _r[4] else []
        _d = {
            "name": _r[0],
            "count": _r[1],
            "purls": purls,
            # "artifacts": artifacts,
            # "sha256s": sha256s,
        }
        artifacts_results.append(_d)

    # count the number of results
    query = f"""SELECT COUNT(*) FROM {FILENAMES_NAME} """ f"""{where_string} """
    results = await filenames_db.custom_query(query)
    if len(results) > 0 and len(results[0]) > 0:
        count = results[0][0]
    else:
        count = 0

    result = {
        "count": count,
        "results": artifacts_results,
        "filters": {},
    }

    # sanitize the output
    result = sanitize_json_output(result)

    # log the query
    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": result,
        },
    )

    # return the results
    return web.Response(
        status=HTTP_OK,
        text=json.dumps(result),
    )
