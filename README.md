# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

If OpenLens is stuck on:

> Unpacking extension openlens-pod-log-controls@...

use one of these **alternative install methods**.

## Method A (tgz) - canonical npm bundle

1. Build tarball:

   ```bash
   npm run bundle
   ```

2. Install in OpenLens -> **Extensions** -> **Install from file**.
3. Select `dist-bundle/openlens-pod-log-controls-0.3.6.tgz`.

## Method B (no unpacking in OpenLens) - install unpacked folder directly

This bypasses OpenLens tar unpack step entirely.

### Automatic (macOS/Linux)

```bash
npm run install:local
```

It copies the unpacked extension to:
- macOS: `~/Library/Application Support/OpenLens/lens-extensions/openlens-pod-log-controls`
- Linux: `~/.config/OpenLens/lens-extensions/openlens-pod-log-controls`

Then fully restart OpenLens.

### Manual

```bash
npm run bundle:dir
```

Then copy `dist-unpacked/openlens-pod-log-controls` into your OpenLens `lens-extensions` directory and restart OpenLens.

## Verify before install

```bash
npm run verify
```

Checks:
- JS syntax
- helper runtime behavior
- export shape (`module.exports` + `.default`)
- tgz content layout

## Runtime verification in OpenLens

After install:
1. Open Pod logs.
2. Add filter term `healthcheck`.
3. Confirm old matching lines hide.
4. Confirm new matching streamed lines hide.
5. Remove chip and confirm visibility returns.
