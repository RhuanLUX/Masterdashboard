#!/bin/sh
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
node "$DIR/js/offline-server.mjs" >/dev/null 2>&1 &
sleep 1
open "http://127.0.0.1:41731/"
