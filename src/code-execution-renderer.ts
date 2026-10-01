import type { Theme } from "@mariozechner/pi-coding-agent";
import { Text, truncateToWidth, visibleWidth, type Component } from "@mariozechner/pi-tui";
import type { ExecutionDetails } from "./contracts/execution-types";
import { renderPtcReportLines } from "./report";

interface RenderOptions {
  expanded: boolean;
  isPartial: boolean;
  expandHint: string;
}

// Source is already split into physical lines by the execution boundary.
// Remove only the CR left by CRLF splitting, without touching stored metadata.
function displayLine(line: string): string {
  return line.replace(/\r$/, "");
}

function validCurrentLine(details: ExecutionDetails | undefined): number | undefined {
  const line = details?.currentLine;
  return Number.isInteger(line) && line! >= 1 && line! <= (details?.userCode?.length ?? 0)
    ? line : undefined;
}

export function formatPythonSourceLines(
  codeLines: readonly string[],
  theme: Pick<Theme, "fg">,
  currentLine?: number
): string[] {
  return codeLines.map((line, index) => {
    const lineNumber = index + 1;
    const content = displayLine(line);
    if (lineNumber === currentLine) {
      return theme.fg("success", `→ ${String(lineNumber).padStart(2, " ")} │ `) + theme.fg("text", content);
    }
    const prefix = theme.fg("muted", `${String(lineNumber).padStart(3, " ")} │ `);
    return prefix + (currentLine && lineNumber < currentLine ? theme.fg("muted", content) : content);
  });
}

export function formatSourcePreview(codeLines: readonly string[], width: number, expandHint: string): string {
  if (!codeLines.length) return "";
  const label = `Python source: ${codeLines.length} ${codeLines.length === 1 ? "line" : "lines"}: `;
  // Match Text's tab display before measuring, so tabs cannot cause a second row.
  const firstLine = displayLine(codeLines[0]).replace(/\t/g, "   ") || "(blank line)";
  const hint = expandHint ? ` (${expandHint})` : "";
  const full = label + firstLine + hint;
  // Prefer source to a hint when there is not room for both. Never format later lines.
  return visibleWidth(full) <= width ? full : truncateToWidth(label + firstLine, width, "…");
}

export function formatCodeExecutionLines(
  resultText: string,
  details: ExecutionDetails | undefined,
  options: RenderOptions,
  theme: Pick<Theme, "fg">,
  width: number
): string[] {
  const { expanded, isPartial, expandHint } = options;
  const codeLines = details?.userCode;
  const currentLine = validCurrentLine(details);
  let lines: string[];

  if (isPartial && codeLines?.length) {
    const total = Number.isInteger(details?.totalLines) && details!.totalLines! >= (currentLine ?? 1)
      ? details!.totalLines! : codeLines.length;
    const progress = currentLine === undefined ? "" : ` (line ${currentLine}/${total})`;
    lines = [theme.fg("muted", `Executing Python code${progress}:`)];
    if (resultText) lines.push("", resultText);
  } else if (details) {
    const summary = theme.fg("muted",
      `[PTC] nested calls=${details.nestedToolCalls}, nested results=${details.nestedResultCount}, ` +
      `estimated avoided tokens≈${details.estimatedAvoidedTokens}, duration=${Math.round(details.durationMs / 1000)}s`
    );
    let body: string[];
    if (details.failure) {
      const failure = details.failure;
      const status = theme.fg("error", "Python execution failed");
      if (expanded) {
        body = [status, resultText || failure.message];
        if (failure.traceback && !body.join("\n").includes(failure.traceback)) body.push(failure.traceback);
      } else {
        body = [status, truncateToWidth(failure.message.replace(/[\r\n]+/g, " "), width, "…")];
      }
    } else {
      body = details.report ? renderPtcReportLines(details.report, expanded) : [resultText || "(No output)"];
    }
    lines = [summary, "", ...body];
  } else {
    lines = [resultText || "(No output)"];
  }

  if (codeLines?.length) {
    lines.push("");
    if (expanded) {
      // Keep the existing progress view's heading, with the same source formatter.
      if (!isPartial) lines.push(theme.fg("muted", "Python source"));
      lines.push(...formatPythonSourceLines(codeLines, theme, isPartial ? currentLine : undefined));
    } else {
      lines.push(theme.fg("muted", formatSourcePreview(codeLines, width, expandHint)));
    }
  }
  return lines;
}

export function renderCodeExecutionResult(
  resultText: string,
  details: ExecutionDetails | undefined,
  options: RenderOptions,
  theme: Theme
): Component {
  // Width and theme are evaluated at render time. No cache/state survives a redraw.
  return {
    render(width) {
      return new Text(formatCodeExecutionLines(resultText, details, options, theme, width).join("\n"), 0, 0).render(width);
    },
    invalidate() {},
  };
}
