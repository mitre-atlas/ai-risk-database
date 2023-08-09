# docker build -t server -f docker/server.Dockerfile .

FROM python:3.9-alpine

WORKDIR /server

COPY requirements-server.txt .
RUN pip install -r requirements-server.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 4445

# --api_key_file server/API_KEY.secret --port $port
CMD ["python", "-m", "server.api_server", "--host", "0.0.0.0", "--port", "4445", "--api_key_file", "/run/secrets/api_key"]

