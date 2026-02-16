export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "unknown";

const levelMatchers: Array<{ level: LogLevel; pattern: RegExp }> = [
  { level: "trace", pattern: /\btrace\b/i },
  { level: "debug", pattern: /\bdebug\b/i },
  { level: "info", pattern: /\binfo\b/i },
  { level: "warn", pattern: /\bwarn(?:ing)?\b/i },
  { level: "error", pattern: /\berr(?:or)?\b/i },
  { level: "fatal", pattern: /\bfatal\b/i }
];

export function detectLogLevel(logLine: string): LogLevel {
  for (const matcher of levelMatchers) {
    if (matcher.pattern.test(logLine)) {
      return matcher.level;
    }
  }

  return "unknown";
}

export function shouldHideLogLine(logLine: string, hiddenTerms: string[]): boolean {
  const normalized = logLine.toLowerCase();

  return hiddenTerms.some((term) => {
    const cleaned = term.trim().toLowerCase();
    return cleaned.length > 0 && normalized.includes(cleaned);
  });
}

export function classNameForLevel(level: LogLevel): string {
  switch (level) {
    case "trace":
      return "lvl-trace";
    case "debug":
      return "lvl-debug";
    case "info":
      return "lvl-info";
    case "warn":
      return "lvl-warn";
    case "error":
      return "lvl-error";
    case "fatal":
      return "lvl-fatal";
    default:
      return "lvl-unknown";
  }
}
