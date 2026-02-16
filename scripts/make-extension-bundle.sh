#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${1:-dist-bundle}"
VERSION="$(node -p "require('./package.json').version")"
NAME="$(node -p "require('./package.json').name")"
TARBALL_NAME="${NAME}-${VERSION}.tgz"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/package/src" "$OUT_DIR"
cp package.json "$TMP_DIR/package/package.json"
cp README.md "$TMP_DIR/package/README.md"
cp src/*.js "$TMP_DIR/package/src/"

# Build a deterministic minimal tarball for OpenLens install.
# This avoids npm-pack side effects and keeps unpacking very fast.
tar -czf "$OUT_DIR/$TARBALL_NAME" -C "$TMP_DIR" package

echo "Created: $OUT_DIR/$TARBALL_NAME"
