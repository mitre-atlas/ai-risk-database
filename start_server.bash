#!/bin/bash
# get environment variables from named files, if they exist
if [ -f "DB_ENDPOINT" ]; then
  export DB_ENDPOINT=`cat DB_ENDPOINT`
fi
if [ -f "DB_USER" ]; then
  export DB_USER=`cat DB_USER`
fi
if [ -f "DB_PASSWORD" ]; then
  export DB_PASSWORD=`cat DB_PASSWORD`
fi
if [ -f "GITLAB_CLIENT_ID" ]; then
  export GITLAB_CLIENT_ID=`cat GITLAB_CLIENT_ID`
fi
if [ -f "GITHUB_CLIENT_SCRET" ]; then
  export GITHUB_CLIENT_SECRET=`cat GITHUB_CLIENT_SECRET`
fi
if [ -f "ZAPIER_ENDPOINT" ]; then
  export ZAPIER_ENDPOINT=`cat ZAPIER_ENDPOINT`
fi

# use getopts to parse command line arguments
PROD=false
SUDO=false
LOAD_BALANCE=1
DOMAIN="http://localhost:8080"

while getopts ":pshl:d:-:" opt; do
  case ${opt} in
    p )
      PROD=true
      ;;
    s )
      SUDO=true
      ;;
    l )
      LOAD_BALANCE=$OPTARG
      ;;
    d )
      DOMAIN=$OPTARG
      ;;
    - )
      case "${OPTARG}" in
        load_balance=* )
          LOAD_BALANCE="${OPTARG#*=}"
          ;;
        domain=* )
          DOMAIN="${OPTARG#*=}"
          ;;
        prod )
          PROD=true
          ;;
        sudo )
          SUDO=true
          ;;
        help )
          echo "Usage: $(basename $0) [-p] [-s] [-l num] [--domain=domain]"
          echo "  -p, --prod           run in production mode (default: false)"
          echo "  -s, --sudo           run with sudo (default: false)"
          echo "  -l num, --load_balance=num"
          echo "                       number of endpoints to use in load balancing (default: 1)"
          echo "  --domain=domain      the domain to use (default: https://localhost:8080)"
          exit 0
          ;;
        * )
          echo "Invalid option: --${OPTARG}" >&2
          exit 1
          ;;
      esac;;
    \? )
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    : )
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

if [[ "$PROD" == true ]]; then
  SUDO=true
fi

echo "PROD mode: $PROD"
echo "SUDO mode: $SUDO"
echo "Load balance: $LOAD_BALANCE"
echo "Domain: $DOMAIN"

# # start Python API Servers
LB_ENDPOINTS=()
API_PIDS=()
for ((b=0; b<$LOAD_BALANCE; b++)); do
  port=$((4445+b))
  python -m server.api_server --api_key_file server/API_KEY.secret --port $port & 
  API_PIDS+=("$!")
  LB_ENDPOINTS+=("http://localhost:$port")
done

echo "Load Balancing Endponts: ${LB_ENDPOINTS[*]}"

# start the frontend server
if [[ "$PROD" == true ]]; then
    # run docker in detached mode (background)
    CONTAINER_ID=$(docker run -d --network=host --name airdb-frontend-container airdb-frontend)
else
    (cd frontend; npm run dev) &   # staging, with debugging
    FRONTEND_PID="$!"
fi

# now start the caddy reverse proxy, requiring sudo to bind to reserved ports only if --prod is set
cd server
sed "s#LB_ENDPOINTS#${LB_ENDPOINTS[*]}#" Caddyfile.template > Caddyfile
if [[ "$SUDO" == true ]]; then
  sudo DOMAIN="$DOMAIN" LB_ENDPOINTS="$LB_ENDPOINTS" API_KEY=`cat API_KEY.secret` caddy run --watch
else
  DOMAIN="$DOMAIN" LB_ENDPOINTS="$LB_ENDPOINTS" API_KEY=`cat API_KEY.secret` caddy run --watch
fi


# when we CTRL-C to kill the Caddy server, also kill the backend processes
if [[ "$PROD" == true ]]; then
    docker stop airdb-frontend-container
    docker rm airdb-frontend-container
else
    kill ${FRONTEND_PID}
fi

for pid in "${API_PIDS[@]}"; do
    kill ${pid}
done