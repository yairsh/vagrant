# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

You said you have trouble with `npm install` and `tsc` (`tsc: command not found`).
This version is converted to a **plain JavaScript extension** so you can use it **without npm install** and **without npm run build**.

## What it does

- Colorizes pod log lines by level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).
- Adds a multi-term hide filter panel (`Log Filters`).
- Applies to both old lines and newly streamed lines.

## How to use (no install/build required)

1. Keep this folder as-is.
2. Open OpenLens 6.5.2-366.
3. Go to **Extensions** -> **Install from file** (or local folder).
4. Select this project folder.
5. Open any Pod logs view.
6. Use **Log Filters**:
   - type a word and click **Add** (or Enter) to hide matching lines
   - click a chip (`term ×`) to remove a filter

## Commands (optional)

- `npm run build` -> no-op (prints message only)
- `npm run check` -> lightweight JS load check only

## Persistence

Hide terms are saved in local storage key:

- `openlens-log-hidden-terms`
