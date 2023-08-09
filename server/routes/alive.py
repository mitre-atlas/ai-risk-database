"""GET /api/alive. Check if the server is alive."""
from aiohttp import web

from server.routes.utils.common import HTTP_OK


# @ROUTES.get("/api/alive")
async def alive(request: web.Request) -> web.Response:
    """Check if the server is alive.

    GET /api/alive

    Returns (status, text):
        200, ""
    """
    # GET /api/alive
    request.app["request_log"].info(
        "success",
        extra={"headers": dict(request.headers), "query": dict(request.rel_url.query)},
    )
    return web.Response(status=HTTP_OK)
