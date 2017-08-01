#!/bin/bash

SCRIPT="$(readlink -f "$0")"
RELENG="$(dirname "$SCRIPT")"
ROOT="$(dirname "$RELENG")"

VERSION=$(grep "version" "$ROOT/package.json" | grep -o -E "([[:digit:]]+\\.[[:digit:]]+\\.[[:digit:]])+")
HASH=$(hg -R "$ROOT" --debug id -i)

SERVER_VERSION="2.1.0-SNAPSHOT"

rm -rf "$ROOT/target"
mkdir "$ROOT/target"

if [ -f "~/.m2/repository/org/xowl/infra/xowl-lsp-server-xowl/$SERVER_VERSION/xowl-lsp-server-xowl-$SERVER_VERSION-jar-with-dependencies.jar" ]; then
    cp "~/.m2/repository/org/xowl/infra/xowl-lsp-server-xowl/$SERVER_VERSION/xowl-lsp-server-xowl-$SERVER_VERSION-jar-with-dependencies.jar" "$ROOT/target/server.jar"
else
    
fi

pushd "$ROOT"

vsce package

popd