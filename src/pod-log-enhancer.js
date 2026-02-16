const { classNameForLevel, detectLogLevel, shouldHideLogLine } = require("./log-levels");

const STORAGE_KEY = "openlens-log-hidden-terms";
const STYLE_ID = "openlens-log-controls-style";

const POD_LOG_ROOT_SELECTORS = [".PodLogs", '[data-testid="pod-logs"]', '[class*="PodLogs"]'];
const LOG_LINE_SELECTORS = ['[data-testid="pod-log-line"]', ".LogLine", '[class*="LogLine"]'];
const LEVEL_CLASSES = ["lvl-trace", "lvl-debug", "lvl-info", "lvl-warn", "lvl-error", "lvl-fatal", "lvl-unknown"];

const STYLE_TEXT = `
.openlens-log-controls { position: sticky; top: 8px; margin: 8px; z-index: 20; background: rgba(24,24,28,.95); border: 1px solid #3c4043; border-radius: 8px; padding: 10px; display: grid; gap: 8px; }
.openlens-log-controls .title { font-weight: 700; font-size: 13px; }
.openlens-log-controls .row { display: flex; gap: 6px; }
.openlens-log-controls input { flex: 1; min-width: 0; }
.openlens-log-controls .chips { display: flex; flex-wrap: wrap; gap: 6px; }
.openlens-log-controls .chip { border: 1px solid #5f6368; border-radius: 999px; padding: 2px 8px; background: transparent; color: inherit; cursor: pointer; font-size: 12px; }
.lvl-trace { color: #9aa0a6 !important; }
.lvl-debug { color: #8ab4f8 !important; }
.lvl-info { color: #34a853 !important; }
.lvl-warn { color: #fbbc04 !important; }
.lvl-error { color: #ea4335 !important; }
.lvl-fatal { color: #ff6d00 !important; font-weight: 700 !important; }
`;

function unique(values) {
  return [...new Set(values)];
}

function loadHiddenTerms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveHiddenTerms(terms) {
  const normalized = unique(terms.map((t) => String(t).trim()).filter(Boolean));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

function queryFirst(selectors, root = document) {
  for (const selector of selectors) {
    const match = root.querySelector(selector);
    if (match) return match;
  }
  return null;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_TEXT;
  document.head.appendChild(style);
}

function isLineElement(node) {
  return LOG_LINE_SELECTORS.some((selector) => node.matches(selector));
}

function findLineElements(node) {
  const found = [];
  if (!(node instanceof HTMLElement)) return found;
  if (isLineElement(node)) found.push(node);

  const selector = LOG_LINE_SELECTORS.join(",");
  found.push(...node.querySelectorAll(selector));
  return found;
}

class PodLogEnhancer {
  constructor() {
    this.hiddenTerms = loadHiddenTerms();
    this.rootObserver = null;
    this.logObserver = null;
    this.panel = null;
    this.chips = null;
    this.hostRoot = null;
    this.pendingLines = new Set();
    this.flushScheduled = false;
  }

  activate() {
    ensureStyles();
    this.attachToCurrentRoot();

    // watch only for pod log root mount/unmount; avoid expensive per-node full document rescans
    this.rootObserver = new MutationObserver(() => {
      const nextRoot = queryFirst(POD_LOG_ROOT_SELECTORS);
      if (nextRoot !== this.hostRoot) {
        this.detachLogObserver();
        this.hostRoot = nextRoot;
        this.injectOrMovePanel();
        this.attachLogObserver();
        this.enqueueRootLines();
      }
    });

    this.rootObserver.observe(document.body, { childList: true, subtree: true });
  }

  deactivate() {
    if (this.rootObserver) this.rootObserver.disconnect();
    this.rootObserver = null;
    this.detachLogObserver();

    if (this.panel) this.panel.remove();
    this.panel = null;
    this.chips = null;
    this.hostRoot = null;
    this.pendingLines.clear();
    this.flushScheduled = false;
  }

  attachToCurrentRoot() {
    this.hostRoot = queryFirst(POD_LOG_ROOT_SELECTORS);
    this.injectOrMovePanel();
    this.attachLogObserver();
    this.enqueueRootLines();
  }

  attachLogObserver() {
    if (!this.hostRoot) return;

    this.logObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const lines = findLineElements(node);
          for (const line of lines) {
            this.pendingLines.add(line);
          }
        }
      }

      this.scheduleFlush();
    });

    this.logObserver.observe(this.hostRoot, { childList: true, subtree: true });
  }

  detachLogObserver() {
    if (this.logObserver) this.logObserver.disconnect();
    this.logObserver = null;
  }

  enqueueRootLines() {
    if (!this.hostRoot) return;
    const selector = LOG_LINE_SELECTORS.join(",");
    for (const line of this.hostRoot.querySelectorAll(selector)) {
      this.pendingLines.add(line);
    }
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (this.flushScheduled) return;
    this.flushScheduled = true;

    const run = () => {
      this.flushScheduled = false;
      this.flushPendingLines();
    };

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(run);
      return;
    }

    setTimeout(run, 0);
  }

  flushPendingLines() {
    if (!this.pendingLines.size) return;

    for (const line of this.pendingLines) {
      this.decorateLine(line);
    }

    this.pendingLines.clear();
  }

  decorateLine(line) {
    const text = line.innerText || line.textContent || "";
    const level = detectLogLevel(text);

    line.classList.remove(...LEVEL_CLASSES);
    line.classList.add(classNameForLevel(level));

    if (shouldHideLogLine(text, this.hiddenTerms)) {
      line.style.display = "none";
    } else {
      line.style.removeProperty("display");
    }
  }

  refreshVisibleLines() {
    this.enqueueRootLines();
  }

  injectOrMovePanel() {
    if (!this.panel) this.panel = this.buildPanel();
    const parent = this.hostRoot || document.body;
    if (!parent.contains(this.panel)) parent.prepend(this.panel);
    this.renderChips();
  }

  buildPanel() {
    const panel = document.createElement("div");
    panel.className = "openlens-log-controls";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = "Log Filters";

    const row = document.createElement("div");
    row.className = "row";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Hide lines containing...";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add";
    addButton.onclick = () => {
      const value = input.value.trim();
      if (!value || this.hiddenTerms.includes(value)) return;
      this.hiddenTerms = [...this.hiddenTerms, value];
      saveHiddenTerms(this.hiddenTerms);
      input.value = "";
      this.renderChips();
      this.refreshVisibleLines();
    };

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addButton.click();
      }
    });

    row.append(input, addButton);

    this.chips = document.createElement("div");
    this.chips.className = "chips";

    panel.append(title, row, this.chips);
    return panel;
  }

  renderChips() {
    if (!this.chips) return;
    this.chips.innerHTML = "";

    this.hiddenTerms.forEach((term) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = `${term} ×`;
      chip.onclick = () => {
        this.hiddenTerms = this.hiddenTerms.filter((t) => t !== term);
        saveHiddenTerms(this.hiddenTerms);
        this.renderChips();
        this.refreshVisibleLines();
      };
      this.chips.appendChild(chip);
    });
  }
}

module.exports = { PodLogEnhancer };
