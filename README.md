# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

If OpenLens says:

> invalid extension bundle, package.json not found

it means the tarball layout is wrong for OpenLens. This update fixes that by placing `package.json` at the **archive root**.

## What changed

- Bundle format changed to root layout:
  - `./package.json`
  - `./README.md`
  - `./src/*.js`
- Removed nested `package/` tarball layout.
- Verification now explicitly checks root-level `./package.json` in the tarball.

## Build/install

1. Build tarball:

   ```bash
   npm run bundle
   ```

2. Install in OpenLens:
   - **Extensions** -> **Install from file**
   - Select `dist-bundle/openlens-pod-log-controls-0.3.4.tgz`

## Verify before install

```bash
npm run verify
```

This verifies:
- JS syntax
- helper runtime behavior
- export shape (`module.exports` + `.default`)
- tarball includes required root files (including `./package.json`)
