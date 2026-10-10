#!/usr/bin/env bash
# Hornets Tactics Board: build the offline snapshot, then serve on 127.0.0.1:4280.
#   ./run.sh           build + serve
#   ./run.sh --test    build + smoke test (writes tests/smoke-test.log) + serve
#   ./run.sh --shots   build + re-shoot screenshots + serve
set -euo pipefail
cd "$(dirname "$0")"
PORT=4280
python3 build.py
if [[ "${1:-}" == "--shots" ]]; then node --experimental-websocket tests/screens.mjs; fi
if [[ "${1:-}" == "--test" ]]; then python3 tests/smoke_test.py | tee tests/smoke-test.log; fi
if ss -ltn | grep -q "127.0.0.1:$PORT "; then echo "already serving on http://127.0.0.1:$PORT/"; else
  nohup python3 server.py > /tmp/hornets-tactics-$PORT.log 2>&1 &
  sleep 1; echo "serving http://127.0.0.1:$PORT/ (pid $!)  ·  offline file: dist/hornets-tactics.html"; fi
