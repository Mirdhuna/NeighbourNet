#!/usr/bin/env bash
set -e

# Start PostgreSQL if not running
if ! /usr/bin/psql -h /home/nandha/NeighbourNet/.pgdata_socket -p 5433 -U postgres -c "SELECT 1" >/dev/null 2>&1; then
    echo "Starting local PostgreSQL server on socket /home/nandha/NeighbourNet/.pgdata_socket port 5433..."
    /usr/lib/postgresql/12/bin/pg_ctl -D /home/nandha/NeighbourNet/.pgdata_cluster -o "-k /home/nandha/NeighbourNet/.pgdata_socket -p 5433" -l /home/nandha/NeighbourNet/.pgdata_cluster/logfile start || true
    sleep 2
fi

export DATABASE_URL="postgresql://postgres@/neighbornet?host=/home/nandha/NeighbourNet/.pgdata_socket&port=5433"
export JWT_SECRET="supersecretneighbornetjwtkey2026!"
export JWT_ALGORITHM="HS256"
export JWT_EXPIRE_MINUTES="1440"
export FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

cd /home/nandha/NeighbourNet/Backend
exec /home/nandha/NeighbourNet/Backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
