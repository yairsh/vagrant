const LEVEL_MATCHERS = [
  { level: "trace", pattern: /\btrace\b/i },
  { level: "debug", pattern: /\bdebug\b/i },
  { level: "info", pattern: /\binfo\b/i },
  { level: "warn", pattern: /\bwarn(?:ing)?\b/i },
  { level: "error", pattern: /\berr(?:or)?\b/i },
  { level: "fatal", pattern: /\bfatal\b/i }
];

function detectLogLevel(logLine) {
  for (const matcher of LEVEL_MATCHERS) {
    if (matcher.pattern.test(logLine)) {
      return matcher.level;
    }
  }

  return "unknown";
}

function shouldHideLogLine(logLine, hiddenTerms) {
  const normalized = String(logLine).toLowerCase();

  return hiddenTerms.some((term) => {
    const cleaned = String(term).trim().toLowerCase();
    return cleaned.length > 0 && normalized.includes(cleaned);
  });
}

function classNameForLevel(level) {
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

module.exports = {
  detectLogLevel,
  shouldHideLogLine,
  classNameForLevel
};
