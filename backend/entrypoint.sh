#!/bin/sh
set -e

: "${DATABASE_URL:?Need to set DATABASE_URL env var}"

RETRIES=${DB_RETRIES:-30}
SLEEP=${DB_SLEEP:-2}

echo "Waiting for database to become available..."
i=0
until python - <<PY
import os, sys, socket
from urllib.parse import urlparse
url = urlparse(os.environ['DATABASE_URL'])
host = url.hostname
port = url.port or (5432 if url.scheme.startswith('postgres') else 0)
s = socket.socket()
try:
    s.settimeout(1)
    s.connect((host, port))
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
do
  i=$((i+1))
  if [ "$i" -ge "$RETRIES" ]; then
    echo "Timed out waiting for database"
    exit 1
  fi
  echo "waiting... ($i/$RETRIES)"
  sleep $SLEEP
done

exec "$@"