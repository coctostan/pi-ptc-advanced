import type { NormalizedToolResult } from "./contracts/execution-types";
import type { FileHandle, ResponseHandle, SupportedHandle } from "./contracts/handle-types";

interface ToolExecutionResult {
  content?: Array<{ type?: string; text?: string } | Record<string, unknown>>;
  details?: unknown;
}

const HANDLE_CAPABLE_TOOLS = new Set(["web_search", "fetch_content", "get_search_content", "code_search"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractTextContent(result: ToolExecutionResult): string {
  const content = Array.isArray(result.content) ? result.content : [];
  return content
    .map((item) => {
      if (isRecord(item) && item.type === "text" && typeof item.text === "string") {
        return item.text;
      }
      return "";
    })
    .join("");
}

function estimateChars(value: unknown): number {
  if (typeof value === "string") {
    return value.length;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  try {
    return JSON.stringify(value).length;
  } catch {
    return String(value).length;
  }
}

function splitNonEmptyLines(text: string, emptyMarkers: string[] = []): string[] {
  const trimmed = text.trim();
  if (!trimmed || emptyMarkers.includes(trimmed)) {
    return [];
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^\[(Showing|Use offset=|Output truncated)/.test(line));
}

function parseGrepMatches(text: string): Array<Record<string, unknown>> {
  const trimmed = text.trim();
  if (!trimmed || trimmed === "No matches found") {
    return [];
  }

  const matches: Array<Record<string, unknown>> = [];
  for (const line of trimmed.split(/\r?\n/)) {
    const match = line.match(/^(.*?)([:\-])(\d+)([:\-])\s?(.*)$/);
    if (!match) {
      continue;
    }

    const [, path, firstSep, lineNumber, secondSep, textPart] = match;
    const isContext = firstSep === "-" || secondSep === "-";
    matches.push({
      path,
      line: Number.parseInt(lineNumber, 10),
      text: textPart,
      kind: isContext ? "context" : "match",
    });
  }

  return matches;
}

function extractPtcValue(details: unknown): { found: true; value: unknown } | null {
  if (!isRecord(details) || !("ptcValue" in details)) {
    return null;
  }

  return {
    found: true,
    value: details.ptcValue,
  };
}

function pushResponseHandle(handles: SupportedHandle[], seen: Set<string>, responseId: string): void {
  const normalized = responseId.trim();
  if (!normalized) {
    return;
  }

  const key = `response:${normalized}`;
  if (seen.has(key)) {
    return;
  }

  const handle: ResponseHandle = {
    kind: "response",
    responseId: normalized,
  };
  seen.add(key);
  handles.push(handle);
}

function pushFileHandle(handles: SupportedHandle[], seen: Set<string>, filePath: string): void {
  const normalized = filePath.trim();
  if (!normalized) {
    return;
  }

  const key = `file:${normalized}`;
  if (seen.has(key)) {
    return;
  }

  const handle: FileHandle = {
    kind: "file",
    filePath: normalized,
  };
  seen.add(key);
  handles.push(handle);
}

function collectSupportedHandles(value: unknown, handles: SupportedHandle[], seen: Set<string>): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectSupportedHandles(entry, handles, seen);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (typeof value.responseId === "string") {
    pushResponseHandle(handles, seen, value.responseId);
  }

  if (typeof value.filePath === "string") {
    pushFileHandle(handles, seen, value.filePath);
  }

  for (const nested of Object.values(value)) {
    collectSupportedHandles(nested, handles, seen);
  }
}

export function extractSupportedHandles(toolName: string, normalizedValue: unknown): SupportedHandle[] {
  if (!HANDLE_CAPABLE_TOOLS.has(toolName)) {
    return [];
  }

  const handles: SupportedHandle[] = [];
  collectSupportedHandles(normalizedValue, handles, new Set<string>());
  return handles;
}

export function normalizeToolResult(toolName: string, result: ToolExecutionResult): NormalizedToolResult {
  const structuredValue = extractPtcValue(result.details);
  if (structuredValue) {
    return {
      value: structuredValue.value,
      estimatedChars: estimateChars(structuredValue.value),
    };
  }

  const text = extractTextContent(result);

  switch (toolName) {
    case "read":
      return { value: text, estimatedChars: text.length };

    case "find":
    case "glob": {
      const lines = splitNonEmptyLines(text, ["No files found matching pattern"]);
      return { value: lines, estimatedChars: estimateChars(lines) };
    }

    case "ls": {
      const lines = splitNonEmptyLines(text, ["(empty directory)"]);
      return { value: lines, estimatedChars: estimateChars(lines) };
    }

    case "grep": {
      const matches = parseGrepMatches(text);
      return { value: matches, estimatedChars: estimateChars(matches) };
    }

    case "bash": {
      const value = {
        stdout: text,
        stderr: "",
        exitCode: 0,
      };
      return { value, estimatedChars: estimateChars(value) };
    }

    case "edit": {
      const diff = isRecord(result.details) && typeof result.details.diff === "string" ? result.details.diff : null;
      const value = {
        ok: true,
        summary: text,
        diff,
      };
      return { value, estimatedChars: estimateChars(value) };
    }

    case "write": {
      const value = {
        ok: true,
        summary: text,
      };
      return { value, estimatedChars: estimateChars(value) };
    }

    default:
      return { value: text, estimatedChars: text.length };
  }
}
