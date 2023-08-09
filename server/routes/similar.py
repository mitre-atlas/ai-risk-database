""""""
import json
import urllib.parse
from textwrap import dedent

from aiohttp import web

from airdb.utils.json_decoder import sanitize_json_output
from server.routes.search import ITEMS_DEFAULT, PAGE_DEFAULT
from server.routes.utils.common import (
    HTTP_BAD_REQUEST,
    HTTP_OK,
    MODEL_INFO_NAME,
    REPOS_NAME,
    SBOM_NAME,
    check_auth,
    resolve_purl_async,
    test_summaries_to_rank,
    test_summaries_to_status,
)

TYPE_DEFAULT = "models"


# @ROUTES.get("/api/similar")
async def similar(request: web.Request) -> web.Response:
    """Return similar items to the query string.

    GET /api/similar?q=purl[&page=1&items=20&type=models] -H "Authorization: Bearer XXXXX"

    @q:     query string [required]
    @page:  what page of results [optional, default: 1]
    @items: how many items per page [optional, default: 20]
    @type:  the query type [optional, default: models]

    Returns (status, text):
        200, json {"count": N, "results": [{item1}, {item2}, ...}]
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
    if query_type not in ["models", "reports", "artifacts"]:
        request.app["request_log"].error(
            "error",
            extra={
                "headers": dict(request.headers),
                "query": dict(request.rel_url.query),
                "error": "type must be one of 'models', 'reports', 'artifacts'",
            },
        )

        return web.Response(
            status=HTTP_BAD_REQUEST,
            text=json.dumps({"error": "Bad input"}),
        )

    # are there any other query parameters?
    for k in request.rel_url.query.keys():
        if k not in ["q", "page", "items", "type"]:
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

    # is the query a sha256 hash?
    if query_type == "sha256":
        # this is a sha256 hash
        results = await get_similar_files(request.app, query.lower(), items, page)
    elif query_type == "models":
        purl = await resolve_purl_async(query, request.app)
        if purl is None:
            # log the error
            request.app["request_log"].error(
                "error",
                extra={
                    "headers": dict(request.headers),
                    "query": dict(request.rel_url.query),
                    "error": "no purl found",
                },
            )
            return web.Response(
                status=HTTP_BAD_REQUEST,
                text=json.dumps({"error": "Bad input"}),
            )

        results = await get_similar_purls(request.app, purl, items, page)

    response = sanitize_json_output(results)

    request.app["request_log"].info(
        "success",
        extra={
            "headers": dict(request.headers),
            "query": dict(request.rel_url.query),
            "result": response,
        },
    )

    return web.Response(
        status=HTTP_OK,
        text=json.dumps(response),
        content_type="application/json",
    )


## get similar files
async def get_similar_files(
    app: web.Application,
    sha256: str,
    items: int = ITEMS_DEFAULT,
    page: int = PAGE_DEFAULT,
) -> list:
    """Return similar files to a given file."""
    similar_items = []
    # TODO
    return {"count": 0, "results": similar_items, "filters": []}


## get similar purls
async def get_similar_purls(
    app: web.Application,
    purl: str,
    items: int = ITEMS_DEFAULT,
    page: int = PAGE_DEFAULT,
) -> list:
    """Return similar purls to a given purl."""
    # number of overlapping files
    # step 1: get the sha256 hashes for this purl from the SBOM table
    # example:
    # SELECT JSON_EXTRACT(files, '$[*].sha256') AS sha256_array FROM sbom WHERE purl = 'pkg:huggingface/RayK/distilbert-base-uncased-finetuned-cola@9777f9e5ff51d7c637380d29a26ac306c0df3385';
    query = f"SELECT JSON_EXTRACT(files, '$[*].sha256') AS sha256_array FROM {SBOM_NAME} WHERE purl = '{purl}'"
    results = await app["sha256_db"].custom_query(query)
    if len(results) > 0 and len(results[0]) > 0:
        list_of_sha256 = json.loads(results[0][0])

        # step 2: get the purls for each sha256 hash in the sha256 table, and groupby the purl, keeping a count
        # query = (
        #     "SELECT purl, sha256_array, @group_concat_max_len := 8192 "
        #     "FROM ( "
        #     "SELECT purl, GROUP_CONCAT(DISTINCT jt.sha256) AS sha256_array "
        #     f"FROM {SBOM_NAME} "
        #     "JOIN JSON_TABLE(files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt "
        #     f"ON jt.sha256 IN {tuple(list_of_sha256)} "
        #     "GROUP BY purl "
        #     ") AS t "
        #     f"WHERE purl != '{purl}' "
        #     "ORDER BY LENGTH(sha256_array) DESC "
        #     f"LIMIT {items*(page-1)}, {items}"
        # )
        if len(list_of_sha256) > 1:
            on_clause = f"ON jt.sha256 IN {tuple(list_of_sha256)}"
        else:
            on_clause = f"ON jt.sha256 = '{list_of_sha256[0]}'"
        query = dedent(
            f"""
            WITH cte AS (
            SELECT purl, GROUP_CONCAT(DISTINCT jt.sha256) AS sha256_array
            FROM {SBOM_NAME}
            JOIN JSON_TABLE(files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
            {on_clause}
            WHERE purl != '{purl}'
            GROUP BY purl
            )
            SELECT purl, sha256_array, total_items
            FROM cte
            CROSS JOIN (
            SELECT COUNT(*) AS total_items
            FROM cte
            ) AS c
            ORDER BY LENGTH(sha256_array) DESC
            LIMIT {items*(page-1)}, {items}
            """
        ).strip("\n")

        results = await app["sbom_db"].custom_query(
            query, session_init_commands=["SET group_concat_max_len = 8192"]
        )

        # Initialize count, which is returned alongside results
        count = 0

        # Only query if there are matches, otherwise empty IN clause below
        if results:
            # each returned row is of the form
            # (purl1, comma_separated_sha256_str1, count),
            # (purl2, comma_separated_sha256_str2, count),
            # where count doesn't change

            purl_match = {}

            for result in results:
                thispurl = result[0]
                matching_sha256s = result[1].split(",")
                # this isn't true Jaccard b/c we don't know the size of the union
                purl_match[thispurl] = len(matching_sha256s) / len(list_of_sha256)
                count = result[2]

            # step 2: now, let's collect appropriate information for each purl
            purl_tuple = tuple(purl_match.keys())

            query = dedent(
                f"""
                SELECT
                    purl, {MODEL_INFO_NAME}.name, JSON_LENGTH(reports), JSON_LENGTH(scans), JSON_LENGTH(vulnerabilities),
                    {REPOS_NAME}.owner, {REPOS_NAME}.task, {REPOS_NAME}.libraries, {REPOS_NAME}.fullname,
                    security_total, security_pass, security_fail, security_warning, security_severe,
                    ethics_total, ethics_pass, ethics_fail, ethics_warning, ethics_severe,
                    performance_total, performance_pass, performance_fail, performance_warning, performance_severe,
                    overall_total, overall_pass, overall_fail, overall_warning, overall_severe,
                    {REPOS_NAME}.type
                FROM {MODEL_INFO_NAME}
                JOIN {REPOS_NAME} ON {MODEL_INFO_NAME}.basepurl = {REPOS_NAME}.basepurl
                WHERE {MODEL_INFO_NAME}.purl IN {purl_tuple}
                """
            ).strip("\n")
            results = await app["repos_db"].custom_query(query)

        similar_items = []
        for result in results:
            similar_items.append(
                {
                    "purl": result[0],
                    "name": result[1],
                    "reports": result[2],
                    "scans": result[3],
                    "vulnerabilities": result[4],
                    "owner": result[5],
                    "task": result[6],
                    "libraries": json.loads(result[7] or "[]"),
                    "fullname": result[8],
                    "match": purl_match[result[0]],
                    "type": result[29],
                    "security": {
                        "status": test_summaries_to_status(
                            result[9], result[10], result[11], result[12], result[13]
                        ),
                        "rank": await test_summaries_to_rank(
                            result[9],
                            result[10],
                            result[11],
                            result[12],
                            result[13],
                            category="security",
                            db=app["model_info_db"],
                        ),
                    },
                    "ethics": {
                        "status": test_summaries_to_status(
                            result[14], result[15], result[16], result[17], result[18]
                        ),
                        "rank": await test_summaries_to_rank(
                            result[14],
                            result[15],
                            result[16],
                            result[17],
                            result[18],
                            category="ethics",
                            db=app["model_info_db"],
                        ),
                    },
                    "performance": {
                        "status": test_summaries_to_status(
                            result[19], result[20], result[21], result[22], result[23]
                        ),
                        "rank": await test_summaries_to_rank(
                            result[19],
                            result[20],
                            result[21],
                            result[22],
                            result[23],
                            category="performance",
                            db=app["model_info_db"],
                        ),
                    },
                    "overall": {
                        "status": test_summaries_to_status(
                            result[24], result[25], result[26], result[27], result[28]
                        ),
                        "rank": await test_summaries_to_rank(
                            result[24],
                            result[25],
                            result[26],
                            result[27],
                            result[28],
                            category="overall",
                            db=app["model_info_db"],
                        ),
                    },
                }
            )
        similar_items = sorted(
            similar_items, key=lambda x: (x["match"], x["name"]), reverse=True
        )
    else:
        similar_items = []
        count = 0

    return {
        "count": count,
        "results": similar_items,
    }


### QUERY NOTES
# example:
# SELECT purl, COUNT(*) AS count FROM sha256 JOIN JSON_TABLE(sha256.purls, '$[*]' COLUMNS(purl VARCHAR(255) PATH '$')) AS purl_list ON 1=1 WHERE sha256 IN ("1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3", "6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627", "07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3") GROUP BY purl limit 10;
# SELECT purl, COUNT(*) as common_entries FROM sbom JOIN JSON_TABLE(sbom.files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt ON jt.sha256 IN ("1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3", "6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627", "07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3") GROUP BY sbom.purl ORDER BY common_entries DESC limit 10;

# what purls contain at least one of these files?
"""
SELECT DISTINCT purl
FROM sbom
JOIN JSON_TABLE(files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
    ON jt.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3');
"""

# this query returns purl, list_of_sha256
"""
SELECT DISTINCT sbom.purl, (
    SELECT JSON_EXTRACT(files, '$[*].sha256')
    FROM sbom
    WHERE sbom.purl = p.purl
) AS sha256_array
FROM (
    SELECT DISTINCT purl
    FROM sbom
    JOIN JSON_TABLE(files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
        ON jt.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3')
) AS p
JOIN sbom ON sbom.purl = p.purl;
"""

# this query returns purl, matching_sha256_files
# note that GROUP_CONCAT retuns a string (comma-separated), but since all sha256 strings
# are the same length, we can count the length of the string as a proxy for the number of
# matching elements.
"""
SELECT sbom.purl, GROUP_CONCAT(DISTINCT jt.sha256) AS sha256_array
FROM sbom
JOIN JSON_TABLE(sbom.files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
ON jt.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3')
GROUP BY sbom.purl
ORDER BY LENGTH(sha256_array) DESC
LIMIT 10;
"""

# GROUP_CONCAT is limited by a maximum size of 1024 characters
# See: SELECT @@group_concat_max_len;
# which can be changed via SET group_concat_max_len = 2048;  for a given session
# alternatively, we can set it the query, and use a subquery to get the GROUP_CONCAT
"""
SELECT purl, sha256_array, @group_concat_max_len := 2048
FROM (
    SELECT purl, GROUP_CONCAT(DISTINCT jt.sha256) AS sha256_array
    FROM sbom
    JOIN JSON_TABLE(sbom.files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
    ON jt.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3')
    GROUP BY sbom.purl
) AS t
ORDER BY LENGTH(sha256_array) DESC
LIMIT 10;
"""

# if we wanted to actually count collisions, we would use
# CROSS JOIN to get the intersection of the two lists
# and use the previous query as a subquery
# but there's no need
"""
SELECT purl, COUNT(common.sha256) AS number_of_common_files
FROM (
    SELECT sbom.purl, GROUP_CONCAT(DISTINCT jt.sha256) AS sha256_array
    FROM sbom
    JOIN JSON_TABLE(sbom.files, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$.sha256')) AS jt
    ON jt.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3')
    GROUP BY sbom.purl;
) AS subquery
CROSS JOIN JSON_TABLE(subquery.sha256_array, '$[*]' COLUMNS(sha256 VARCHAR(64) PATH '$')) AS common
WHERE common.sha256 IN ('1a6acd3261769a08abd6fa132a83c8b8a2f3ae30f15fe5c0154dbb2a2bc9e4b3', '6e3fd1a71d54b925033bb89c83da59350c5edd7c7e5d0b047d3c697fd41c5627', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3')
GROUP BY subquery.purl;
"""

# Next: modify this query so that sha256_array is a list of distinct sha256 hashes, with duplicates removed
# and then we can use the same query to get the intersection of the two lists

# query = f"SELECT purl, COUNT(*) AS count FROM {SHA256_NAME} JOIN JSON_TABLE({SHA256_NAME}.purls, '$[*]' COLUMNS(purl VARCHAR(255) PATH '$')) AS purl_list ON 1=1 WHERE sha256 IN {tuple(list_of_sha256)} GROUP BY purl ORDER BY count DESC limit {limit}"
