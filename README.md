# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

If OpenLens is stuck on **"Unpacking extension openlens-pod-log-controls@..."**, this update targets that directly.

## What changed to fix unpacking stalls

- Switched to a **minimal deterministic tarball** builder (manual `tar`) instead of `npm pack`.
- Bundle now contains only required files (`package.json`, `README.md`, `src/*.js`).
- Added exact compatibility entry for your OpenLens build: `6.5.2-366`.

## Recommended install path

1. Build tarball:

   ```bash
   npm run bundle
   ```

2. In OpenLens: **Extensions** -> **Install from file**.
3. Select: `dist-bundle/openlens-pod-log-controls-0.3.4.tgz`.

## Verify before install

```bash
npm run verify
```

This checks syntax, runtime helper logic, export compatibility, tarball contents, and removes temporary bundle output after verification.

## If it still hangs on "Unpacking extension"

1. Remove older versions of this extension in OpenLens extensions page.
2. Fully quit OpenLens.
3. Reopen OpenLens and install the new `0.3.4` tarball.
4. Launch OpenLens from terminal and inspect logs while installing:
   - Linux: `openlens`

## Runtime verification in OpenLens

After successful install:
1. Open Pod logs.
2. Add `healthcheck` to Log Filters.
3. Confirm old matching lines hide.
4. Confirm new matching streamed lines hide.
5. Remove chip and confirm visibility returns.
