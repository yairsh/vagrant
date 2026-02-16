# OpenLens Pod Log Controls Plugin (OpenLens 6.5.2-366)

This extension augments the **existing OpenLens pod logs view**.

## What it does

- Colorizes pod log lines by level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).
- Adds a multi-term hide filter panel (`Log Filters`).
- Applies to:
  - already visible lines, and
  - newly streamed lines.

## Install / use on OpenLens 6.5.2-366

1. Build the extension package files:

   ```bash
   npm install
   npm run build
   ```

2. In OpenLens:
   - Open **Extensions**.
   - Click **Install from file** (or local folder, depending on your UI).
   - Select this extension directory/package.

3. Open any Pod logs tab.
   - You should see a **Log Filters** panel attached to the pod logs view.
   - Type a term and click **Add** (or press Enter) to hide matching lines.
   - Click a chip (`term ×`) to remove a filter.

## Persistence

Filter terms are saved in browser storage key:

- `openlens-log-hidden-terms`

## Technical notes

- Compatible metadata is set for OpenLens `6.5.2`. See `package.json` (`lens.compatibleVersions`).
- The enhancer watches pod log DOM updates with `MutationObserver` so incoming stream lines are filtered and colorized immediately.
- The extension intentionally scopes processing to pod logs containers/selectors to avoid coloring unrelated `pre` elements elsewhere in Lens.
