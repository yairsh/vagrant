#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${1:-dist-unpacked/openlens-pod-log-controls}"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/src"

cp package.json "$OUT_DIR/package.json"
cp README.md "$OUT_DIR/README.md"
cp src/*.js "$OUT_DIR/src/"

echo "Created unpacked extension at: $OUT_DIR"
