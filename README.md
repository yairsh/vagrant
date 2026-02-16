# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

Understood — you mean OpenLens gets stuck during **install**.

This update adds install-compat fixes and stronger verification before you try installing:

- CommonJS + `default` exports for extension entry classes (improves loader compatibility).
- `npm run verify` now checks export shape + package contents.
- Recommended `.tgz` install flow (faster and less likely to hang than folder install).

## Install steps (recommended)

1. Build package tarball:

   ```bash
   npm run bundle
   ```

2. In OpenLens: **Extensions** -> **Install from file**.
3. Pick `dist-bundle/openlens-pod-log-controls-0.3.3.tgz`.

## How to verify before install

```bash
npm run verify
```

It checks:
- JS syntax
- runtime helper behavior
- extension export compatibility (`module.exports` + `.default`)
- tarball generation
- required files in tarball

## If OpenLens still hangs while installing

1. Restart OpenLens fully.
2. Delete previous failed version from Extensions page (if listed).
3. Re-run `npm run bundle` and install the new `.tgz`.
4. Check OpenLens logs from terminal launch:
   - Linux: run `openlens` in terminal and watch errors during install.

## Runtime verification in OpenLens

After successful install:
1. Open a pod logs tab.
2. Add filter term `healthcheck`.
3. Confirm old matching lines hide.
4. Confirm new streaming matching lines also hide.
5. Remove chip and confirm lines show again.
