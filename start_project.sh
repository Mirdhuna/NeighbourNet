#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/home/nandha/.nvm/versions/node/v20.20.2/bin:$PATH"

# 1. Start PostgreSQL if not already running
if ! /usr/bin/psql -h "$DIR/.pgdata_socket" -p 5433 -U postgres -c "SELECT 1" >/dev/null 2>&1; then
    echo "Starting local PostgreSQL server..."
    /usr/lib/postgresql/12/bin/pg_ctl -D "$DIR/.pgdata_cluster" -o "-k $DIR/.pgdata_socket -p 5433" -l "$DIR/.pgdata_cluster/logfile" start || true
    sleep 2
fi

# 2. Set backend environment variables
export DATABASE_URL="postgresql://postgres@/neighbornet?host=$DIR/.pgdata_socket&port=5433"
export JWT_SECRET="supersecretneighbornetjwtkey2026!"
export JWT_ALGORITHM="HS256"
export JWT_EXPIRE_MINUTES="1440"
export FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

echo "=================================================="
echo " Starting NeighbourNet Backend & Frontend Services"
echo "=================================================="

# Function to clean up child processes on exit
cleanup() {
    echo ""
    echo "Shutting down NeighbourNet services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# 3. Start Backend in background
cd "$DIR/Backend"
"$DIR/Backend/venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "Backend running on http://127.0.0.1:8000 (PID: $BACKEND_PID)"

# 4. Start Frontend in background
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!
echo "Frontend running on http://127.0.0.1:5173 (PID: $FRONTEND_PID)"

echo ""
echo "NeighbourNet is ready!"
echo "Access Frontend at: http://127.0.0.1:5173"
echo "Access API Docs at: http://127.0.0.1:8000/docs"
echo "Press CTRL+C to stop all services."
echo ""

wait
