#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${1:-dist-bundle}"
mkdir -p "$OUT_DIR"

# Use npm's canonical pack format for maximum compatibility with OpenLens.
# This creates a tarball with a top-level `package/` folder exactly like npm registry packages.
npm pack --silent --pack-destination "$OUT_DIR" >/tmp/openlens_pack_name.out
TARBALL_NAME="$(cat /tmp/openlens_pack_name.out | tail -n 1)"

echo "Created: $OUT_DIR/$TARBALL_NAME"
