#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/5] Syntax check JS files"
node --check src/main.js
node --check src/renderer.js
node --check src/log-levels.js
node --check src/pod-log-enhancer.js

echo "[2/5] Runtime unit check (log-level helpers)"
node ./scripts/verify-runtime.js

echo "[3/5] Export shape check (default + CJS)"
node ./scripts/verify-exports.js

echo "[4/5] Create package tarball"
./scripts/make-extension-bundle.sh >/tmp/openlens_bundle.out
cat /tmp/openlens_bundle.out
TARBALL_PATH="$(awk '{print $2}' /tmp/openlens_bundle.out)"

echo "[5/5] Verify tarball contents"
tar -tzf "$TARBALL_PATH" | sed 's#^package/##' | sort

for required in \
  package/src/main.js \
  package/src/renderer.js \
  package/src/log-levels.js \
  package/src/pod-log-enhancer.js \
  package/package.json
  do
  if ! tar -tzf "$TARBALL_PATH" | grep -q "$required"; then
    echo "ERROR: missing from tarball: $required" >&2
    exit 1
  fi
done

# Keep workspace clean after verify
rm -rf dist-bundle

echo "Verification passed"
