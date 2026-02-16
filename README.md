# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

This repository was cleaned up to fix a bad merge that left both TypeScript and JavaScript variants.
The current committed code is now **single-path JavaScript only**.

## What it does

- Colorizes pod log lines by level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).
- Adds a multi-term hide filter panel (`Log Filters`).
- Applies to both old lines and newly streamed lines.

## Clean project layout (after merge fix)

- `src/main.js` - OpenLens main extension entry.
- `src/renderer.js` - OpenLens renderer extension entry.
- `src/log-levels.js` - level detection + line-hide matching.
- `src/pod-log-enhancer.js` - DOM observer, filter UI, live stream handling.

Removed duplicate/stale TypeScript/demo files from earlier merge attempts.

## How to use (no install/build required)

1. Open OpenLens 6.5.2-366.
2. Go to **Extensions** -> **Install from file** (or local folder).
3. Select this project folder.
4. Open any Pod logs view.
5. Use **Log Filters**:
   - type a word and click **Add** (or Enter) to hide matching lines
   - click a chip (`term ×`) to remove a filter

## Commands (optional)

- `npm run build` -> no-op (prints message only)
- `npm run check` -> lightweight JS load check

## Persistence

Hide terms are saved in local storage key:

- `openlens-log-hidden-terms`
