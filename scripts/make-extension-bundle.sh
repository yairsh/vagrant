#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${1:-dist-bundle}"
mkdir -p "$OUT_DIR"

TARBALL_NAME="$(npm pack --silent)"
mv "$TARBALL_NAME" "$OUT_DIR/"

echo "Created: $OUT_DIR/$TARBALL_NAME"
