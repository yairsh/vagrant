import { classNameForLevel, detectLogLevel, shouldHideLogLine } from "./log-levels";

const STORAGE_KEY = "openlens-log-hidden-terms";

const POD_LOG_ROOT_SELECTORS = [
  ".PodLogs",
  '[data-testid="pod-logs"]',
  '[class*="PodLogs"]'
];

const LOG_LINE_SELECTORS = [
  '[data-testid="pod-log-line"]',
  ".LogLine",
  '[class*="LogLine"]'
];

const LEVEL_CLASSES = ["lvl-trace", "lvl-debug", "lvl-info", "lvl-warn", "lvl-error", "lvl-fatal", "lvl-unknown"];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function loadHiddenTerms(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveHiddenTerms(terms: string[]): void {
  const normalized = unique(terms.map((term) => term.trim()).filter(Boolean));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

function queryFirst(selectors: string[], root: ParentNode = document): HTMLElement | null {
  for (const selector of selectors) {
    const match = root.querySelector<HTMLElement>(selector);
    if (match) return match;
  }

  return null;
}

export class PodLogEnhancer {
  private hiddenTerms = loadHiddenTerms();
  private observer: MutationObserver | null = null;
  private panel: HTMLDivElement | null = null;
  private chips: HTMLDivElement | null = null;
  private hostRoot: HTMLElement | null = null;

  activate(): void {
    this.hostRoot = queryFirst(POD_LOG_ROOT_SELECTORS);
    this.injectOrMovePanel();
    this.applyToAllLines(this.hostRoot ?? document.body);

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

  deactivate(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.panel?.remove();
    this.panel = null;
    this.chips = null;
    this.hostRoot = null;
  }

  private containsPodLogs(node: HTMLElement): boolean {
    return POD_LOG_ROOT_SELECTORS.some((selector) => Boolean(node.querySelector(selector)));
  }

  private isInsidePodLogs(node: HTMLElement): boolean {
    return POD_LOG_ROOT_SELECTORS.some((selector) => node.matches(selector) || Boolean(node.closest(selector)));
  }

  private lineText(el: HTMLElement): string {
    return el.innerText || el.textContent || "";
  }

  private applyToAllLines(root: ParentNode): void {
    const selectors = unique(LOG_LINE_SELECTORS).join(",");
    const lineElements = Array.from(root.querySelectorAll<HTMLElement>(selectors));

    for (const line of lineElements) {
      if (!this.isInsidePodLogs(line)) continue;
      this.decorateLine(line);
    }
  }

  private decorateLine(line: HTMLElement): void {
    const text = this.lineText(line);
    const level = detectLogLevel(text);

    line.classList.remove(...LEVEL_CLASSES);
    line.classList.add(classNameForLevel(level));

    if (shouldHideLogLine(text, this.hiddenTerms)) {
      line.style.display = "none";
      line.setAttribute("data-openlens-log-hidden", "true");
    } else {
      line.style.removeProperty("display");
      line.removeAttribute("data-openlens-log-hidden");
    }
  }

  private injectOrMovePanel(): void {
    if (!this.panel) {
      this.panel = this.buildPanel();
    }

    const parent = this.hostRoot ?? document.body;
    if (!parent.contains(this.panel)) {
      parent.appendChild(this.panel);
    }

    this.renderChips();
  }

  private buildPanel(): HTMLDivElement {
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
      this.applyToAllLines(this.hostRoot ?? document.body);
    };

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addButton.click();
      }
    });

    row.append(input, addButton);

    const chips = document.createElement("div");
    chips.className = "chips";

    panel.append(title, row, chips);
    this.chips = chips;

    return panel;
  }

  private renderChips(): void {
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
        this.applyToAllLines(this.hostRoot ?? document.body);
      };

      this.chips?.appendChild(chip);
    });
  }
}
