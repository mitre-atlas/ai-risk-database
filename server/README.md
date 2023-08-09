# AI Risk Database Server

This directory contains the AI Risk Database Python [API server](https://docs.aiohttp.org/en/stable/) source code and [Caddy](https://caddyserver.com/docs/) reverse proxy configuration file.

## Getting Started

### API Server

Ensure `Python 3.9+` is available.

From the root project directory:

```
# Install dependencies
pip install -r requirements-server.txt

# Run the development server
python -m server.api_server --port 4445 --api_key_file <path_to_api_key_file>
```

`Ctrl+C` to stop the running server.

To check that the server is operational:
```
$ curl -I  http://localhost:4445/api/alive

HTTP/1.1 200 OK
Content-Length: 0
Content-Type: application/octet-stream
Date: Mon, 31 Jul 2023 17:23:16 GMT
Server: Python/3.9 aiohttp/3.8.4
```

### Reverse Proxy

The `Caddyfile.template` file in this directory configures the reverse proxy. The `start_server.bash` script additionally configures load balancing servers, but for a quickstart using the port specified above, run this command from this directory:

`LB_ENDPOINTS=http://localhost:4445 caddy run --adapter Caddyfile.template`

### Docker

See the files `docker/server.Dockerfile` and `docker-compose.yml` for Docker-based setup.
