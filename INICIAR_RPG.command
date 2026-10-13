#!/bin/sh
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 41731 --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
elif command -v node >/dev/null 2>&1; then
  node "$DIR/js/offline-server.mjs" >/dev/null 2>&1 &
else
  osascript -e 'display alert "RPG Master" message "Python 3 ou Node.js é necessário para iniciar o servidor local."'
  exit 1
fi
i=0
until curl -fsS "http://127.0.0.1:41731/" >/dev/null 2>&1 || [ "$i" -ge 30 ]; do sleep 1; i=$((i+1)); done
open "http://127.0.0.1:41731/"
