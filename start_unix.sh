#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/CareerX-AI-Backend"
python3 -m venv .venv || true
source .venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env 2>/dev/null || true
python run.py &
BACKEND_PID=$!
cd "$ROOT/CareerX-AI-Frontend"
npm install
npm run dev
kill "$BACKEND_PID" || true
