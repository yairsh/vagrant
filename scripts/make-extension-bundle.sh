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

# IMPORTANT: OpenLens expects package.json at archive root (not under package/).
mkdir -p "$TMP_DIR/src" "$OUT_DIR"
cp package.json "$TMP_DIR/package.json"
cp README.md "$TMP_DIR/README.md"
cp src/*.js "$TMP_DIR/src/"

# Build a deterministic minimal tarball for OpenLens install.
tar -czf "$OUT_DIR/$TARBALL_NAME" -C "$TMP_DIR" .

echo "Created: $OUT_DIR/$TARBALL_NAME"
