#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Build unpacked extension first
TARGET_BUILD_DIR="dist-unpacked/openlens-pod-log-controls"
./scripts/make-unpacked-extension.sh "$TARGET_BUILD_DIR" >/tmp/openlens_unpack.out
cat /tmp/openlens_unpack.out

# Detect default OpenLens extensions directory
OS_NAME="$(uname -s)"
case "$OS_NAME" in
  Darwin)
    EXT_DIR="$HOME/Library/Application Support/OpenLens/lens-extensions/openlens-pod-log-controls"
    ;;
  Linux)
    EXT_DIR="$HOME/.config/OpenLens/lens-extensions/openlens-pod-log-controls"
    ;;
  *)
    echo "Unsupported OS for automatic install: $OS_NAME" >&2
    echo "Manual copy from $TARGET_BUILD_DIR to your OpenLens lens-extensions directory." >&2
    exit 1
    ;;
esac

mkdir -p "$(dirname "$EXT_DIR")"
rm -rf "$EXT_DIR"
cp -R "$TARGET_BUILD_DIR" "$EXT_DIR"

echo "Installed unpacked extension to: $EXT_DIR"
echo "Restart OpenLens completely after this command."
