import asyncio as _ptc_asyncio
import json as _ptc_json
import os as _ptc_os
import sys as _ptc_sys
import traceback as _ptc_traceback
from typing import Any, Callable, Coroutine, Iterable, Sequence

_current_line = 0
_PTC_HOST_WORKSPACE_ROOT = globals().get("PTC_HOST_WORKSPACE_ROOT", _ptc_os.getcwd())
_PTC_RUNTIME_WORKSPACE_ROOT = globals().get("PTC_RUNTIME_WORKSPACE_ROOT", _ptc_os.getcwd())
_PTC_USER_CODE_LINE_COUNT = globals().get("PTC_USER_CODE_LINE_COUNT", 0)
_ORIGINAL_STDOUT = _ptc_sys.stdout


def _emit_protocol(message: dict[str, Any]) -> None:
    _ORIGINAL_STDOUT.write(_ptc_json.dumps(message) + "\n")
    _ORIGINAL_STDOUT.flush()


_ptc_protocol_write = _emit_protocol


class _StdoutProxy:
    def __init__(self):
        self._buffer = ""

    def write(self, text: str) -> int:
        if not text:
            return 0

        self._buffer += text
        while "\n" in self._buffer:
            line, self._buffer = self._buffer.split("\n", 1)
            _emit_protocol({"type": "stdout", "text": f"{line}\n"})
        return len(text)

    def flush(self) -> None:
        if self._buffer:
            _emit_protocol({"type": "stdout", "text": self._buffer})
            self._buffer = ""


_stdout_proxy = _StdoutProxy()


def _trace_lines(frame, event, arg):
    global _current_line

    if event != "line":
        return _trace_lines

    if frame.f_code.co_name == "user_main":
        lineno = frame.f_lineno - frame.f_code.co_firstlineno + 1
        _current_line = lineno
        try:
            _emit_protocol({"type": "execution_progress", "line": lineno, "total_lines": _PTC_USER_CODE_LINE_COUNT})
        except Exception:
            pass

    return _trace_lines


def _host_abspath(path: str) -> str:
    if _ptc_os.path.isabs(path):
        runtime_root = _ptc_os.path.normpath(_PTC_RUNTIME_WORKSPACE_ROOT)
        normalized = _ptc_os.path.normpath(path)
        if normalized == runtime_root or normalized.startswith(f"{runtime_root}{_ptc_os.sep}"):
            relative_path = _ptc_os.path.relpath(normalized, runtime_root)
            return _ptc_os.path.normpath(_ptc_os.path.join(_PTC_HOST_WORKSPACE_ROOT, relative_path))
        return normalized

    return _ptc_os.path.normpath(_ptc_os.path.join(_PTC_HOST_WORKSPACE_ROOT, path))


def _extract_text(result: Any) -> str:
    """Extract raw text from a ReadResult dict, or return as-is if already a string."""
    if isinstance(result, str):
        return result
    if isinstance(result, dict) and "lines" in result:
        return "\n".join(line.get("raw", "") for line in result["lines"])
    return str(result)

def _relativize_path(abs_path: str) -> str:
    """Convert an absolute path to a workspace-relative path if under the host workspace root."""
    if not _ptc_os.path.isabs(abs_path):
        return abs_path
    root = _ptc_os.path.normpath(_PTC_HOST_WORKSPACE_ROOT)
    normed = _ptc_os.path.normpath(abs_path)
    if normed == root or normed.startswith(f"{root}{_ptc_os.sep}"):
        return _ptc_os.path.relpath(normed, root)
    return abs_path


def _normalize_grep_result(result: Any) -> Any:
    """Normalize grep result paths to be relative to the workspace root."""
    if not isinstance(result, dict) or "records" not in result:
        return result
    for record in result.get("records", []):
        if isinstance(record, dict) and "path" in record:
            record["path"] = _relativize_path(record["path"])
    return result

_SUPPORTED_HANDLE_KINDS = {"response", "file"}


def _push_response_handle(handles: list[SupportedHandle], seen: set[str], response_id: str) -> None:
    normalized = response_id.strip()
    if not normalized:
        return

    key = f"response:{normalized}"
    if key in seen:
        return

    seen.add(key)
    handles.append({"kind": "response", "responseId": normalized})


def _push_file_handle(handles: list[SupportedHandle], seen: set[str], file_path: str) -> None:
    normalized = file_path.strip()
    if not normalized:
        return

    key = f"file:{normalized}"
    if key in seen:
        return

    seen.add(key)
    handles.append({"kind": "file", "filePath": normalized})


def _collect_supported_handles(value: Any, handles: list[SupportedHandle], seen: set[str]) -> None:
    if isinstance(value, list):
        for entry in value:
            _collect_supported_handles(entry, handles, seen)
        return

    if not isinstance(value, dict):
        return

    response_id = value.get("responseId")
    if isinstance(response_id, str):
        _push_response_handle(handles, seen, response_id)

    file_path = value.get("filePath")
    if isinstance(file_path, str):
        _push_file_handle(handles, seen, file_path)

    for nested in value.values():
        _collect_supported_handles(nested, handles, seen)


def _normalize_handle_kind(kind: str | None) -> str | None:
    if kind is None:
        return None
    if kind not in _SUPPORTED_HANDLE_KINDS:
        supported = ", ".join(sorted(_SUPPORTED_HANDLE_KINDS))
        raise ValueError(f"Unsupported handle kind '{kind}'. Expected one of: {supported}")
    return kind


def _expect_kind(value: Any, kind: str) -> Any:
    expected_kind = kind.strip()
    if not expected_kind:
        raise ValueError("Expected kind must be a non-empty string")
    if not isinstance(value, dict):
        raise ValueError(f"Expected kind '{expected_kind}', but value has no top-level kind field (got {type(value).__name__})")
    actual_kind = value.get("kind")
    if not isinstance(actual_kind, str):
        state = "missing" if actual_kind is None else f"non-string {type(actual_kind).__name__}"
        raise ValueError(f"Expected kind '{expected_kind}', but value has {state} top-level kind")
    actual_kind = actual_kind.strip() or "<empty>"
    if actual_kind != expected_kind:
        raise ValueError(f"Expected kind '{expected_kind}', got '{actual_kind}'")
    return value


def _clone_json_value(value: Any) -> Any:
    return _ptc_json.loads(_ptc_json.dumps(value))


def _normalize_callable_tool_name(name: str) -> str:
    if not isinstance(name, str):
        raise ValueError(f"Tool name must be a non-empty string (got {type(name).__name__})")
    normalized = name.strip()
    if not normalized:
        raise ValueError("Tool name must be a non-empty string")
    return normalized


def _normalize_orchestration_calls(calls: Any) -> list[dict[str, Any]]:
    if not isinstance(calls, Sequence) or isinstance(calls, (str, bytes, bytearray)):
        raise ValueError("Tool calls must be a non-empty sequence of call specs")
    if len(calls) == 0:
        raise ValueError("Tool calls must be a non-empty sequence of call specs")

    normalized_calls: list[dict[str, Any]] = []
    for index, entry in enumerate(calls):
        if not isinstance(entry, dict):
            raise ValueError(f"Call spec at index {index} must be an object")

        tool_name = entry.get("tool")
        if not isinstance(tool_name, str) or not tool_name.strip():
            raise ValueError(f"Call spec at index {index} must include a non-empty 'tool' string")

        params = entry.get("params", {})
        if params is None:
            params = {}
        if not isinstance(params, dict):
            raise ValueError(f"Call spec at index {index} for tool '{tool_name.strip()}' must use an object for 'params'")

        normalized_calls.append({
            "tool": tool_name.strip(),
            "params": dict(params),
        })

    return normalized_calls


def _normalize_orchestration_limit(limit: Any, default_limit: int) -> int:
    if limit is None:
        return max(1, default_limit)
    if isinstance(limit, bool) or not isinstance(limit, int):
        raise ValueError(f"max_concurrency must be a positive integer (got {type(limit).__name__})")
    if limit < 1:
        raise ValueError("max_concurrency must be a positive integer")
    return limit


def _summarize_orchestration_error(error: Exception) -> str:
    summary = " ".join(str(error).splitlines()).strip()
    if not summary:
        summary = error.__class__.__name__
    if len(summary) > 160:
        return summary[:157] + "..."
    return summary
class _PtcHelpers:
    def __init__(self, max_parallel_tool_calls: int, callable_tool_metadata: Sequence[dict[str, Any]] | None = None):
        self.max_parallel_tool_calls = max(1, max_parallel_tool_calls)
        metadata = callable_tool_metadata if callable_tool_metadata is not None else []
        self._callable_tool_metadata = [
            entry for entry in _clone_json_value(list(metadata)) if isinstance(entry, dict)
        ]
        self._callable_tool_lookup: dict[str, dict[str, Any]] = {}
        available_names: set[str] = set()
        for entry in self._callable_tool_metadata:
            for key in ("name", "pythonName"):
                value = entry.get(key)
                if isinstance(value, str):
                    normalized = value.strip()
                    if normalized:
                        self._callable_tool_lookup[normalized] = entry
                        available_names.add(normalized)
        self._available_callable_tool_names = sorted(available_names)

    async def gather_limit(self, coroutines: Iterable[Coroutine[Any, Any, Any]], limit: int | None = None):
        semaphore = _ptc_asyncio.Semaphore(max(1, limit or self.max_parallel_tool_calls))

        async def _runner(coro: Coroutine[Any, Any, Any]):
            async with semaphore:
                return await coro

        return await _ptc_asyncio.gather(*[_runner(coro) for coro in coroutines])

    async def find_files(self, pattern: str, path: str = ".", max_files: int = 1000) -> Sequence[str]:
        return await glob(pattern=pattern, path=path, limit=max_files)

    async def find_files_abs(self, pattern: str, path: str = ".", max_files: int = 1000) -> Sequence[str]:
        files = await self.find_files(pattern=pattern, path=path, max_files=max_files)
        base_path = _host_abspath(path)
        return [item if _ptc_os.path.isabs(item) else _ptc_os.path.join(base_path, item) for item in files]

    async def read_text(self, path: str, offset: int | None = None, limit: int | None = None) -> str:
        result = await read(path=path, offset=offset, limit=limit)
        return _extract_text(result)

    async def read_many(
        self,
        paths: Sequence[str],
        max_concurrency: int | None = None,
        *,
        offset: int | None = None,
        line_limit: int | None = None,
    ) -> Sequence[str]:
        results = await self.gather_limit(
            [read(path=path, offset=offset, limit=line_limit) for path in paths],
            limit=max_concurrency,
        )
        return [_extract_text(r) for r in results]


    async def batch_tool(self, calls: Sequence[dict[str, Any]], max_concurrency: int | None = None) -> list[Any]:
        normalized_calls = _normalize_orchestration_calls(calls)
        concurrency = _normalize_orchestration_limit(max_concurrency, self.max_parallel_tool_calls)
        results = await self.gather_limit(
            [_rpc_call(entry["tool"], dict(entry["params"])) for entry in normalized_calls],
            limit=concurrency,
        )
        return list(results)

    async def read_tree(
        self,
        pattern: str,
        path: str = ".",
        max_files: int = 1000,
        concurrency: int | None = None,
        offset: int | None = None,
        line_limit: int | None = None,
    ) -> Sequence[dict[str, Any]]:
        files = await self.find_files_abs(pattern=pattern, path=path, max_files=max_files)
        contents = await self.read_many(files, max_concurrency=concurrency, offset=offset, line_limit=line_limit)
        return [
            {
                "path": file_path,
                "content": content,
            }
            for file_path, content in zip(files, contents)
        ]

    def extract_handles(self, value: Any, kind: str | None = None) -> list[SupportedHandle]:
        normalized_kind = _normalize_handle_kind(kind)
        handles: list[SupportedHandle] = []
        _collect_supported_handles(value, handles, set())
        if normalized_kind is None:
            return handles
        return [handle for handle in handles if handle["kind"] == normalized_kind]

    def first_handle(self, value: Any, kind: str | None = None) -> SupportedHandle | None:
        handles = self.extract_handles(value, kind=kind)
        return handles[0] if handles else None

    def expect_kind(self, value: Any, kind: str) -> Any:
        return _expect_kind(value, kind)


    def list_callable_tools(self) -> list[dict[str, Any]]:
        return _clone_json_value(self._callable_tool_metadata)

    def get_tool_schema(self, name: str) -> dict[str, Any]:
        normalized_name = _normalize_callable_tool_name(name)
        tool_metadata = self._callable_tool_lookup.get(normalized_name)
        if tool_metadata is None:
            available = ", ".join(self._available_callable_tool_names) or "<none>"
            raise ValueError(f"Unknown callable tool '{normalized_name}'. Available: {available}")
        parameters = tool_metadata.get("parameters")
        if not isinstance(parameters, dict):
            raise ValueError(f"Callable tool '{normalized_name}' does not expose an object parameter schema")
        return _clone_json_value(parameters)


    async def first_success(self, calls: Sequence[dict[str, Any]], max_concurrency: int | None = None) -> Any:
        normalized_calls = _normalize_orchestration_calls(calls)
        _normalize_orchestration_limit(max_concurrency, self.max_parallel_tool_calls)
        failures: list[str] = []

        for entry in normalized_calls:
            try:
                return await _rpc_call(entry["tool"], dict(entry["params"]))
            except Exception as error:
                failures.append(f"{entry['tool']}: {_summarize_orchestration_error(error)}")

        raise ValueError("All candidate tool calls failed: " + "; ".join(failures))

    def json_dump(self, value: Any) -> str:
        return _ptc_json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True)


ptc = _PtcHelpers(
    globals().get("PTC_MAX_PARALLEL_TOOL_CALLS", 8),
    globals().get("_PTC_CALLABLE_TOOL_METADATA", []),
)


# Post-process wrapper: normalize grep record paths to workspace-relative.
# The generated grep() wrapper calls _rpc_call("grep", params) and returns
# whatever the RPC returns. When the hashline bridge is active, record paths
# are absolute. This wrapper normalizes them.
_generated_grep = globals().get("grep")
if callable(_generated_grep):
    async def grep(**kwargs):
        result = await _generated_grep(**kwargs)
        return _normalize_grep_result(result)


def _stringify_output(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list, tuple, bool, int, float)):
        return _ptc_json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True)
    return str(value)


async def _runtime_main(user_main: Callable[[], Coroutine[Any, Any, Any]]):
    try:
        await _rpc.start_reader()
        _ptc_sys.settrace(_trace_lines)
        _ptc_sys.stdout = _stdout_proxy
        output = await user_main()
        _stdout_proxy.flush()
        _ptc_sys.stdout = _ORIGINAL_STDOUT
        _ptc_sys.settrace(None)
        _emit_protocol({"type": "complete", "output": _stringify_output(output)})
    except Exception as error:
        _ptc_sys.stdout = _ORIGINAL_STDOUT
        _ptc_sys.settrace(None)
        _emit_protocol(
            {
                "type": "error",
                "message": str(error),
                "traceback": _ptc_traceback.format_exc(),
            }
        )
        _ptc_sys.exit(1)
    finally:
        await _rpc.cleanup()
