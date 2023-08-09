"""Common functions used by the server."""
from typing import Optional, Tuple, Union

import numpy as np
from async_lru import alru_cache

from airdb.query_analysis import is_purl, is_repo_name, is_url, url_to_purl
from airdb.storage.mysql import MySQLDB
from airdb.storage.mysql_async import AsyncMySQLDB

# DB
SBOM_NAME = "sbom"
REPOS_NAME = "repos"
SCANS_NAME = "scans"
USERS_NAME = "users"
REPORTS_NAME = "user_reports"
MODEL_INFO_NAME = "model_info"
FILESCANS_NAME = "filescans"
FILENAMES_NAME = "filenames"
IMAGES_NAME = "images"
SHA256_NAME = "sha256"
DB_NAME = "airdb"

# HTTP_CODES
HTTP_UNAUTHORIZED = 401
HTTP_NOT_FOUND = 404
HTTP_BAD_REQUEST = 400
HTTP_OK = 200

# GLOBAL THRESHOLDS
ARTIFACT_RARE_COUNT = 10

# MODEL TEST STATUS GLOBALS
NOT_TESTED = "not_tested"
SEVERE = "severe"
WARNING = "warning"
PASS = "pass"


def test_summaries_to_status(
    total: int, _pass: int, fail: int, warning: int, severe: int
) -> str:
    """Get model status from test cases.

    Returns one of:
    - not_tested
    - pass
    - warning
    - severe
    """
    if total == 0:
        return NOT_TESTED
    elif severe > 0:
        return SEVERE
    elif warning / total > 0.25:
        return WARNING
    elif fail / total > 0.40:
        return WARNING
    return PASS


@alru_cache(ttl=5 * 60 * 60)
async def get_cdf(
    db: Union[AsyncMySQLDB, MySQLDB],
    category: str,
    num_bins: int = 20,
    _type: str = "fail",
) -> Tuple[np.ndarray, np.ndarray]:
    """Get the cdf for a given category."""
    cdf = []
    bins = []
    # step 1: compute the cdf for this category
    query = (
        f"SELECT MIN_PASS, MAX_PASS, "
        f"FLOOR(({category}_{_type} / {category}_total - MIN_PASS) / ((MAX_PASS - MIN_PASS) / {num_bins})) AS bin, "
        f"COUNT(*) AS count FROM model_info, "
        f"(SELECT MIN({category}_{_type} / {category}_total) AS MIN_PASS, "
        f" MAX({category}_{_type} / {category}_total) AS MAX_PASS FROM model_info) AS min_max "
        f"WHERE {category}_total >0 "
        "GROUP BY bin ORDER BY bin"
    )
    if isinstance(db, AsyncMySQLDB):
        result = await db.custom_query(query)
    else:
        result = db.custom_query(query)
    if result:
        counts = [0]  # first bin is 0  # TODO: bug?
        for row in result:
            min_pass, max_pass = float(row[0]), float(row[1])  # repeated on every row
            counts.append(float(row[3]))

        if max_pass > min_pass:
            # convert to cdf
            cdf = np.cumsum(counts)
            cdf = cdf / cdf[-1]

            bins = np.linspace(min_pass, max_pass, num_bins)
        else:
            return np.array([]), np.array([])
    else:
        return np.array([]), np.array([])

    return bins, cdf


async def test_summaries_to_rank(
    total: int,
    _pass: int,
    fail: int,
    warning: int,
    severe: int,
    db: Union[AsyncMySQLDB, MySQLDB],
    num_bins: int = 20,
    category: str = "overall",
) -> float:
    """Get a percentile rank from test results.

    Returns a float between 0 and 100.
    """
    if total == 0:
        return 0.0

    bins, cdf = await get_cdf(db, category, num_bins, "pass")
    # pass is the number of tests that passed
    # fail is the number of tests that failed, but doesn't include warning or severe
    # as of Feb 2023, the backend data is unreliable, and warning and severe are usually 0 even
    # when there are failing reports. So we'll just use the total number of tests as the denominator

    if len(bins) == 0:
        return 0.0

    value = _pass / total  # this is the value that we'll check against the cdf

    # step 2: find the percentile for this value
    idx = np.searchsorted(bins, value)

    # If the price is not in the prices array, we need to interpolate
    if idx == len(bins):
        percentile = 1.0
    elif idx == 0:
        percentile = 0.0
    else:
        # Interpolate between the two closest prices
        lower_val = bins[idx - 1]
        upper_val = bins[idx]
        lower_cdf = cdf[idx - 1]
        upper_cdf = cdf[idx]
        slope = (upper_cdf - lower_cdf) / (upper_val - lower_val)
        percentile = lower_cdf + slope * (value - lower_val)

    return percentile * 100.0


"""
SELECT   FLOOR((security_fail - MIN_PASS) / ((MAX_PASS - MIN_PASS) / 25)) AS bin,
COUNT(*) AS count FROM   model_info,   
(SELECT MIN(security_fail) AS MIN_PASS, MAX(security_fail) AS MAX_PASS FROM model_info) AS min_max WHERE security_fail != 0 GROUP BY   bin ORDER BY   bin;
"""


def check_auth(request) -> Tuple[bool, int, str]:
    """Check if the request has a valid API key"""
    # grab api token from header
    # ('Host': 'xxxx:4445', 'User-Agent': 'curl/7.68.0', 'Accept': '*/*',
    # 'Authorization': 'Bearer 5d830601986f4efbba5e875f074b7e41',
    # 'Content-Length': '28', 'Content-Type': 'application/x-www-form-urlencoded')
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return False, HTTP_UNAUTHORIZED, "No Authorization Bearer in header"

    api_key = authorization.split(" ")[1]  # Bearer <api_key>

    if api_key in request.app["api_keys"]:
        return True, HTTP_OK, "OK"

    return False, HTTP_UNAUTHORIZED, "Invalid API Key"


def resolve_purl(query: str, db_lookup: dict) -> Optional[str]:
    """Check if query is a model.

    Returns:
        Tuple[str,str]: purl if query exists, else None."""

    # is it a url? a purl? a repo?
    repos_db = db_lookup["repos_db"]
    model_info_db = db_lookup["model_info_db"]

    # url
    if is_url(query):
        purl = url_to_purl(query)

    # purl
    elif is_purl(query):
        purl = query

    # repo
    elif is_repo_name(query):
        for base in ["pkg:huggingface/", "pkg:github/"]:
            if repos_db.exists(f"{base}{query}"):
                purl = f"{base}{query}"
                return purl
        return None

    else:
        return None

    # is there a version number in the query?
    if "@" in purl:
        if model_info_db.exists(purl):
            return purl

    else:
        # unversioned ... get the latest version
        if repos_db.exists(purl):
            repo_info = repos_db.get(purl)
            versions = repo_info.get("versions", [])
            if versions:
                ordered_versions = sorted(
                    versions.items(), key=lambda x: x[1]
                )  # sort by date
                latest_version = ordered_versions[-1][0]
                return f"{purl}@{latest_version}"

    return None


async def resolve_purl_async(query: str, db_lookup: dict) -> Optional[str]:
    """Check if query is a model.

    Returns:
        Tuple[str,str]: purl if query exists, else None."""

    # is it a url? a purl? a repo?
    repos_db = db_lookup["repos_db"]
    model_info_db = db_lookup["model_info_db"]

    # url
    if is_url(query):
        purl = url_to_purl(query)

    # purl
    elif is_purl(query):
        purl = query

    # repo
    elif is_repo_name(query):
        for base in ["pkg:huggingface/", "pkg:github/"]:
            if await repos_db.exists(f"{base}{query}"):
                purl = f"{base}{query}"
                return purl
        return None

    else:
        return None

    # is there a version number in the query?
    if "@" in purl:
        if await model_info_db.exists(purl):
            return purl

    else:
        # unversioned ... get the latest version
        if await repos_db.exists(purl):
            repo_info = await repos_db.get(purl)
            versions = repo_info.get("versions", [])
            if versions:
                ordered_versions = sorted(
                    versions.items(), key=lambda x: x[1]
                )  # sort by date
                latest_version = ordered_versions[-1][0]
                purl = f"{purl}@{latest_version}"
                if await model_info_db.exists(purl):
                    return purl

    return None
