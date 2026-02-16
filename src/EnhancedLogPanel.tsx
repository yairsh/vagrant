import React, { useMemo, useState } from "react";
import { classNameForLevel, detectLogLevel, shouldHideLogLine } from "./log-levels";

interface EnhancedLogPanelProps {
  initialLogs?: string;
}

/**
 * This component focuses on two user features:
 * 1. Colorize logs by their severity level.
 * 2. Allow a multi-select exclusion list (array of terms) to hide matching log lines.
 */
export const EnhancedLogPanel: React.FC<EnhancedLogPanelProps> = ({ initialLogs = "" }) => {
  const [rawLogs, setRawLogs] = useState(initialLogs);
  const [termInput, setTermInput] = useState("");
  const [hiddenTerms, setHiddenTerms] = useState<string[]>([]);

  const visibleLines = useMemo(() => {
    return rawLogs
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .filter((line) => !shouldHideLogLine(line, hiddenTerms));
  }, [rawLogs, hiddenTerms]);

  const addHiddenTerm = () => {
    const trimmed = termInput.trim();
    if (!trimmed || hiddenTerms.includes(trimmed)) {
      return;
    }

    setHiddenTerms((current) => [...current, trimmed]);
    setTermInput("");
  };

  const removeHiddenTerm = (term: string) => {
    setHiddenTerms((current) => current.filter((entry) => entry !== term));
  };

  return (
    <div className="enhanced-log-panel">
      <h2>Enhanced Pod Logs</h2>

      <div className="controls">
        <label htmlFor="hide-term-input">Hide lines containing:</label>
        <div className="row">
          <input
            id="hide-term-input"
            value={termInput}
            onChange={(event) => setTermInput(event.target.value)}
            placeholder="e.g. healthcheck"
          />
          <button type="button" onClick={addHiddenTerm}>
            Add filter
          </button>
        </div>

        <div className="chips">
          {hiddenTerms.map((term) => (
            <button key={term} type="button" className="chip" onClick={() => removeHiddenTerm(term)}>
              {term} ×
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={rawLogs}
        onChange={(event) => setRawLogs(event.target.value)}
        className="raw-log-input"
        placeholder="Paste pod logs here (or wire this component to a pod log stream)."
      />

      <div className="log-viewer">
        {visibleLines.map((line, index) => {
          const level = detectLogLevel(line);
          return (
            <pre key={`${index}-${line.slice(0, 30)}`} className={`line ${classNameForLevel(level)}`}>
              {line}
            </pre>
          );
        })}
      </div>
    </div>
  );
};
