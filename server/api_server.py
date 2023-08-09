import argparse
import logging
import os
import uuid
from typing import List

from aiohttp import web
from aiohttp_remotes import ForwardedRelaxed, XForwardedRelaxed
from pythonjsonlogger import jsonlogger  # pip install python-json-logger

# from airdb.storage.mysql import AsyncMySQLDB
from airdb.storage.mysql_async import AsyncMySQLDB

# routes defined externally
from server.routes.alive import alive
from server.routes.file_info import file_info
from server.routes.get_image import get_image
from server.routes.get_report import get_report
from server.routes.model_info import model_info
from server.routes.register_user import register_user
from server.routes.report_vote import report_vote
from server.routes.search import search
from server.routes.similar import similar
from server.routes.submit_report import submit_report
from server.routes.top_models import top_models
from server.routes.top_orgs import top_orgs
from server.routes.top_reports import top_reports
from server.routes.top_users import top_users
from server.routes.upload_image import upload_image
from server.routes.utils.common import (
    DB_NAME,
    FILESCANS_NAME,
    IMAGES_NAME,
    MODEL_INFO_NAME,
    REPORTS_NAME,
    REPOS_NAME,
    SBOM_NAME,
    SCANS_NAME,
    SHA256_NAME,
    USERS_NAME,
)
from server.routes.validate_query import validate_query

logging.basicConfig(level=logging.DEBUG)

#### GLOBALS
# SERVER
DEFAULT_PORT = "4445"
ROUTES = web.RouteTableDef()


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="API webserver.")
    parser.add_argument(
        "--port", type=str, default=DEFAULT_PORT, help="Port to listen on."
    )
    parser.add_argument(
        "--host", type=str, default="localhost", help="Host to listen on."
    )
    parser.add_argument(
        "--api_key_file",
        type=str,
        default="API_KEY.secret",
        help="File from which to read in valid API keys",
    )
    parser.add_argument(
        "--create_if_not_api_key",
        action="store_true",
        help="Create a new API key if it does not exist.",
    )
    return parser.parse_args()


def main():
    """Main entry point for the webserver."""
    args = parse_args()

    # Handle API keys
    api_keys: List[str] = []
    if os.path.exists(args.api_key_file):
        with open(args.api_key_file, "r", encoding="utf-8") as infile:
            api_keys.extend(infile.read().splitlines())
    else:
        if args.create_if_not_api_key:
            api_key = uuid.uuid4().hex
            with open(args.api_key_file, "w", encoding="utf-8") as outfile:
                outfile.write(api_key)
            api_keys.extend([api_key])

    # create the app
    app = web.Application()

    # get valid API keys
    app["api_keys"] = set(api_keys)

    # get connection to databases
    scans_db = AsyncMySQLDB(SCANS_NAME, DB_NAME)
    reports_db = AsyncMySQLDB(REPORTS_NAME, DB_NAME)
    repos_db = AsyncMySQLDB(REPOS_NAME, DB_NAME)
    users_db = AsyncMySQLDB(USERS_NAME, DB_NAME)
    sbom_db = AsyncMySQLDB(SBOM_NAME, DB_NAME)
    model_info_db = AsyncMySQLDB(MODEL_INFO_NAME, DB_NAME)
    filescans_db = AsyncMySQLDB(FILESCANS_NAME, DB_NAME)
    sha256_db = AsyncMySQLDB(SHA256_NAME, DB_NAME)
    images_db = AsyncMySQLDB(IMAGES_NAME, DB_NAME)
    filenames_db = AsyncMySQLDB(FILESCANS_NAME, DB_NAME)

    app["sbom_db"] = sbom_db
    app["users_db"] = users_db
    app["repos_db"] = repos_db
    app["reports_db"] = reports_db
    app["scans_db"] = scans_db
    app["model_info_db"] = model_info_db
    app["filescans_db"] = filescans_db
    app["sha256_db"] = sha256_db
    app["images_db"] = images_db
    app["filenames_db"] = filenames_db

    # set up json logging for easier parsing
    handler = logging.FileHandler("server/api_requests.json")
    handler.setFormatter(jsonlogger.JsonFormatter(rename_fields={"message": "status"}))

    # prevent "message" from appearing in logs
    request_log = logging.getLogger("request_log")
    request_log.setLevel(logging.INFO)
    request_log.addHandler(handler)

    app["request_log"] = request_log

    # set up Zapier integration
    app["zapier_endpoint"] = os.environ.get(
        "ZAPIER_ENDPOINT", "https://hooks.zapier.com/hooks/catch/11038953/3bvfnv6"
    )

    # add remaining routes
    app.add_routes(
        [
            web.get("/api/validate_query", validate_query),
            web.get("/api/model_info", model_info),
            web.get("/api/alive", alive),
            web.get("/api/top_models", top_models),
            web.get("/api/top_reports", top_reports),
            web.get("/api/top_users", top_users),
            web.get("/api/top_orgs", top_orgs),
            web.get("/api/model_info", model_info),
            web.get("/api/file_info", file_info),
            web.get("/api/get_report", get_report),
            web.get("/api/search", search),
            web.get("/api/similar", similar),
            web.get("/api/get_image", get_image),
            web.post("/api/register_user", register_user),
            web.post("/api/submit_report", submit_report),
            web.post("/api/report_vote", report_vote),
            web.post("/api/upload_image", upload_image),
        ]
    )

    for route in app.router.routes():
        print(f'{route.method}\t{route.get_info()["path"]}')

    # needed when we sit behind a TLS-terminating
    # proxy like Caddy.
    # see: https://aiohttp-remotes.readthedocs.io/en/stable/api.html#forwarded
    # see: https://github.com/aio-libs/aiohttp-remotes/blob/master/aiohttp_remotes/forwarded.py#L15
    forwarded_relaxed = ForwardedRelaxed()
    xforwarded_relaxed = XForwardedRelaxed()

    app.middlewares.extend(
        [forwarded_relaxed.middleware, xforwarded_relaxed.middleware]
    )

    web.run_app(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
