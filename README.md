# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

Thanks for the details. If OpenLens is stuck on:

> Unpacking extension openlens-pod-log-controls@0.3.4

this build switches packaging again to the **canonical npm pack format** (top-level `package/`), which is what most extension installers expect.

## What changed in 0.3.5

- Bundle generation now uses `npm pack` (canonical npm tarball layout).
- Tarball includes only minimal files via `files` whitelist:
  - `package/package.json`
  - `package/src/*.js`
  - `package/README.md`
- Verification now asserts canonical `package/...` paths.

## Build/install

1. Build tarball:

   ```bash
   npm run bundle
   ```

2. In OpenLens: **Extensions** -> **Install from file**
3. Select: `dist-bundle/openlens-pod-log-controls-0.3.5.tgz`

## Verify before install

```bash
npm run verify
```

## If it still hangs on unpacking

1. Remove old failed entries in OpenLens extensions page.
2. Quit OpenLens completely.
3. Delete temp Lens extension cache folder then relaunch:
   - macOS: `~/Library/Application Support/OpenLens/lens-extensions`
4. Install `0.3.5` tarball.
5. If still failing, launch OpenLens from terminal and share the next error line after "Unpacking extension...".
