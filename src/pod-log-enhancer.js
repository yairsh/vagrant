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

class PodLogEnhancer {
  constructor() {
    this.hiddenTerms = loadHiddenTerms();
    this.observer = null;
    this.panel = null;
    this.chips = null;
    this.hostRoot = null;
  }

  activate() {
    ensureStyles();
    this.hostRoot = queryFirst(POD_LOG_ROOT_SELECTORS);
    this.injectOrMovePanel();
    this.applyToAllLines(this.hostRoot || document.body);

    this.observer = new MutationObserver((mutations) => {
      const maybeHost = queryFirst(POD_LOG_ROOT_SELECTORS);
      if (maybeHost && maybeHost !== this.hostRoot) {
        this.hostRoot = maybeHost;
        this.injectOrMovePanel();
        this.applyToAllLines(this.hostRoot);
      }

      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (!this.isInsidePodLogs(node) && !this.containsPodLogs(node)) return;
          this.applyToAllLines(node);
        });
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  deactivate() {
    if (this.observer) this.observer.disconnect();
    this.observer = null;
    if (this.panel) this.panel.remove();
    this.panel = null;
    this.chips = null;
    this.hostRoot = null;
  }

  containsPodLogs(node) {
    return POD_LOG_ROOT_SELECTORS.some((selector) => Boolean(node.querySelector(selector)));
  }

  isInsidePodLogs(node) {
    return POD_LOG_ROOT_SELECTORS.some((selector) => node.matches(selector) || Boolean(node.closest(selector)));
  }

  applyToAllLines(root) {
    const selectors = unique(LOG_LINE_SELECTORS).join(",");
    const lines = Array.from(root.querySelectorAll(selectors));
    for (const line of lines) {
      if (!this.isInsidePodLogs(line)) continue;
      this.decorateLine(line);
    }
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
      this.applyToAllLines(this.hostRoot || document.body);
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
        this.applyToAllLines(this.hostRoot || document.body);
      };
      this.chips.appendChild(chip);
    });
  }
}

module.exports = { PodLogEnhancer };
