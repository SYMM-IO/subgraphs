#!/usr/bin/env python3
"""Web dashboard for SYMMIO subgraph fleet.

Mirrors the capabilities of fleet.py (interactive CLI) but serves a browser
dashboard — reuses the same config scanning and Goldsky state parsers.

Run locally:
    uv run scripts/fleet_web.py           # binds 127.0.0.1:8787
    uv run scripts/fleet_web.py --port 9000

Goldsky has no public management API, so every action still shells out to the
`goldsky` CLI. The server intentionally binds to loopback by default.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import DictLoader, Environment, select_autoescape

try:
    from scripts.fleet_identity import FLEET_HEALTH_PAYLOAD
    from scripts.pipeline_updater import (
        PipelineDependency,
        load_pipeline_dependencies,
        parse_pipeline_definition_versions,
        update_managed_pipelines,
    )
except ModuleNotFoundError:  # Direct execution via `python scripts/fleet_web.py`.
    from fleet_identity import FLEET_HEALTH_PAYLOAD
    from pipeline_updater import (
        PipelineDependency,
        load_pipeline_dependencies,
        parse_pipeline_definition_versions,
        update_managed_pipelines,
    )


# ────────────────────────────────────────────────────────────────────
# Shared constants
# ────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIGS_DIR = REPO_ROOT / "configs" / "perps"
FLEET_UI_DIST = REPO_ROOT / "fleet-ui" / "dist"
FLEET_UI_INDEX = FLEET_UI_DIST / "index.html"

MODULES = ["perps/analytics", "perps/events"]

# Goldsky public project ID — used to build GraphQL endpoint URLs in the UI.
GOLDSKY_PROJECT_ID = "project_cm1hfr4527p0f01u85mz499u8"
COMMON_TOOL_DIRS = [
    "/usr/local/bin",
    "/opt/homebrew/bin",
]
GOLDSKY_BIN_ENV = "GOLDSKY_BIN"


def goldsky_endpoint(base: str, ver_or_tag: str) -> str:
    return f"https://api.goldsky.com/api/public/{GOLDSKY_PROJECT_ID}/subgraphs/{base}/{ver_or_tag}/gn"


def resolve_tool(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found
    for tool_dir in COMMON_TOOL_DIRS:
        candidate = Path(tool_dir) / name
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


def build_tool_env(base_env: dict[str, str] | None = None) -> dict[str, str]:
    """Return a child-process environment that preserves GUI tool discovery."""
    env = dict(os.environ if base_env is None else base_env)
    existing_path = env.get("PATH", "")
    path_parts = [*COMMON_TOOL_DIRS]
    if existing_path:
        path_parts.append(existing_path)
    env["PATH"] = os.pathsep.join(path_parts)

    goldsky = resolve_tool("goldsky")
    if goldsky:
        env[GOLDSKY_BIN_ENV] = goldsky
    return env

# Prod chain configs — "prod only" preset selects exactly these.
PROD_CONFIGS = {
    "base",
    "base_lc",
    "bnb",
    "blast",
    "hyperevm",
    "mantle",
    "plasma",
    "sonic",
    "arbitrum",
    "bera",
}

# Stage / test chain configs — "stage only" preset selects exactly these.
STAGE_CONFIGS = {
    "hyperevm_stage",
    "base_lc_test",
    "fantom_just_8_0",
}

# Chain config key → DefiLlama icon slug. Icons served from
# https://icons.llamao.fi/icons/chains/rsz_<slug>. Chains not listed use
# their own key as the slug (most match).
CHAIN_LOGO_SLUG: dict[str, str] = {
    "base": "base",
    "base_lc": "base",
    "base_stage": "base",
    "base_lc_test": "base",
    "arbitrum": "arbitrum",
    "bnb": "bsc",
    "blast": "blast",
    "hyperevm": "hyperliquid",
    "hyperevm_stage": "hyperliquid",
    "mantle": "mantle",
    "plasma": "plasma-2",
    "sonic": "sonic",
    "bera": "berachain",
    "fantom_just_8_0": "fantom",
    "mode": "mode",
}


def chain_logo_url(chain_key: str) -> str | None:
    slug = CHAIN_LOGO_SLUG.get(chain_key)
    if slug is None:
        return None
    return f"https://icons.llamao.fi/icons/chains/rsz_{slug}?w=48&h=48"


# ────────────────────────────────────────────────────────────────────
# Data classes + Goldsky output parser
# ────────────────────────────────────────────────────────────────────


@dataclass
class ChainConfig:
    """A chain/config pair — one entry per JSON file under configs/perps."""

    key: str
    path: Path
    network: str
    deploy_urls: dict[str, str]  # module → goldsky subgraph base name

    @classmethod
    def from_file(cls, path: Path) -> "ChainConfig | None":
        try:
            with open(path) as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            return None
        urls_raw = data.get("deploy_urls") or {}
        urls: dict[str, str] = {}
        for mod, val in urls_raw.items():
            if isinstance(val, str):
                urls[mod] = val
            elif isinstance(val, dict) and "goldsky" in val:
                urls[mod] = val["goldsky"]
        if not urls:
            return None
        return cls(
            key=path.stem,
            path=path,
            network=data.get("network", "?"),
            deploy_urls=urls,
        )


@dataclass
class Deployment:
    """A single versioned deployment on Goldsky (e.g. base_analytics/v0.1.1)."""

    base_name: str
    version: str
    status: str = ""
    synced: str = ""
    blocks_from: int | None = None
    blocks_to: int | None = None
    chain_network: str = ""

    @property
    def full(self) -> str:
        return f"{self.base_name}/{self.version}"


@dataclass
class GoldskyState:
    """Parsed snapshot of `goldsky subgraph list`."""

    deployments: dict[str, Deployment] = field(default_factory=dict)
    tags: dict[str, dict[str, str]] = field(default_factory=dict)
    managed_pipeline_versions: dict[str, dict[str, tuple[str, ...]]] = field(default_factory=dict)
    verified_managed_pipelines: set[str] = field(default_factory=set)

    def for_base(self, base_name: str) -> list[Deployment]:
        return [d for d in self.deployments.values() if d.base_name == base_name]

    def tag_target(self, base_name: str, tag: str) -> str | None:
        return self.tags.get(base_name, {}).get(tag)


_DEPLOY_HEADER = re.compile(r"^\*\s+([A-Za-z0-9_\-]+)/([^\s]+)$")
_TAG_LINE = re.compile(r"^\*\s+([A-Za-z0-9_\-]+)/([^\s]+)\s+->\s+([A-Za-z0-9_\-]+)/([^\s]+)$")
_STATUS_LINE = re.compile(r"Status:\s+(\S+)")
_SYNCED_LINE = re.compile(r"Synced:\s+(\S+)")
_BLOCKS_LINE = re.compile(r"Blocks indexed:\s+(\d+)\s+->\s+(\d+)")
_CHAIN_LINE = re.compile(r"Chain:\s+(\S+)")


def parse_goldsky_list(text: str) -> GoldskyState:
    """Parse the text output of `goldsky subgraph list` into a GoldskyState."""
    text = re.sub(r"\x1b\[[0-9;]*m", "", text)  # strip ANSI colour codes
    state = GoldskyState()
    current: Deployment | None = None
    for raw in text.splitlines():
        stripped = raw.rstrip().strip()
        m = _TAG_LINE.match(stripped)
        if m:
            src_name, tag, dst_name, dst_version = m.groups()
            if src_name == dst_name:
                state.tags.setdefault(src_name, {})[tag] = dst_version
            current = None
            continue
        m = _DEPLOY_HEADER.match(stripped)
        if m:
            current = Deployment(base_name=m.group(1), version=m.group(2))
            state.deployments[current.full] = current
            continue
        if current is None:
            continue
        if (m := _STATUS_LINE.search(stripped)):
            current.status = m.group(1)
            continue
        if (m := _SYNCED_LINE.search(stripped)):
            current.synced = m.group(1)
            continue
        if (m := _BLOCKS_LINE.search(stripped)):
            current.blocks_from = int(m.group(1))
            current.blocks_to = int(m.group(2))
            continue
        if (m := _CHAIN_LINE.search(stripped)):
            current.chain_network = m.group(1)


    return state


def scan_chains() -> list[ChainConfig]:
    """Scan configs/perps/*.json and return all valid chain configs."""
    chains: list[ChainConfig] = []
    for path in sorted(CONFIGS_DIR.glob("*.json")):
        c = ChainConfig.from_file(path)
        if c is not None:
            chains.append(c)
    return chains

# Priority order — chains listed here render first, in this order.
# Anything not listed is sorted alphabetically after.
CHAIN_ORDER: list[str] = [
    "base",
    "arbitrum",
    "bnb",
    "hyperevm",
    "mantle",
    "blast",
    "sonic",
    "plasma",
    "bera",
    "hyperevm_stage",
]


def _chain_sort_key(key: str) -> tuple[int, int | str]:
    if key in CHAIN_ORDER:
        return (0, CHAIN_ORDER.index(key))
    return (1, key)


def _version_sort_key(version: str) -> tuple[tuple[int, int | str], ...]:
    """Sort version labels naturally, so v0.2.10 follows v0.2.9."""
    return tuple((0, int(part)) if part.isdigit() else (1, part.lower()) for part in re.findall(r"\d+|\D+", version))


def _latest_deployed_version(state: GoldskyState, base: str) -> str:
    deployments = state.for_base(base)
    return max(deployments, key=lambda deployment: _version_sort_key(deployment.version)).version if deployments else ""


def fetch_managed_pipeline_versions(
    dependencies: dict[str, list[PipelineDependency]],
) -> tuple[dict[str, dict[str, tuple[str, ...]]], set[str]]:
    """Read live source versions for repository-managed Goldsky pipelines."""
    goldsky = resolve_tool("goldsky")
    if not goldsky:
        return {}, set()

    versions: dict[str, dict[str, tuple[str, ...]]] = {}
    verified: set[str] = set()
    pipeline_names = sorted({dependency.pipeline for matches in dependencies.values() for dependency in matches})
    for pipeline in pipeline_names:
        try:
            result = subprocess.run(
                [goldsky, "pipeline", "get", pipeline, "--definition", "--output", "yaml", "--color", "false"],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                continue
            versions[pipeline] = parse_pipeline_definition_versions(result.stdout)
            verified.add(pipeline)
        except (OSError, subprocess.TimeoutExpired, ValueError, yaml.YAMLError):
            continue

    return versions, verified


# ────────────────────────────────────────────────────────────────────
# State & Goldsky interaction (web-safe; no sys.exit, no Rich console)
# ────────────────────────────────────────────────────────────────────


class FleetStore:
    """In-memory cache of Goldsky state + chain configs.

    Thread-safe because FastAPI may run requests concurrently (sync endpoints
    go through a thread pool).
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._state: GoldskyState = GoldskyState()
        self._chains: list[ChainConfig] = []
        self._last_fetched_at: float = 0.0
        self._last_error: str = ""
        self.rescan_chains()

    def rescan_chains(self) -> None:
        with self._lock:
            self._chains = scan_chains()

    @property
    def chains(self) -> list[ChainConfig]:
        return self._chains

    @property
    def state(self) -> GoldskyState:
        return self._state

    @property
    def last_fetched_at(self) -> float:
        return self._last_fetched_at

    @property
    def last_error(self) -> str:
        return self._last_error

    def fetch(self) -> tuple[bool, str]:
        """Shell out to `goldsky subgraph list` and parse the output.

        Returns (success, error_message). On failure keeps the previous state.
        """
        goldsky = resolve_tool("goldsky")
        if not goldsky:
            with self._lock:
                self._last_error = "goldsky CLI not found on PATH or in /usr/local/bin / /opt/homebrew/bin"
            return False, self._last_error
        try:
            proc = subprocess.run(
                [goldsky, "subgraph", "list"],
                capture_output=True,
                text=True,
                timeout=60,
            )
        except subprocess.TimeoutExpired:
            with self._lock:
                self._last_error = "goldsky subgraph list timed out after 60s"
            return False, self._last_error
        if proc.returncode != 0:
            msg = (proc.stderr or proc.stdout or "goldsky failed").strip()
            with self._lock:
                self._last_error = msg
            return False, msg
        new_state = parse_goldsky_list(proc.stdout)
        pipeline_dependencies = load_pipeline_dependencies()
        new_state.managed_pipeline_versions, new_state.verified_managed_pipelines = fetch_managed_pipeline_versions(pipeline_dependencies)
        with self._lock:
            self._state = new_state
            self._last_fetched_at = time.time()
            self._last_error = ""
        return True, ""

    # ── Optimistic local-state mutations ────────────────────────────
    # `goldsky subgraph list` has some eventual-consistency lag after a write.
    # We apply the change locally so the UI reflects it immediately; the next
    # manual refresh (or next /refresh call) reconciles with authoritative state.

    def apply_tag_set(self, base: str, tag: str, version: str) -> None:
        with self._lock:
            self._state.tags.setdefault(base, {})[tag] = version

    def apply_tag_remove(self, base: str, tag: str) -> None:
        with self._lock:
            if base in self._state.tags:
                self._state.tags[base].pop(tag, None)
                if not self._state.tags[base]:
                    del self._state.tags[base]

    def apply_deployment_remove(self, base: str, version: str) -> None:
        with self._lock:
            self._state.deployments.pop(f"{base}/{version}", None)
            # Also clear any tags that were pointing at this (now-gone) version.
            if base in self._state.tags:
                stale_tags = [t for t, v in self._state.tags[base].items() if v == version]
                for t in stale_tags:
                    del self._state.tags[base][t]
                if not self._state.tags[base]:
                    del self._state.tags[base]

    def apply_pipeline_versions(self, subgraph_versions: dict[str, str]) -> None:
        """Optimistically mirror successful pipeline updates in the UI cache."""
        dependencies = load_pipeline_dependencies()
        with self._lock:
            for subgraph, version in subgraph_versions.items():
                for dependency in dependencies.get(subgraph, []):
                    self._state.managed_pipeline_versions.setdefault(dependency.pipeline, {})[subgraph] = (version,)
                    self._state.verified_managed_pipelines.add(dependency.pipeline)


# ────────────────────────────────────────────────────────────────────
# Job registry (for long-running deploy commands)
# ────────────────────────────────────────────────────────────────────


class Job:
    """Unified activity item — tracks both long-running subprocess jobs (deploys)
    and short-lived operations (tag, delete, promote, refresh) so the user can
    see every action the server is doing in one activity pane."""

    __slots__ = (
        "id",
        "label",
        "kind",
        "cmd",
        "steps",
        "current_step_index",
        "current_step_label",
        "completed_steps",
        "status",
        "rc",
        "started",
        "ended",
        "lines",
        "_q",
        "_thread",
        "_last_broadcast",
    )

    def __init__(self, label: str, cmd: list[str] | None = None, kind: str = "op", steps: list[tuple[str, list[str]]] | None = None) -> None:
        self.id = uuid.uuid4().hex[:12]
        self.label = label
        self.kind = kind  # deploy|tag|untag|delete|promote|refresh|op
        self.cmd = cmd or []
        self.steps = steps or []
        self.current_step_index = 0
        self.current_step_label = ""
        self.completed_steps = 0
        self.status = "queued"  # queued|running|done|failed
        self.rc: int | None = None
        self.started: float = 0.0
        self.ended: float = 0.0
        self.lines: list[str] = []
        self._q: queue.Queue[str | None] = queue.Queue()
        self._thread: threading.Thread | None = None
        self._last_broadcast: float = 0.0

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self) -> None:
        self.status = "running"
        self.started = time.time()
        broadcast_activity()
        try:
            if self.steps:
                failed = False
                for i, (step_label, cmd) in enumerate(self.steps, start=1):
                    self.current_step_index = i
                    self.current_step_label = step_label
                    broadcast_activity()
                    self._append_line(f"[{i}/{len(self.steps)}] {step_label}")
                    rc = self._run_command(cmd)
                    if rc != 0:
                        failed = True
                        self._append_line(f"[{i}/{len(self.steps)}] failed with rc={rc}")
                    else:
                        self._append_line(f"[{i}/{len(self.steps)}] finished")
                    self.completed_steps = i
                    broadcast_activity()
                self.rc = 1 if failed else 0
                self.status = "failed" if failed else "done"
            else:
                self.rc = self._run_command(self.cmd)
                self.status = "done" if self.rc == 0 else "failed"
        except Exception as e:  # pragma: no cover
            self.rc = -1
            self.status = "failed"
            self._append_line(f"[job error] {e}")
        finally:
            self.ended = time.time()
            self._q.put(None)  # sentinel for SSE consumers
            broadcast_activity()

    def _append_line(self, line: str) -> None:
        self.lines.append(line)
        self._q.put(line)
        if len(self.lines) > 5000:
            self.lines = self.lines[-5000:]
        now = time.time()
        if now - self._last_broadcast > 0.75:
            self._last_broadcast = now
            broadcast_activity()

    def _run_command(self, cmd: list[str]) -> int:
        proc = subprocess.Popen(
            cmd,
            cwd=REPO_ROOT,
            env=build_tool_env(),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        assert proc.stdout is not None
        for line in proc.stdout:
            self._append_line(line.rstrip("\n"))
        proc.wait()
        return proc.returncode

    def begin(self) -> None:
        """Mark a synchronous activity as started (no subprocess)."""
        self.status = "running"
        self.started = time.time()

    def finish(self, ok: bool, detail: str = "") -> None:
        """Mark a synchronous activity as done/failed."""
        self.ended = time.time()
        self.status = "done" if ok else "failed"
        self.rc = 0 if ok else 1
        if detail:
            for line in detail.splitlines():
                if line.strip():
                    self.lines.append(line)
        broadcast_activity()

    def append(self, line: str) -> None:
        self.lines.append(line)

    def tail(self) -> queue.Queue[str | None]:
        return self._q


_JOBS: dict[str, Job] = {}
_JOBS_LOCK = threading.Lock()
_MAX_JOBS = 40


def _prune_jobs() -> None:
    """Keep the newest _MAX_JOBS items; drop oldest completed ones."""
    if len(_JOBS) <= _MAX_JOBS:
        return
    # Sort by started time, keep running ones always, trim the rest
    items = sorted(_JOBS.values(), key=lambda j: j.started or 0, reverse=True)
    kept = []
    for j in items:
        if j.status == "running" or len(kept) < _MAX_JOBS:
            kept.append(j)
    kept_ids = {j.id for j in kept}
    for k in list(_JOBS.keys()):
        if k not in kept_ids:
            del _JOBS[k]


def start_job(label: str, cmd: list[str], kind: str = "deploy") -> Job:
    """Launch a long-running subprocess job."""
    with _JOBS_LOCK:
        job = Job(label=label, cmd=cmd, kind=kind)
        _JOBS[job.id] = job
        _prune_jobs()
    job.start()
    broadcast_activity()
    return job


def start_job_sequence(label: str, steps: list[tuple[str, list[str]]], kind: str = "deploy") -> Job:
    """Launch one job that runs multiple commands sequentially in one thread."""
    with _JOBS_LOCK:
        job = Job(label=label, steps=steps, kind=kind)
        _JOBS[job.id] = job
        _prune_jobs()
    job.start()
    broadcast_activity()
    return job


def register_activity(label: str, kind: str = "op") -> Job:
    """Register a short-lived activity that the endpoint will complete synchronously."""
    with _JOBS_LOCK:
        job = Job(label=label, kind=kind)
        _JOBS[job.id] = job
        _prune_jobs()
    job.begin()
    broadcast_activity()
    return job


# ────────────────────────────────────────────────────────────────────
# Server-Sent Events: push activity updates to connected clients
# ────────────────────────────────────────────────────────────────────


_event_loop: asyncio.AbstractEventLoop | None = None
_sse_subscribers: set["asyncio.Queue[str]"] = set()
_sse_lock = threading.Lock()


def _sse_message(event: str, html: str) -> str:
    """Format an SSE message with possibly multi-line HTML payload."""
    lines = html.splitlines() or [""]
    body = "\n".join(f"data: {line}" for line in lines)
    return f"event: {event}\n{body}\n\n"


def broadcast_activity() -> None:
    """Push fresh activity-pane HTML to every connected SSE subscriber.
    Safe to call from any thread — schedules the push on the event loop."""
    if _event_loop is None:
        return
    try:
        message = _sse_message("activity", render_jobs_panel())
    except Exception:
        return

    def _push() -> None:
        with _sse_lock:
            subs = list(_sse_subscribers)
        for q in subs:
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                pass  # drop updates to slow subscribers rather than block

    try:
        _event_loop.call_soon_threadsafe(_push)
    except RuntimeError:
        # loop closed (e.g. during shutdown) — silent no-op
        pass


# ────────────────────────────────────────────────────────────────────
# Goldsky command helpers (synchronous, short-running)
# ────────────────────────────────────────────────────────────────────


def run_goldsky(args: list[str], timeout: int = 60) -> tuple[int, str]:
    goldsky = resolve_tool("goldsky")
    if not goldsky:
        return 127, "goldsky not found on PATH or in /usr/local/bin / /opt/homebrew/bin"
    try:
        proc = subprocess.run(
            [goldsky, *args],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return 124, f"timeout running: goldsky {' '.join(args)}"
    except FileNotFoundError:
        return 127, "goldsky not found on PATH"
    out = (proc.stdout or "") + (proc.stderr or "")
    return proc.returncode, out.strip()


def do_tag_create(base: str, version: str, tag: str) -> tuple[bool, str]:
    rc, out = run_goldsky(["subgraph", "tag", "create", f"{base}/{version}", "--tag", tag])
    return rc == 0, out


def do_tag_delete(base: str, version: str, tag: str) -> tuple[bool, str]:
    rc, out = run_goldsky(["subgraph", "tag", "delete", f"{base}/{version}", "-f", "--tag", tag])
    return rc == 0, out


def do_subgraph_delete(base: str, version: str) -> tuple[bool, str]:
    rc, out = run_goldsky(["subgraph", "delete", "-f", f"{base}/{version}"])
    return rc == 0, out


def do_pipeline_update(subgraph_versions: dict[str, str]) -> tuple[bool, list[str]]:
    """Apply one promotion-gated update across every related managed pipeline."""
    results = update_managed_pipelines(subgraph_versions, apply=True)
    if not results:
        return True, ["pipelines: no related managed pipelines found"]

    lines = [f"pipeline {result.pipeline}: {result.status} — {result.message}" for result in results]
    return not any(result.failed for result in results), lines


# ────────────────────────────────────────────────────────────────────
# Templates
# ────────────────────────────────────────────────────────────────────

BASE_HTML = r"""
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SYMMIO Fleet</title>
<script src="https://unpkg.com/htmx.org@1.9.12"></script>
<script src="https://unpkg.com/htmx.org@1.9.12/dist/ext/sse.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root {
    color-scheme: dark;
    --bg: #090b0e;
    --panel: rgba(18, 22, 28, .94);
    --line: #232a35;
    --line-strong: #303947;
    --text: #edf1f5;
    --muted: #8d98a8;
    --faint: #647083;
    --blue: #4f8cff;
    --green: #58d17b;
    --red: #ff6b66;
  }
  * { box-sizing: border-box; }
  body {
    min-height: 100vh;
    background:
      linear-gradient(180deg, rgba(79,140,255,.09), transparent 320px),
      linear-gradient(135deg, rgba(88,209,123,.045), transparent 34%),
      var(--bg);
    color: var(--text);
    font-feature-settings: "tnum";
  }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,.45), transparent 62%);
  }
  .card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow: 0 18px 48px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.025);
  }

  /* Two-column page: main content left, sticky activity pane right */
  .page-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px;
               gap: 18px; max-width: 1720px; margin: 0 auto; padding: 22px 24px;
               align-items: start; }
  .page-grid > main { min-width: 0; }
  .page-grid > aside#activity-pane { position: sticky; top: 20px;
                max-height: calc(100vh - 40px); overflow-y: auto;
                padding: 0; display: flex; flex-direction: column; }
  @media (max-width: 1180px) {
    .page-grid { grid-template-columns: 1fr; padding: 16px; }
    .page-grid > aside#activity-pane { position: static; max-height: 60vh; }
    .app-header { align-items: stretch; }
    .app-actions { flex-shrink: 0; }
    #filter-count { flex: 1 0 100%; margin-left: 0 !important; text-align: right; }
    .filter-search { max-width: none; }
    .filter-bar .filter-row:first-child { align-items: stretch; }
  }

  .app-header { display: flex; align-items: flex-start; justify-content: space-between;
                gap: 16px; margin-bottom: 16px; padding: 2px 2px 0; }
  .app-title-row { display: flex; align-items: center; gap: 10px; }
  .app-mark { width: 34px; height: 34px; border-radius: 8px;
              display: inline-flex; align-items: center; justify-content: center;
              background: linear-gradient(135deg, rgba(79,140,255,.22), rgba(56,199,216,.12));
              border: 1px solid rgba(79,140,255,.32); color: #b8d3ff;
              box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
  .app-title { font-size: 19px; line-height: 1.15; font-weight: 700; letter-spacing: 0; }
  .app-subtitle { margin-top: 3px; color: var(--faint); font-size: 12px; }
  .app-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

  /* Activity pane internals */
  .activity-header { padding: 13px 14px; border-bottom: 1px solid var(--line);
                     display: flex; align-items: center; justify-content: space-between;
                     position: sticky; top: 0; background: rgba(18,22,28,.96);
                     backdrop-filter: blur(10px); z-index: 1; }
  .activity-list { display: flex; flex-direction: column; padding: 6px; gap: 2px; }
  .activity-empty { padding: 28px 20px; text-align: center; color: #6a7280; font-size: 12px; }
  .act-item { padding: 8px 10px; border-radius: 7px; border: 1px solid transparent;
              display: flex; gap: 10px; align-items: flex-start; transition: background .1s; }
  .act-item:hover { background: rgba(255,255,255,.025); border-color: var(--line); }
  .act-icon { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
              display: flex; align-items: center; justify-content: center;
              font-size: 10px; font-weight: 600; }
  .act-icon.running { background: rgba(210,153,34,.18); color: #e5c075;
                       border: 1px solid rgba(210,153,34,.4); }
  .act-icon.running::before { content: ''; width: 9px; height: 9px; border: 2px solid currentColor;
                               border-right-color: transparent; border-radius: 50%;
                               animation: spin .7s linear infinite; }
  .act-icon.done { background: rgba(46,160,67,.18); color: #7ee195;
                    border: 1px solid rgba(46,160,67,.4); }
  .act-icon.done::before { content: '✓'; }
  .act-icon.failed { background: rgba(248,81,73,.18); color: #ff9a93;
                      border: 1px solid rgba(248,81,73,.4); }
  .act-icon.failed::before { content: '✗'; }
  .act-body { flex: 1; min-width: 0; }
  .act-label { font-size: 12px; color: #cfd4db; font-weight: 500;
               word-break: break-word; line-height: 1.35; }
  .act-meta { display: flex; gap: 6px; align-items: center; margin-top: 2px;
              font-size: 10px; color: #6a7280; }
  .act-kind { padding: 1px 6px; border-radius: 999px; background: #1c2129;
              color: #8a93a3; border: 1px solid #2a3240; text-transform: lowercase;
              font-weight: 500; letter-spacing: 0.02em; }
  .act-kind.deploy { color: #82b1ff; border-color: rgba(56,139,253,.3); }
  .act-kind.promote, .act-kind.tag { color: #82b1ff; border-color: rgba(56,139,253,.3); }
  .act-kind.delete, .act-kind.untag { color: #ff9a93; border-color: rgba(248,81,73,.3); }
  .act-kind.refresh { color: #a9b0bb; }
  .act-progress { margin-top: 7px; padding: 8px 9px; border: 1px solid rgba(79,140,255,.18);
                  background: rgba(79,140,255,.055); border-radius: 7px; }
  .act-progress-head { display: flex; justify-content: space-between; align-items: baseline;
                       gap: 10px; font-size: 10px; color: #8d98a8; }
  .act-progress-step { color: #b8d3ff; font-weight: 700; }
  .act-progress-target { margin-top: 3px; color: #d6dde7; font-size: 11px;
                         line-height: 1.35; word-break: break-word; }
  .act-progress-bar { margin-top: 7px; height: 5px; overflow: hidden; border-radius: 999px;
                      background: #111720; }
  .act-progress-fill { height: 100%; min-width: 5px; border-radius: inherit;
                       background: linear-gradient(90deg, var(--blue), #38c7d8);
                       transition: width .22s ease; }
  .act-item.running { animation: act-pulse 1.6s ease-in-out infinite; }
  @keyframes act-pulse { 0%, 100% { background: rgba(47,111,235,.02); } 50% { background: rgba(47,111,235,.08); } }
  .act-log { margin-top: 6px; padding: 6px 8px; background: #070809;
             border-radius: 5px; font-size: 10px; font-family: ui-monospace, monospace;
             color: #8a93a3; max-height: 100px; overflow-y: auto; line-height: 1.4;
             white-space: pre-wrap; word-break: break-word; }
  details.act-details > summary { cursor: pointer; list-style: none; font-size: 10px;
             color: #6a7280; margin-top: 4px; user-select: none; }
  details.act-details > summary::-webkit-details-marker { display: none; }
  details.act-details > summary::before { content: '▸ '; }
  details.act-details[open] > summary::before { content: '▾ '; }
  .btn { min-height: 30px; padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600;
         border: 1px solid var(--line-strong); background: #1a2029; color: #d6dde7;
         cursor: pointer; transition: background .12s ease, border-color .12s ease, color .12s ease, transform .12s ease;
         display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .btn:hover { background: #242c38; border-color: #3b4657; color: #fff; }
  .btn:active { transform: translateY(1px); }
  .btn:disabled, .btn.htmx-request { opacity: .55; pointer-events: none; cursor: wait; }
  .btn-primary { background: var(--blue); border-color: var(--blue); color: #fff; }
  .btn-primary:hover { background: #3978ef; border-color: #3978ef; }
  .btn-danger { background: #742a2a; border-color: #8a3232; color: #ffe3e3; }
  .btn-danger:hover { background: #8a3232; color: #fff; }
  .btn-ghost { background: transparent; border-color: #2a3240; }
  .btn-xs { padding: 2px 8px; font-size: 10px; border-radius: 5px; }
  .btn.active { background: #2f6feb; border-color: #2f6feb; color: #fff; }
  .btn-icon { padding: 3px 7px; font-size: 12px; line-height: 1; background: transparent;
              border-color: transparent; color: #6a7280; }
  .btn-icon:hover { background: rgba(248,81,73,.1); color: #ff9a93; border-color: rgba(248,81,73,.3); }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
             overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .ui-icon { display: inline-block; position: relative; width: 14px; height: 14px; flex: 0 0 14px; }
  .icon-copy::before, .icon-copy::after {
    content: ''; position: absolute; width: 8px; height: 10px; border: 1.5px solid currentColor;
    border-radius: 2px; background: transparent;
  }
  .icon-copy::before { left: 2px; top: 3px; opacity: .55; }
  .icon-copy::after { left: 5px; top: 0; background: rgba(18,22,28,.98); }
  .icon-trash::before { content: ''; position: absolute; left: 3px; top: 4px; width: 8px; height: 8px;
                        border: 1.5px solid currentColor; border-top: 0; border-radius: 1px 1px 2px 2px; }
  .icon-trash::after { content: ''; position: absolute; left: 2px; top: 2px; width: 10px; height: 1.5px;
                       background: currentColor; border-radius: 999px; box-shadow: 3px -2px 0 -1px currentColor; }
  .icon-promote::before { content: ''; position: absolute; left: 6px; top: 3px; width: 2px; height: 8px;
                          background: currentColor; border-radius: 999px; }
  .icon-promote::after { content: ''; position: absolute; left: 4px; top: 2px; width: 6px; height: 6px;
                         border-left: 2px solid currentColor; border-top: 2px solid currentColor;
                         transform: rotate(45deg); }
  .icon-deploy::before { content: ''; position: absolute; left: 5px; top: 1px; width: 5px; height: 12px;
                         background: currentColor; clip-path: polygon(55% 0, 100% 0, 68% 43%, 100% 43%, 25% 100%, 45% 54%, 8% 54%); }

  /* Inline tag indicator — subtle, not a loud pill */
  .tag-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
              color: #9ec1ff; font-weight: 600; letter-spacing: 0.01em; }
  .tag-chip::before { content: ''; display: inline-block; width: 6px; height: 6px;
              background: #82b1ff; border-radius: 50%; }

  /* GraphQL endpoint link cluster — copy + open-in-new-tab */
  .ep-links { display: inline-flex; align-items: center; gap: 2px; opacity: .55;
              transition: opacity .12s; }
  .ep-links:hover, .v-row:hover .ep-links, .tag-row:hover .ep-links { opacity: 1; }
  .ep-btn { display: inline-flex; align-items: center; justify-content: center;
            width: 20px; height: 20px; padding: 0; background: transparent; border: none;
            color: #6a7280; cursor: pointer; border-radius: 4px; font-size: 12px;
            line-height: 1; text-decoration: none; transition: all .1s; }
  .ep-btn:hover { background: rgba(47,111,235,.15); color: #82b1ff; }
  .ep-btn.copied { background: rgba(46,160,67,.18); color: #7ee195; }
  .ep-btn.copied .icon-copy::before, .ep-btn.copied .icon-copy::after { border-color: #7ee195; }

  /* Version row — single horizontal line */
  .v-row { display: flex; align-items: center; gap: 10px; min-height: 30px; padding: 4px 8px 4px 12px;
           border-left: 1px dashed #2a3240; margin-left: -2px; border-radius: 0 7px 7px 0; }
  .v-row:hover { border-left-color: #536173; background: rgba(255,255,255,.025); }
  .v-row .v-ver { font-family: ui-monospace, monospace; font-weight: 600; font-size: 12px;
                  color: #cfd4db; min-width: 60px; }
  .v-row .v-meta { display: inline-flex; gap: 6px; align-items: center; }
  .v-row .v-tags { display: inline-flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .v-row .v-pipeline { display: inline-flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .v-row .v-actions { margin-left: auto; display: inline-flex; gap: 4px; align-items: center;
                      opacity: .55; transition: opacity .12s; }
  .v-row:hover .v-actions, .v-row:focus-within .v-actions { opacity: 1; }

  /* Modal "busy" state — shown while an action inside it is in flight */
  .modal-bg.busy { cursor: wait; }
  .modal-bg.busy .modal { pointer-events: none; }
  .modal-bg.busy .modal::before { content: ''; position: absolute; inset: 0;
              background: rgba(20,23,28,.55); backdrop-filter: blur(1px);
              border-radius: 8px; z-index: 1; pointer-events: none; }
  .modal-bg.busy .modal { position: relative; }
  .modal-bg.busy .modal > * { position: relative; z-index: 0; }
  .modal-bg.busy .modal::after { content: ''; position: absolute; top: 50%; left: 50%;
              width: 32px; height: 32px; margin: -16px 0 0 -16px; z-index: 2;
              border: 3px solid rgba(47,111,235,.2); border-top-color: #2f6feb;
              border-radius: 50%; animation: spin .7s linear infinite; }

  /* Inline spinner for per-button loading */
  .spin { display: inline-block; width: 10px; height: 10px; border: 2px solid currentColor;
          border-right-color: transparent; border-radius: 50%; animation: spin .6s linear infinite; }
  .htmx-indicator { display: none; }
  .htmx-request .htmx-indicator { display: inline-block; }
  .htmx-request .label-normal { display: none; }
  .label-normal { display: inline-flex; align-items: center; gap: 5px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Top loading bar — shows on any in-flight htmx request */
  #top-bar { position: fixed; top: 0; left: 0; right: 0; height: 2px; background: transparent;
             z-index: 60; overflow: hidden; pointer-events: none; }
  #top-bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg,
                    transparent, #2f6feb 40%, #38bdf8 60%, transparent);
                    transform: translateX(-100%); }
  body.htmx-request #top-bar::after { animation: slide 1.1s linear infinite; }
  @keyframes slide { to { transform: translateX(100%); } }

  /* Collapsible versions list */
  details.versions-details > summary { list-style: none; cursor: pointer; padding: 4px 6px;
            border-radius: 5px; display: inline-flex; align-items: center; gap: 8px;
            flex-wrap: wrap; margin: -4px -6px; transition: background .1s; }
  details.versions-details > summary::-webkit-details-marker { display: none; }
  details.versions-details > summary:hover { background: rgba(255,255,255,.03); }
  details.versions-details > summary .chev { display: inline-block; transition: transform .15s ease;
            color: #6a7280; font-size: 10px; }
  details.versions-details[open] > summary .chev { transform: rotate(90deg); }
  details.versions-details .version-item { padding-left: 12px; border-left: 1px dashed #2a3240; }

  /* Filter bar layout + controls */
  .filter-bar { padding: 14px 16px; }
  .filter-bar .filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .filter-bar .filter-row + .filter-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid #1e242d; }
  .filter-bar .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
                       color: #6a7280; font-weight: 500; }
  .filter-search { position: relative; flex: 1 1 260px; min-width: 220px; }
  .filter-search input { width: 100%; height: 31px; padding-left: 30px; border-radius: 7px;
                         background: rgba(15,19,25,.88); border-color: var(--line);
                         color: #dbe2ea; }
  .filter-search::before { content: '⌕'; position: absolute; left: 11px; top: 5px;
                           color: #647083; font-size: 15px; pointer-events: none; }
  .filter-search input:focus { outline: none; border-color: rgba(79,140,255,.62);
                               box-shadow: 0 0 0 2px rgba(79,140,255,.13); }
  /* Segmented control */
  .segmented { display: inline-flex; background: #0f1319; border: 1px solid var(--line);
               border-radius: 7px; padding: 2px; gap: 1px; }
  .segmented button { padding: 4px 11px; font-size: 11px; font-weight: 500; background: transparent;
                       border: none; color: #8a93a3; border-radius: 5px; cursor: pointer;
                       transition: all .1s; }
  .segmented button:hover { color: #cfd4db; background: rgba(255,255,255,.03); }
  .segmented button.active { background: var(--blue); color: #fff; box-shadow: 0 1px 8px rgba(79,140,255,.25); }
  .segmented button.active:hover { background: #3978ef; }

  /* Toggle switch for boolean filters like "2+ versions" */
  .filter-toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 12px;
                    color: #a9b0bb; cursor: pointer; user-select: none; padding: 4px 8px;
                    border-radius: 6px; transition: background .1s; }
  .filter-toggle:hover { background: rgba(255,255,255,.03); }
  .filter-toggle input { appearance: none; width: 28px; height: 16px; background: #242830;
                          border-radius: 999px; position: relative; cursor: pointer;
                          transition: background .15s; margin: 0; }
  .filter-toggle input::after { content: ''; position: absolute; top: 2px; left: 2px;
                                 width: 12px; height: 12px; background: #6a7280;
                                 border-radius: 50%; transition: all .15s; }
  .filter-toggle input:checked { background: rgba(47,111,235,.35); }
  .filter-toggle input:checked::after { background: #2f6feb; left: 14px; }

  /* Chain chips — click the pill itself, no visible checkbox */
  .chip-toggle { display: inline-flex; align-items: center; padding: 4px 11px;
                  border-radius: 999px; border: 1px solid #303a48;
                  background: rgba(141,152,168,.08); color: #adb7c6;
                  font-size: 11px; font-weight: 500; cursor: pointer; user-select: none;
                  transition: all .1s; }
  .chip-toggle:hover { border-color: #4a5160; color: #cfd4db; }
  .chip-toggle input { display: none; }
  .chip-toggle:has(input:checked) { background: rgba(47,111,235,.18);
                                     border-color: rgba(47,111,235,.55); color: #82b1ff; }
  .chip-toggle.chip-orphan { border-color: rgba(225,188,66,.3); color: #d8b44c;
                              background: rgba(225,188,66,.06); }
  .chip-toggle.chip-orphan:hover { border-color: rgba(225,188,66,.55); color: #e5c075; }
  .chip-toggle.chip-orphan:has(input:checked) { background: rgba(225,188,66,.16);
                              border-color: rgba(225,188,66,.6); color: #e5c075; }

  /* Row selection checkboxes */
  .row-sel, .row-sel-all { appearance: none; width: 16px; height: 16px;
           border: 1.5px solid #3a4250; border-radius: 4px; background: #0f1217;
           cursor: pointer; position: relative; margin: 0; transition: all .1s; }
  .row-sel:hover, .row-sel-all:hover { border-color: #5a6270; }
  .row-sel:checked, .row-sel-all:checked { background: #2f6feb; border-color: #2f6feb; }
  .row-sel:checked::after, .row-sel-all:checked::after {
           content: ''; position: absolute; left: 4px; top: 1px;
           width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0;
           transform: rotate(45deg); }
  tr.chain-row.sel-on { background: rgba(47,111,235,.06); }
  tr.chain-row.sel-on:hover td { background: rgba(47,111,235,.09); }

  /* Floating bulk action bar */
  .bulk-bar { position: sticky; top: 10px; z-index: 20; margin-bottom: 14px;
              animation: bulk-in .18s ease-out; }
  .bulk-bar[hidden] { display: none; }
  .bulk-bar-inner { background: rgba(18,22,28,.94); backdrop-filter: blur(10px);
              border: 1px solid #334056; border-radius: 8px;
              padding: 10px 14px; display: flex; align-items: center; gap: 10px;
              box-shadow: 0 14px 28px rgba(0,0,0,.32); }
  .bulk-count { display: flex; align-items: baseline; gap: 6px; padding-right: 8px;
              border-right: 1px solid #242830; margin-right: 4px; }
  .bulk-count > span:first-child { font-size: 15px; font-weight: 600; color: #82b1ff; }
  @keyframes bulk-in { from { opacity: 0; transform: translateY(-6px); }
                        to { opacity: 1; transform: translateY(0); } }

  .pill { display:inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px;
          border: 1px solid #303844; line-height: 1.5; }
  .pill-green { background: rgba(46,160,67,.15); border-color: rgba(46,160,67,.4); color: #7ee195; }
  .pill-red { background: rgba(248,81,73,.15); border-color: rgba(248,81,73,.4); color: #ff9a93; }
  .pill-yellow { background: rgba(210,153,34,.15); border-color: rgba(210,153,34,.4); color: #e5c075; }
  .pill-blue { background: rgba(56,139,253,.15); border-color: rgba(56,139,253,.4); color: #82b1ff; }
  .pill-gray { background: rgba(125,133,144,.15); border-color: rgba(125,133,144,.4); color: #a9b0bb; }

  /* Chain cell with logo */
  .chain-cell { display: flex; align-items: flex-start; gap: 10px; }
  .chain-cell-text { flex: 1; min-width: 0; }
  .chain-logo { width: 30px; height: 30px; border-radius: 50%; object-fit: cover;
                background: #0f1217; border: 1px solid #2a3240; flex-shrink: 0;
                margin-top: 2px; box-shadow: 0 0 0 2px rgba(255,255,255,.02); }
  .chain-logo-fallback { display: inline-flex; align-items: center; justify-content: center;
                          font-size: 10px; font-weight: 600; color: #6a7280;
                          letter-spacing: 0.02em; }

  .grid-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
                  gap: 1px; border-bottom: 1px solid var(--line);
                  background: var(--line); }
  .grid-metric { background: rgba(18,22,28,.96); padding: 13px 16px; min-width: 0; }
  .grid-metric-label { color: #718096; font-size: 10px; font-weight: 700;
                       text-transform: uppercase; letter-spacing: .06em; }
  .grid-metric-value { margin-top: 3px; color: #eef3f8; font-size: 18px; font-weight: 800; line-height: 1; }
  .grid-metric-note { margin-top: 3px; color: #69768a; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fleet-table-wrap { overflow-x: auto; }
  .no-results { margin: 14px; padding: 18px; border: 1px dashed #303947; border-radius: 8px;
                color: #8d98a8; background: rgba(15,19,25,.62); text-align: center;
                font-size: 13px; }
  .no-results strong { display: block; color: #d6dde7; margin-bottom: 3px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  #grid table { min-width: 1260px; }
  th, td { padding: 10px 12px; border-bottom: 1px solid rgba(35,42,53,.86); font-size: 13px; vertical-align: top; }
  th { text-align: left; color: #92a0b2; font-weight: 700; font-size: 10px;
       text-transform: uppercase; letter-spacing: 0.06em; position: sticky; top: 0;
       background: rgba(18,22,28,.98); backdrop-filter: blur(10px); z-index: 2; }
  tbody tr:hover td { background: rgba(255,255,255,.025); }
  td[data-label]::before { display: none; }

  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(2px);
              display: flex; align-items: center; justify-content: center; z-index: 50;
              animation: modal-bg-in .12s ease-out; }
  .modal { background: #14171c; border: 1px solid #242830; border-radius: 8px;
           padding: 20px; max-width: 600px; width: 90%; max-height: 85vh; overflow: auto;
           box-shadow: 0 20px 40px rgba(0,0,0,.5); animation: modal-in .16s ease-out; }
  @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modal-in { from { opacity: 0; transform: translateY(-6px) scale(.98); }
                         to { opacity: 1; transform: translateY(0) scale(1); } }

  /* Polished bulk-action modal styling */
  .bulk-modal { padding: 0; max-width: 540px; }
  .bulk-modal .modal-head { padding: 18px 22px 14px; border-bottom: 1px solid #1e242d;
                             position: sticky; top: 0; background: #14171c;
                             border-radius: 8px 8px 0 0; z-index: 1; }
  .bulk-modal .modal-title { display: flex; gap: 12px; align-items: center; }
  .bulk-modal .modal-icon { width: 36px; height: 36px; border-radius: 10px;
                             display: inline-flex; align-items: center; justify-content: center;
                             font-size: 18px; border: 1px solid transparent; flex-shrink: 0; }
  .bulk-modal .modal-title-text { font-size: 15px; font-weight: 600; color: #e6e8eb; }
  .bulk-modal .modal-subtitle { font-size: 12px; color: #8a93a3; margin-top: 2px; }
  .bulk-modal .modal-body { padding: 16px 22px; display: flex; flex-direction: column; gap: 18px; }
  .bulk-modal .modal-foot { padding: 14px 22px; border-top: 1px solid #1e242d;
                             display: flex; justify-content: flex-end; gap: 8px;
                             position: sticky; bottom: 0; background: #14171c;
                             border-radius: 0 0 8px 8px; }

  .bulk-modal .form-group { display: flex; flex-direction: column; gap: 8px; }
  .bulk-modal .form-label { font-size: 11px; font-weight: 600; color: #8a93a3;
                             text-transform: uppercase; letter-spacing: 0.05em; }
  .bulk-modal .form-input { background: #0f1217; border: 1px solid #2a3240; color: #e6e8eb;
                             border-radius: 7px; padding: 9px 12px; font-size: 13px;
                             transition: border-color .1s; font-family: inherit; }
  .bulk-modal .form-input:focus { outline: none; border-color: #2f6feb; }
  .bulk-modal .form-input:disabled { opacity: .4; }
  .bulk-modal .form-hint { font-size: 11px; color: #6a7280; }

  .bulk-modal .check-group { display: flex; flex-direction: column; gap: 8px; }
  .bulk-modal .check-row { display: flex; align-items: center; gap: 10px;
                            padding: 8px 10px; border: 1px solid #1e242d; border-radius: 7px;
                            cursor: pointer; transition: border-color .1s; user-select: none; }
  .bulk-modal .check-row:hover { border-color: #2a3240; }
  .bulk-modal .check-row input[type=checkbox] { accent-color: #2f6feb; width: 14px; height: 14px; }

  .bulk-modal .radio-group { display: flex; flex-direction: column; gap: 6px; }
  .bulk-modal .radio-row { display: flex; align-items: flex-start; gap: 10px;
                           padding: 10px 12px; border: 1px solid #1e242d; border-radius: 7px;
                           cursor: pointer; transition: all .1s; font-size: 12px; }
  .bulk-modal .radio-row:hover { border-color: #2a3240; }
  .bulk-modal .radio-row:has(input:checked) { border-color: #2f6feb; background: rgba(47,111,235,.06); }
  .bulk-modal .radio-row input[type=radio] { accent-color: #2f6feb; margin-top: 2px; }
  .bulk-modal .radio-body { flex: 1; }
  .bulk-modal .radio-body > div:first-child { font-weight: 500; color: #cfd4db; }

  .bulk-modal .selection-preview { background: #0f1217; border: 1px solid #1e242d;
                                    border-radius: 7px; padding: 4px; max-height: 180px;
                                    overflow-y: auto; }
  .bulk-modal .selection-row { display: flex; align-items: center; gap: 10px;
                                padding: 5px 8px; font-size: 12px; border-radius: 4px; }
  .bulk-modal .selection-row:hover { background: rgba(255,255,255,.02); }

  /* Busy state — reuse the existing one */
  #bulk-deploy-bg.busy .modal, #bulk-promote-bg.busy .modal { pointer-events: none; }

  /* Confirm modal (replacement for native confirm()) */
  #confirm-modal { display: none; }
  #confirm-modal.open { display: flex; }
  #confirm-modal .modal { max-width: 440px; padding: 22px 24px; }
  #confirm-modal .c-icon { width: 38px; height: 38px; border-radius: 50%;
           display: flex; align-items: center; justify-content: center;
           background: rgba(56,139,253,.12); color: #82b1ff; font-size: 20px;
           margin-bottom: 12px; border: 1px solid rgba(56,139,253,.3); }
  #confirm-modal.danger .c-icon { background: rgba(248,81,73,.12); color: #ff9a93;
           border-color: rgba(248,81,73,.35); }
  #confirm-modal .c-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  #confirm-modal .c-body { font-size: 13px; color: #a9b0bb; margin-bottom: 18px;
           line-height: 1.5; word-break: break-word; }
  #confirm-modal .c-actions { display: flex; gap: 8px; justify-content: flex-end; }
  #confirm-modal .c-hint { font-size: 10px; color: #6a7280; margin-right: auto;
           align-self: center; }
  input[type=text], select { background: #0f1217; border: 1px solid #2a3240; color: #e6e8eb;
                              border-radius: 6px; padding: 6px 10px; font-size: 13px; }
  input[type=checkbox] { accent-color: #2f6feb; }
  pre.log { background: #070809; border: 1px solid #1e242d; padding: 10px; border-radius: 6px;
            font-size: 11px; max-height: 400px; overflow: auto; line-height: 1.35;
            font-family: ui-monospace, "SF Mono", Monaco, monospace; }

  /* Skeleton loader */
  .skel { background: linear-gradient(90deg, #14171c 0%, #1c212a 50%, #14171c 100%);
          background-size: 200% 100%; animation: shimmer 1.4s linear infinite;
          border-radius: 6px; height: 14px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* Toasts */
  #toast-container { position: fixed; top: 16px; right: 16px; z-index: 70;
                     display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .toast { position: relative; overflow: hidden; background: rgba(18,22,28,.98);
           border: 1px solid #2b3442; border-left: 3px solid var(--blue);
           border-radius: 8px; padding: 11px 38px 12px 14px; min-width: 280px; max-width: 430px;
           box-shadow: 0 16px 38px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.035);
           pointer-events: auto; animation: toast-in .18s ease-out; font-size: 13px; }
  .toast.ok { border-left-color: var(--green); }
  .toast.err { border-left-color: var(--red); }
  .toast .t-title { font-weight: 700; margin-bottom: 2px; color: #eef3f8; }
  .toast .t-body { color: #a9b0bb; font-size: 12px; word-break: break-word; }
  .toast-close { position: absolute; top: 7px; right: 8px; width: 22px; height: 22px;
                 border: 0; border-radius: 6px; background: transparent; color: #7b8796;
                 cursor: pointer; font-size: 15px; line-height: 20px; }
  .toast-close:hover { background: rgba(255,255,255,.06); color: #e6e8eb; }
  .toast::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
                  background: currentColor; opacity: .45; transform-origin: left;
                  animation: toast-life 4s linear forwards; }
  .toast.ok::after { color: var(--green); }
  .toast.err::after { color: var(--red); }
  .toast.fading { opacity: 0; transform: translateY(-6px) scale(.98); transition: opacity .28s ease, transform .28s ease; }
  @keyframes toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes toast-life { to { transform: scaleX(0); } }
  @media (max-width: 720px) {
    .app-header { flex-direction: column; }
    .app-actions { width: 100%; justify-content: stretch; }
    .app-actions .btn { flex: 1; justify-content: center; }
    #toast-container { left: 12px; right: 12px; top: 12px; }
    .toast { min-width: 0; max-width: none; width: 100%; }
    .filter-bar .filter-row { align-items: stretch; }
    .segmented { overflow-x: auto; max-width: 100%; }
  }
  @media (max-width: 760px) {
    body::before { display: none; }
    .page-grid { padding: 12px; gap: 12px; }
    .page-grid > aside#activity-pane { max-height: 44vh; }
    .filter-bar { padding: 12px; }
    .filter-bar .filter-row { gap: 8px; }
    .filter-bar .filter-row:first-child > .segmented { width: 100%; }
    .filter-bar .filter-row:first-child > .segmented button { flex: 1; }
    #filter-count { width: 100%; margin-left: 0 !important; }
    #chain-chips { max-height: 116px; overflow: auto; padding-right: 2px; }
    .bulk-bar { top: 6px; }
    .bulk-bar-inner { align-items: stretch; flex-wrap: wrap; padding: 10px; }
    .bulk-count { width: 100%; border-right: 0; border-bottom: 1px solid #242830;
                  padding: 0 0 8px; margin: 0 0 2px; }
    .bulk-bar-inner .btn { flex: 1; justify-content: center; }

    .filter-search { flex-basis: 100%; min-width: 0; }
    .grid-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid var(--line);
                    border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .grid-metric { padding: 11px 12px; }
    .grid-metric-value { font-size: 16px; }
    #grid { overflow: visible; background: transparent; border: 0; box-shadow: none; }
    .fleet-table-wrap { overflow: visible; }
    #grid table { min-width: 0; display: block; }
    #grid thead { display: none; }
    #grid tbody { display: flex; flex-direction: column; gap: 10px; }
    #grid tr.chain-row { display: grid; grid-template-columns: minmax(0, 1fr);
                         border: 1px solid var(--line); border-radius: 8px;
                         background: var(--panel); overflow: hidden; }
    #grid tr.chain-row[style] { border-top: 1px solid var(--line) !important; }
    #grid tr.chain-row.sel-on { border-color: rgba(79,140,255,.48); }
    #grid td { display: grid; grid-template-columns: 92px minmax(0, 1fr);
               gap: 10px; padding: 10px 12px; border-bottom: 1px solid rgba(35,42,53,.72); }
    #grid td:last-child { border-bottom: 0; }
    #grid td[data-label]::before { display: block; content: attr(data-label);
                                   color: #748195; font-size: 10px; font-weight: 700;
                                   text-transform: uppercase; letter-spacing: .06em; padding-top: 2px; }
    #grid td[data-label="Select"] { display: flex; justify-content: flex-end; padding: 8px 10px;
                                    background: rgba(255,255,255,.018); }
    #grid td[data-label="Select"]::before { content: 'Select row'; margin-right: auto; }
    .chain-cell { align-items: center; }
    .v-row { display: grid; grid-template-columns: minmax(64px, auto) 1fr;
             gap: 6px 8px; padding: 8px; }
    .v-row .ep-links, .v-row .v-meta, .v-row .v-tags, .v-row .v-pipeline, .v-row .v-actions { margin-left: 0; }
    .v-row .v-meta, .v-row .v-tags, .v-row .v-pipeline, .v-row .v-actions { grid-column: 1 / -1; }
    .v-row .v-actions { opacity: 1; justify-content: flex-start; flex-wrap: wrap; }
    .tag-row { align-items: center; }
    .modal { width: calc(100vw - 24px); max-height: calc(100vh - 24px); padding: 16px; }
    .bulk-modal { max-width: none; padding: 0; }
    .bulk-modal .modal-head, .bulk-modal .modal-body, .bulk-modal .modal-foot { padding-left: 14px; padding-right: 14px; }
    .bulk-modal .selection-row { align-items: flex-start; flex-direction: column; gap: 4px; }
    .bulk-modal .modal-foot { flex-wrap: wrap; }
    .bulk-modal .modal-foot .btn { flex: 1; justify-content: center; }
  }
</style>
<script>
  // Auto-dismiss toasts after 4s, including htmx out-of-band swaps.
  function dismissToast(el) {
    if (!el || el.dataset.removed === '1') return;
    el.dataset.removed = '1';
    el.classList.add('fading');
    setTimeout(function() { el.remove(); }, 320);
  }
  function armToast(el) {
    if (!el || el.dataset.dismissing === '1') return;
    el.dataset.dismissing = '1';
    var close = el.querySelector('.toast-close');
    if (close) close.addEventListener('click', function() { dismissToast(el); });
    setTimeout(function() { dismissToast(el); }, 4000);
  }
  function armToasts(root) {
    (root || document).querySelectorAll('#toast-container .toast').forEach(armToast);
  }
  document.addEventListener('DOMContentLoaded', function() {
    armToasts(document);
    var c = document.getElementById('toast-container');
    if (!c) return;
    new MutationObserver(function(records) {
      records.forEach(function(record) {
        record.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('toast')) armToast(node);
          else armToasts(node);
        });
      });
    }).observe(c, { childList: true, subtree: true });
  });
  document.addEventListener('htmx:afterSwap', function() { armToasts(document); });
  document.addEventListener('htmx:afterSettle', function() { armToasts(document); });

  // Defensive cleanup: once in a while htmx's afterRequest cleanup misses
  // the source element — usually when an SSE swap races with the request
  // completion. Make absolutely sure the source button clears its
  // htmx-request class and disabled attribute when its request ends.
  function _clearHtmxRequestState(elt) {
    if (!elt) return;
    if (elt.classList) elt.classList.remove('htmx-request');
    if (elt.hasAttribute && elt.hasAttribute('disabled')) elt.removeAttribute('disabled');
  }
  document.addEventListener('htmx:afterRequest', function(e) {
    _clearHtmxRequestState(e.detail && e.detail.elt);
    _clearHtmxRequestState(e.target);
  });
  document.addEventListener('htmx:responseError', function(e) {
    _clearHtmxRequestState(e.detail && e.detail.elt);
  });
  document.addEventListener('htmx:sendError', function(e) {
    _clearHtmxRequestState(e.detail && e.detail.elt);
  });

  // ── GraphQL endpoint helpers ─────────────────────────────────────
  window.GOLDSKY_PROJECT_ID = "{{ goldsky_project }}";
  window.gqlUrl = function(base, verOrTag) {
    return 'https://api.goldsky.com/api/public/' + window.GOLDSKY_PROJECT_ID +
           '/subgraphs/' + base + '/' + verOrTag + '/gn';
  };
  window.clientToast = function(kind, title, body) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || 'ok');
    var t = document.createElement('div'); t.className = 't-title'; t.textContent = title || '';
    el.appendChild(t);
    if (body) {
      var b = document.createElement('div'); b.className = 't-body'; b.textContent = body;
      el.appendChild(b);
    }
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '×';
    el.appendChild(close);
    c.appendChild(el);
    armToast(el);
  };
  window.copyEndpoint = function(btn, base, verOrTag) {
    var url = window.gqlUrl(base, verOrTag);
    var done = function() {
      window.clientToast('ok', 'Endpoint copied', base + '/' + verOrTag);
      if (btn) {
        btn.classList.add('copied');
        setTimeout(function() { btn.classList.remove('copied'); }, 900);
      }
    };
    var fail = function(err) {
      window.clientToast('err', 'Copy failed', (err && err.message) || String(err));
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done).catch(function() {
        // fall through to legacy
        try { _legacyCopy(url); done(); } catch (e) { fail(e); }
      });
    } else {
      try { _legacyCopy(url); done(); } catch (e) { fail(e); }
    }
  };
  function _legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  }
</script>
</head>
<body>
<div id="top-bar"></div>

<div class="page-grid">
  <main>
  <header class="app-header">
    <div class="app-title-row">
      <div class="app-mark">S</div>
      <div>
        <h1 class="app-title">SYMMIO Subgraph Fleet</h1>
        <p class="app-subtitle" id="last-fetched-label">{{ last_fetched_label }}</p>
      </div>
    </div>
    <div class="app-actions">
      <button class="btn"
              hx-post="/refresh" hx-target="#grid" hx-swap="innerHTML"
              hx-disabled-elt="this">
        <span class="label-normal">Refresh state</span>
        <span class="htmx-indicator"><span class="spin"></span> refreshing…</span>
      </button>
    </div>
  </header>

  <div id="bulk-bar" class="bulk-bar" hidden>
    <div class="bulk-bar-inner">
      <span class="bulk-count">
        <span id="bulk-count">0</span>
        <span class="text-xs text-gray-400">selected</span>
      </span>
      <button class="btn btn-primary" onclick="openBulkPromote()"><span class="ui-icon icon-promote" aria-hidden="true"></span> Promote</button>
      <button class="btn" onclick="openBulkDeploy()"><span class="ui-icon icon-deploy" aria-hidden="true"></span> Deploy</button>
      <button class="btn btn-ghost" onclick="clearSelection()">Clear</button>
    </div>
  </div>

  {% if last_error %}
  <div class="card p-3 mb-4" style="border-color: #8a3232;" id="error-banner">
    <strong class="text-red-400">goldsky error:</strong>
    <span class="text-sm">{{ last_error }}</span>
  </div>
  {% endif %}

  <div class="card filter-bar mb-4">
    <div class="filter-row">
      <div class="segmented" role="group" aria-label="Module filter">
        <button class="module-filter active" data-module="" onclick="setModuleFilter('')">all</button>
        <button class="module-filter" data-module="analytics" onclick="setModuleFilter('analytics')">analytics</button>
        <button class="module-filter" data-module="events" onclick="setModuleFilter('events')">events</button>
      </div>

      <div class="segmented" role="group" aria-label="Chain preset">
        <button class="preset-filter active" data-preset="all" onclick="setPresetFilter('all')">show all</button>
        <button class="preset-filter" data-preset="prod" onclick="setPresetFilter('prod')">prod only</button>
        <button class="preset-filter" data-preset="stage" onclick="setPresetFilter('stage')">stage only</button>
      </div>

      <label class="filter-toggle">
        <input type="checkbox" id="filter-multi-version" onchange="applyFleetFilters()" />
        <span>2+ versions</span>
      </label>

      <label class="filter-search">
        <input type="text" id="fleet-search" placeholder="Search chain, module, version…" oninput="applyFleetFilters()" />
      </label>

      <span class="text-xs text-gray-500 ml-auto" id="filter-count"></span>
    </div>

    <div class="filter-row" style="align-items: flex-start;">
      <span class="label" style="padding-top: 6px; min-width: 50px;">Chains</span>
      <div class="flex gap-1.5 flex-wrap" id="chain-chips" style="flex: 1;">
        {% for c in all_chains %}
          <label class="chip-toggle{% if c.orphan %} chip-orphan{% endif %}">
            <input type="checkbox" class="chain-chip" data-chain="{{ c.key }}"
                   onchange="applyFleetFilters()" />
            {{ c.key }}
          </label>
        {% endfor %}
      </div>
    </div>
  </div>

  <script>
    window.currentModuleFilter = '';
    window.setModuleFilter = function(mod) {
      window.currentModuleFilter = mod;
      document.querySelectorAll('.module-filter').forEach(function(b) {
        b.classList.toggle('active', (b.dataset.module || '') === mod);
      });
      applyFleetFilters();
    };
    window.applyFleetFilters = function() {
      var chips = Array.from(document.querySelectorAll('.chain-chip:checked')).map(function(el) { return el.dataset.chain; });
      var multiOnly = document.getElementById('filter-multi-version').checked;
      var searchEl = document.getElementById('fleet-search');
      var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
      var moduleFilter = window.currentModuleFilter || '';
      var rows = document.querySelectorAll('#grid tr.chain-row');
      var visible = 0;
      rows.forEach(function(r) {
        var chain = r.dataset.chain || '';
        var mod = r.dataset.module || '';
        var vcount = parseInt(r.dataset.versionCount || '0', 10);
        var searchText = (r.dataset.search || '').toLowerCase();
        var match = true;
        if (chips.length > 0 && chips.indexOf(chain) === -1) match = false;
        if (multiOnly && vcount < 2) match = false;
        if (moduleFilter && mod !== moduleFilter) match = false;
        if (query && searchText.indexOf(query) === -1) match = false;
        r.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      var total = rows.length;
      document.getElementById('filter-count').textContent = visible + ' / ' + total + ' rows';
      var empty = document.getElementById('no-filter-results');
      if (empty) empty.hidden = visible !== 0;
      var allCb = document.querySelector('.row-sel-all');
      if (allCb) {
        var visibleSelectors = Array.from(document.querySelectorAll('.row-sel'))
          .filter(function(cb) { return cb.closest('tr').style.display !== 'none'; });
        var visibleChecked = visibleSelectors.filter(function(cb) { return cb.checked; });
        allCb.checked = visibleSelectors.length > 0 && visibleSelectors.length === visibleChecked.length;
        allCb.indeterminate = visibleChecked.length > 0 && visibleChecked.length < visibleSelectors.length;
      }
    };
    window.setPresetFilter = function(mode) {
      document.querySelectorAll('.preset-filter').forEach(function(b) {
        b.classList.toggle('active', b.dataset.preset === mode);
      });
      var chips = document.querySelectorAll('.chain-chip');
      if (mode === 'all') {
        chips.forEach(function(c) { c.checked = false; });
      } else if (mode === 'prod') {
        var prod = new Set({{ prod_chains | tojson }});
        chips.forEach(function(c) { c.checked = prod.has(c.dataset.chain); });
      } else if (mode === 'stage') {
        var stage = new Set({{ stage_chains | tojson }});
        chips.forEach(function(c) { c.checked = stage.has(c.dataset.chain); });
      }
      applyFleetFilters();
    };

    // ── Row selection + bulk bar ─────────────────────────────────
    window._selectionState = {};  // keyed by chain|module_full
    function _selKey(cb) { return cb.dataset.chain + '|' + cb.dataset.moduleFull; }

    window.updateSelectionBar = function() {
      // Collect selections from DOM; persist state keyed by chain|module in case
      // the grid is swapped by an SSE/htmx update.
      var checkedNow = document.querySelectorAll('.row-sel:checked');
      checkedNow.forEach(function(cb) {
        window._selectionState[_selKey(cb)] = {
          chain: cb.dataset.chain,
          module: cb.dataset.moduleFull,
          module_short: cb.dataset.module,
          base: cb.dataset.base,
          orphan: cb.dataset.orphan === '1',
        };
        cb.closest('tr').classList.add('sel-on');
      });
      var unchecked = document.querySelectorAll('.row-sel:not(:checked)');
      unchecked.forEach(function(cb) {
        delete window._selectionState[_selKey(cb)];
        cb.closest('tr').classList.remove('sel-on');
      });
      var count = Object.keys(window._selectionState).length;
      var bar = document.getElementById('bulk-bar');
      document.getElementById('bulk-count').textContent = count;
      bar.hidden = count === 0;
      // keep "select all" in tri-state
      var allCb = document.querySelector('.row-sel-all');
      if (allCb) {
        var visible = Array.from(document.querySelectorAll('.row-sel'))
                            .filter(function(cb) { return cb.closest('tr').style.display !== 'none'; });
        var visibleChecked = visible.filter(function(cb) { return cb.checked; });
        allCb.checked = visible.length > 0 && visible.length === visibleChecked.length;
        allCb.indeterminate = visibleChecked.length > 0 && visibleChecked.length < visible.length;
      }
    };

    window.toggleAllRows = function(checked) {
      // Only toggle visible rows.
      var rows = document.querySelectorAll('#grid tr.chain-row');
      rows.forEach(function(r) {
        if (r.style.display === 'none') return;
        var cb = r.querySelector('.row-sel');
        if (cb) cb.checked = checked;
      });
      updateSelectionBar();
    };

    window.clearSelection = function() {
      window._selectionState = {};
      document.querySelectorAll('.row-sel:checked').forEach(function(cb) { cb.checked = false; });
      document.querySelectorAll('tr.chain-row.sel-on').forEach(function(r) { r.classList.remove('sel-on'); });
      updateSelectionBar();
    };

    // Called by the grid's post-swap script to re-apply persisted selections
    // after an SSE/htmx refresh re-renders the rows.
    window.restoreSelection = function() {
      document.querySelectorAll('.row-sel').forEach(function(cb) {
        cb.checked = !!window._selectionState[_selKey(cb)];
      });
      updateSelectionBar();
    };

    function _selectionPayload() {
      return Object.values(window._selectionState);
    }

    window.openBulkDeploy = function() {
      var sel = _selectionPayload();
      if (!sel.length) return;
      fetch('/bulk-deploy-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections: sel }),
      }).then(function(r) { return r.text(); }).then(function(html) {
        var wrap = document.createElement('div');
        wrap.innerHTML = html;
        document.body.appendChild(wrap.firstElementChild);
        if (window.htmx) htmx.process(document.body);
      });
    };

    window.openBulkPromote = function() {
      var sel = _selectionPayload();
      if (!sel.length) return;
      fetch('/bulk-promote-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections: sel }),
      }).then(function(r) { return r.text(); }).then(function(html) {
        var wrap = document.createElement('div');
        wrap.innerHTML = html;
        document.body.appendChild(wrap.firstElementChild);
        if (window.htmx) htmx.process(document.body);
      });
    };
  </script>

  <div class="card p-0 overflow-hidden mb-6" id="grid"
       hx-get="/grid" hx-trigger="load" hx-swap="innerHTML">
    {{ initial_grid | safe }}
  </div>
  </main>

  <aside id="activity-pane" class="card"
         hx-ext="sse" sse-connect="/events" sse-swap="activity">
    {{ jobs_panel | safe }}
  </aside>
</div>

<div id="toast-container"></div>
<div id="cleanup-host"></div>

<div id="confirm-modal" class="modal-bg" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
  <div class="modal">
    <div class="c-icon" id="confirm-icon">?</div>
    <div class="c-title" id="confirm-title">Confirm action</div>
    <div class="c-body" id="confirm-body">Are you sure?</div>
    <div class="c-actions">
      <span class="c-hint">Enter = confirm · Esc = cancel</span>
      <button type="button" class="btn" id="confirm-cancel">Cancel</button>
      <button type="button" class="btn btn-primary" id="confirm-ok">Confirm</button>
    </div>
  </div>
</div>

<script>
  (function() {
    var modal = document.getElementById('confirm-modal');
    var iconEl = document.getElementById('confirm-icon');
    var titleEl = document.getElementById('confirm-title');
    var bodyEl = document.getElementById('confirm-body');
    var cancelBtn = document.getElementById('confirm-cancel');
    var okBtn = document.getElementById('confirm-ok');
    var pending = null;

    function close() {
      modal.classList.remove('open');
      modal.classList.remove('danger');
      pending = null;
    }
    function doCancel() { close(); }
    function doConfirm() {
      var p = pending; close();
      if (p) p();
    }
    cancelBtn.addEventListener('click', doCancel);
    okBtn.addEventListener('click', doConfirm);
    modal.addEventListener('mousedown', function(e) { if (e.target === modal) doCancel(); });
    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Enter') { e.preventDefault(); doConfirm(); }
      else if (e.key === 'Escape') { e.preventDefault(); doCancel(); }
    });

    // Hook into htmx:confirm — intercept the default browser confirm() dialog.
    document.addEventListener('htmx:confirm', function(evt) {
      var question = evt.detail.question;
      if (!question) return;                       // hx-confirm absent — proceed normally
      evt.preventDefault();                        // block default confirm()
      var isDanger = /delete|destructive|remove|untag/i.test(question);
      var isMove = /^Set /.test(question) || /moves from/i.test(question);
      if (isDanger) {
        modal.classList.add('danger');
        iconEl.textContent = '⚠';
        titleEl.textContent = 'Confirm destructive action';
        okBtn.textContent = 'Yes, continue';
        okBtn.className = 'btn btn-danger';
      } else if (isMove) {
        modal.classList.remove('danger');
        iconEl.textContent = '→';
        titleEl.textContent = 'Move tag';
        okBtn.textContent = 'Apply';
        okBtn.className = 'btn btn-primary';
      } else {
        modal.classList.remove('danger');
        iconEl.textContent = '?';
        titleEl.textContent = 'Confirm action';
        okBtn.textContent = 'Confirm';
        okBtn.className = 'btn btn-primary';
      }
      bodyEl.textContent = question;
      modal.classList.add('open');
      // Focus the confirm button so Enter works immediately.
      setTimeout(function() { okBtn.focus(); }, 0);
      pending = function() { evt.detail.issueRequest(true); };
    });
  })();
</script>

</body>
</html>
"""

SKELETON_GRID = r"""
<div class="p-6">
  <div class="flex items-center gap-3 mb-4 text-sm text-gray-400">
    <span class="spin"></span>
    <span>Fetching Goldsky state… this takes a few seconds.</span>
  </div>
  <div class="flex flex-col gap-3">
    {% for _ in range(8) %}
      <div class="flex gap-3">
        <div class="skel" style="width: 80px;"></div>
        <div class="skel" style="width: 120px;"></div>
        <div class="skel" style="width: 180px;"></div>
        <div class="skel flex-1"></div>
        <div class="skel" style="width: 100px;"></div>
      </div>
    {% endfor %}
  </div>
</div>
"""

TOAST_OOB = r"""
<div id="toast-container" hx-swap-oob="beforeend">
  <div class="toast {{ kind }}">
    <div class="t-title">{{ title }}</div>
    {% if body %}<div class="t-body">{{ body }}</div>{% endif %}
    <button type="button" class="toast-close" aria-label="Dismiss notification">×</button>
  </div>
</div>
"""

LAST_FETCHED_OOB = r"""
<p class="app-subtitle" id="last-fetched-label" hx-swap-oob="innerHTML">{{ label }}</p>
"""

GRID_HTML = r"""
<div class="grid-summary">
  <div class="grid-metric">
    <div class="grid-metric-label">Active rows</div>
    <div class="grid-metric-value">{{ summary.rows }}</div>
    <div class="grid-metric-note">{{ summary.chains }} chain{{ 's' if summary.chains != 1 else '' }}</div>
  </div>
  <div class="grid-metric">
    <div class="grid-metric-label">Deployments</div>
    <div class="grid-metric-value">{{ summary.deployments }}</div>
    <div class="grid-metric-note">{{ summary.tags }} tag pointer{{ 's' if summary.tags != 1 else '' }}</div>
  </div>
  <div class="grid-metric">
    <div class="grid-metric-label">Multi-version</div>
    <div class="grid-metric-value">{{ summary.multi_version }}</div>
    <div class="grid-metric-note">rows needing review</div>
  </div>
  <div class="grid-metric">
    <div class="grid-metric-label">Attention</div>
    <div class="grid-metric-value">{{ summary.attention }}</div>
    <div class="grid-metric-note">non-healthy or unsynced</div>
  </div>
</div>
<div class="fleet-table-wrap">
<table data-active-chains='{{ active_chain_meta | tojson }}'>
  <thead>
    <tr>
      <th style="width: 34px;">
        <input type="checkbox" class="row-sel-all" onchange="toggleAllRows(this.checked)"
               title="Select/deselect all visible rows" />
      </th>
      <th style="width: 120px;">Chain</th>
      <th style="width: 110px;">Module</th>
      <th>Deployments</th>
      <th style="width: 280px;">Managed pipelines</th>
      <th style="width: 200px;">Tags</th>
    </tr>
  </thead>
  <tbody>
  {% for g in groups %}
    {% for row in g.modules %}
    <tr class="chain-row" data-chain="{{ g.chain }}" data-prod="{{ '1' if g.is_prod else '0' }}"
        data-module="{{ row.module_short }}"
        data-base="{{ row.base }}"
        data-module-full="{{ row.module }}"
        data-version-count="{{ row.deployments|length }}"
        data-search="{{ g.chain }} {{ g.network }} {{ row.module_short }} {{ row.module }} {{ row.base }}
          {%- for d in row.deployments %} {{ d.version }} {{ d.status }} {{ d.synced }}{% endfor %}
          {%- for tag, ver in row.tags.items() %} {{ tag }} {{ ver }}{% endfor %}
          {%- for pipeline in row.managed_pipelines %} {{ pipeline.name }}{% endfor %}"
        data-orphan="{{ '1' if g.is_orphan else '0' }}"
        {% if loop.first %}style="border-top: 2px solid #2a3240;"{% endif %}>
      <td class="align-top" data-label="Select" style="padding-top: 10px;">
        <input type="checkbox" class="row-sel"
               data-chain="{{ g.chain }}"
               data-module="{{ row.module_short }}"
               data-module-full="{{ row.module }}"
               data-base="{{ row.base }}"
               data-orphan="{{ '1' if g.is_orphan else '0' }}"
               onchange="updateSelectionBar()" />
      </td>
      <td class="align-top" data-label="Chain">
        {% if loop.first %}
          <div class="chain-cell">
            {% if g.logo_url %}
              <img class="chain-logo" src="{{ g.logo_url }}" alt="" loading="lazy"
                   onerror="this.style.display='none'" />
            {% else %}
              <div class="chain-logo chain-logo-fallback">{{ g.chain[:2]|upper }}</div>
            {% endif %}
            <div class="chain-cell-text">
              {% if g.is_orphan %}
                <div class="font-semibold text-yellow-300 font-mono" style="font-size: 12px; word-break: break-all;">{{ g.chain }}</div>
                <div class="text-xs text-yellow-500">⚠ unmapped</div>
                <div class="text-xs text-gray-500">{{ g.network }}</div>
              {% else %}
                <div class="font-semibold text-cyan-300">{{ g.chain }}</div>
                <div class="text-xs text-gray-500">{{ g.network }}</div>
                {% if g.is_prod %}<div class="pill pill-blue mt-1" style="font-size: 10px;">prod</div>
                {% elif g.is_stage %}<div class="pill pill-yellow mt-1" style="font-size: 10px;">stage</div>{% endif %}
              {% endif %}
            </div>
          </div>
        {% endif %}
      </td>
      <td class="align-top text-gray-400" data-label="Module">{{ row.module_short }}
        <div class="text-xs text-gray-600 mt-1 font-mono" style="font-size: 10px;">{{ row.base }}</div>
      </td>
      <td class="align-top" data-label="Deployments">
        {% if row.deployments %}
          <details class="versions-details" open>
            <summary class="version-summary">
              <span class="chev">▸</span>
              <span class="text-xs text-gray-400">{{ row.deployments|length }} version{{ 's' if row.deployments|length != 1 else '' }}</span>
              {% if row.managed_pipelines %}
                <span class="text-xs text-gray-500">pipeline:
                  {% for pipeline in row.managed_pipelines %}
                    {{ pipeline.configured_versions|join(', ') if pipeline.version_source == 'goldsky' and pipeline.configured_versions else 'unverified' }}{{ ';' if not loop.last else '' }}
                  {% endfor %}
                </span>
              {% endif %}
            </summary>
            <div class="flex flex-col mt-1">
          {% for d in row.deployments %}
            <div class="v-row">
              <span class="v-ver">{{ d.version }}</span>
              <span class="ep-links" title="GraphQL endpoint">
                <button type="button" class="ep-btn"
                        onclick="copyEndpoint(this, '{{ row.base }}', '{{ d.version }}')"
                        title="Copy GraphQL endpoint URL">
                  <span class="ui-icon icon-copy" aria-hidden="true"></span>
                  <span class="sr-only">Copy GraphQL endpoint URL</span>
                </button>
                <a class="ep-btn" target="_blank" rel="noopener"
                   href="https://api.goldsky.com/api/public/{{ goldsky_project }}/subgraphs/{{ row.base }}/{{ d.version }}/gn"
                   title="Open GraphQL endpoint in new tab">↗</a>
              </span>
              <span class="v-meta">
                {% if d.synced == '100%' %}
                  <span class="pill pill-green">{{ d.synced }}</span>
                {% elif d.synced %}
                  <span class="pill pill-yellow">{{ d.synced }}</span>
                {% else %}
                  <span class="pill pill-gray">?</span>
                {% endif %}
                {% if 'healthy' in d.status.lower() %}
                  <span class="pill pill-green">{{ d.status }}</span>
                {% elif 'failed' in d.status.lower() %}
                  <span class="pill pill-red">{{ d.status }}</span>
                {% elif d.status %}
                  <span class="pill pill-yellow">{{ d.status }}</span>
                {% endif %}
              </span>
              <span class="v-tags">
                {% for tag, ver in row.tags.items() %}
                  {% if ver == d.version %}
                    <span class="tag-chip" title="tag '{{ tag }}' points here">{{ tag }}</span>
                  {% endif %}
                {% endfor %}
              </span>
              {% if row.managed_pipelines %}
                {% set pipeline_match = namespace(count=0) %}
                {% for pipeline in row.managed_pipelines %}
                  {% if pipeline.version_source == 'goldsky' and pipeline.configured_versions|length == 1 and pipeline.configured_versions[0] == d.version %}
                    {% set pipeline_match.count = pipeline_match.count + 1 %}
                  {% endif %}
                {% endfor %}
                <span class="v-pipeline">
                  {% if pipeline_match.count == row.managed_pipelines|length %}
                    <span class="pill pill-green">pipeline current</span>
                  {% else %}
                    {% if pipeline_match.count %}
                      <span class="pill pill-yellow">{{ pipeline_match.count }}/{{ row.managed_pipelines|length }} current</span>
                    {% else %}
                      <span class="text-xs text-gray-500">pipeline not current</span>
                    {% endif %}
                    <button class="btn btn-xs btn-ghost"
                            hx-post="/update-pipeline"
                            hx-vals='{"base": "{{ row.base }}", "version": "{{ d.version }}"}'
                            hx-confirm="Switch managed pipeline references for {{ row.base }} to {{ d.version }}? This uses a fresh snapshot and does not move tags."
                            hx-target="#grid" hx-swap="innerHTML"
                            hx-disabled-elt="this">
                      <span class="label-normal">switch pipeline here</span>
                      <span class="htmx-indicator"><span class="spin"></span> switching…</span>
                    </button>
                  {% endif %}
                </span>
              {% endif %}
              <span class="v-actions">
                {# Promote only makes sense when a managed tag currently lives on a DIFFERENT version.
                   If all managed tags are either absent or already on this version, nothing to promote. #}
                {% set stage_cur = row.tags.get('stage') %}
                {% set latest_cur = row.tags.get('latest') %}
                {% set has_tag_to_move = (stage_cur and stage_cur != d.version) or (latest_cur and latest_cur != d.version) %}
                {% if has_tag_to_move %}
                  <button class="btn btn-xs btn-primary"
                          hx-get="/row-promote-form"
                          hx-vals='{"base": "{{ row.base }}", "version": "{{ d.version }}"}'
                          hx-target="body" hx-swap="beforeend"
                          hx-disabled-elt="this"
                          title="Move stage/latest tag(s) to this version">
                    <span class="label-normal"><span class="ui-icon icon-promote" aria-hidden="true"></span> promote</span>
                    <span class="htmx-indicator"><span class="spin"></span></span>
                  </button>
                {% endif %}
                <button class="btn btn-xs btn-icon"
                        hx-post="/delete-version"
                        hx-vals='{"base": "{{ row.base }}", "version": "{{ d.version }}"}'
                        hx-confirm="Delete {{ row.base }}/{{ d.version }}? This is destructive."
                        hx-target="#grid" hx-swap="innerHTML"
                        hx-disabled-elt="this"
                        title="Delete this versioned deployment">
                  <span class="label-normal"><span class="ui-icon icon-trash" aria-hidden="true"></span></span>
                  <span class="sr-only">Delete deployment</span>
                  <span class="htmx-indicator"><span class="spin"></span></span>
                </button>
              </span>
            </div>
          {% endfor %}
            </div>
          </details>
        {% else %}
          <span class="text-gray-600 text-xs">no deployments</span>
        {% endif %}
      </td>
      <td class="align-top" data-label="Managed pipelines">
        {% if row.managed_pipelines %}
          {% set pipeline_state = namespace(needs_update=false) %}
          <div class="flex flex-col gap-2">
            {% for pipeline in row.managed_pipelines %}
              {% if pipeline.status != 'current' %}{% set pipeline_state.needs_update = true %}{% endif %}
              <div class="text-xs">
                <div class="font-mono text-gray-300" style="word-break: break-word;">{{ pipeline.name }}</div>
                <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span class="pill {{ 'pill-green' if pipeline.status == 'current' else 'pill-yellow' if pipeline.status == 'outdated' else 'pill-gray' }}">
                    {{ pipeline.status }}
                  </span>
                  <span class="text-gray-500 font-mono">
                    {{ pipeline.configured_versions|join(', ') if pipeline.configured_versions else 'version unknown' }}
                  </span>
                </div>
              </div>
            {% endfor %}
            {% if pipeline_state.needs_update and row.latest_deployed_version %}
              <button class="btn btn-xs btn-primary"
                      hx-post="/update-pipeline"
                      hx-vals='{"base": "{{ row.base }}", "version": "{{ row.latest_deployed_version }}"}'
                      hx-confirm="Update managed pipeline references for {{ row.base }} to {{ row.latest_deployed_version }}? This uses a fresh snapshot."
                      hx-target="#grid" hx-swap="innerHTML"
                      hx-disabled-elt="this">
                <span class="label-normal">update → {{ row.latest_deployed_version }}</span>
                <span class="htmx-indicator"><span class="spin"></span> updating…</span>
              </button>
            {% endif %}
          </div>
        {% else %}
          <span class="text-gray-600 text-xs">not managed</span>
        {% endif %}
      </td>
      <td class="align-top" data-label="Tags">
        {% if row.tags %}
          <div class="flex flex-col gap-2">
          {% for tag, ver in row.tags.items() %}
            <div class="tag-row flex items-center gap-1.5 flex-wrap">
              <span class="pill pill-blue">{{ tag }}</span>
              <span class="text-gray-400 text-xs">→ {{ ver }}</span>
              <span class="ep-links" title="GraphQL endpoint (tag)">
                <button type="button" class="ep-btn"
                        onclick="copyEndpoint(this, '{{ row.base }}', '{{ tag }}')"
                        title="Copy GraphQL endpoint for {{ tag }}">
                  <span class="ui-icon icon-copy" aria-hidden="true"></span>
                  <span class="sr-only">Copy GraphQL endpoint for {{ tag }}</span>
                </button>
                <a class="ep-btn" target="_blank" rel="noopener"
                   href="https://api.goldsky.com/api/public/{{ goldsky_project }}/subgraphs/{{ row.base }}/{{ tag }}/gn"
                   title="Open {{ tag }} GraphQL endpoint in new tab">↗</a>
              </span>
              <button class="btn btn-xs btn-ghost"
                      hx-post="/remove-tag"
                      hx-vals='{"base": "{{ row.base }}", "version": "{{ ver }}", "tag": "{{ tag }}"}'
                      hx-confirm="Remove '{{ tag }}' tag on {{ row.base }}/{{ ver }}?"
                      hx-target="#grid" hx-swap="innerHTML"
                      hx-disabled-elt="this">
                <span class="label-normal">untag</span>
                <span class="htmx-indicator"><span class="spin"></span> removing…</span>
              </button>
            </div>
          {% endfor %}
          </div>
        {% else %}
          <span class="text-gray-600 text-xs">no tags</span>
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  {% endfor %}
  </tbody>
</table>
</div>
<div id="no-filter-results" class="no-results" hidden>
  <strong>No rows match the current filters</strong>
  Clear search or widen the chain/module filters.
</div>
<script>
  (function() {
    // Rebuild chain chips from the active-chains list embedded in the table,
    // preserving whichever chips the user already had checked.
    var tbl = document.querySelector('#grid table[data-active-chains]');
    var container = document.getElementById('chain-chips');
    if (tbl && container) {
      var active = [];
      try { active = JSON.parse(tbl.getAttribute('data-active-chains') || '[]'); } catch (e) {}
      var prevChecked = new Set(
        Array.from(container.querySelectorAll('.chain-chip:checked')).map(function(el) { return el.dataset.chain; })
      );
      var html = active.map(function(item) {
        var key = item.k || item;
        var orphan = !!(item.o);
        var attr = prevChecked.has(key) ? ' checked' : '';
        return '<label class="chip-toggle' + (orphan ? ' chip-orphan' : '') + '">' +
               '<input type="checkbox" class="chain-chip" data-chain="' + key + '"' + attr +
               ' onchange="applyFleetFilters()" />' + key + '</label>';
      }).join('');
      container.innerHTML = html || '<span class="text-xs text-gray-600">no active chains</span>';
    }
    if (window.applyFleetFilters) window.applyFleetFilters();
    if (window.restoreSelection) window.restoreSelection();
  })();
</script>
"""

ROW_PROMOTE_MODAL = r"""
<div class="modal-bg" id="row-promote-bg" onclick="if(event.target.id==='row-promote-bg')this.remove()">
  <form class="modal" style="max-width: 460px;"
        hx-post="/row-promote" hx-target="#grid" hx-swap="innerHTML"
        hx-on::before-request="document.getElementById('row-promote-bg')?.remove()">
    <h2 class="text-lg font-semibold mb-1">Promote version</h2>
    <div class="text-xs text-gray-500 mb-4 font-mono">{{ base }}/{{ version }}</div>

    <input type="hidden" name="base" value="{{ base }}" />
    <input type="hidden" name="version" value="{{ version }}" />

    <div class="mb-4">
      <label class="text-xs text-gray-400 block mb-2">Tags to apply to this version</label>
      <div class="flex flex-col gap-2">
        {% for tag in ['stage', 'latest'] %}
          {% set current = current_tags.get(tag) %}
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="tags" value="{{ tag }}"
                   {% if current != version %}checked{% endif %}
                   {% if current == version %}disabled{% endif %} />
            <span class="pill pill-blue">{{ tag }}</span>
            {% if current == version %}
              <span class="text-xs text-green-400">already on this version</span>
            {% elif current %}
              <span class="text-xs text-yellow-400">currently on {{ current }} — will be moved here</span>
            {% else %}
              <span class="text-xs text-gray-500">not assigned</span>
            {% endif %}
          </label>
        {% endfor %}
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-start gap-2 text-sm">
        <input type="checkbox" name="update_pipelines" value="1" checked />
        <span>
          Update managed Goldsky pipelines
          <span class="text-xs text-gray-500 block">
            Runs after the tags are promoted{% if affected_pipelines %}: {{ affected_pipelines|join(', ') }}{% endif %}.
          </span>
        </span>
      </label>
    </div>

    <div class="text-xs text-gray-500 mb-4" style="border-top: 1px solid #242830; padding-top: 10px;">
      After tagging, you'll be asked whether to delete the displaced version(s) that no longer carry any tag.
    </div>

    <div class="flex gap-2 justify-end">
      <button type="button" class="btn" onclick="document.getElementById('row-promote-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">
        <span class="label-normal">Promote</span>
        <span class="htmx-indicator"><span class="spin"></span> promoting…</span>
      </button>
    </div>
  </form>
</div>
"""

POST_PROMOTE_CLEANUP_OOB = r"""
<div id="cleanup-host" hx-swap-oob="innerHTML">
  {% if displaced %}
  <div class="modal-bg" id="cleanup-bg" onclick="if(event.target.id==='cleanup-bg')this.remove()">
    <div class="modal" style="max-width: 480px;">
      <div class="c-icon" style="background: rgba(248,81,73,.12); color: #ff9a93; border-color: rgba(248,81,73,.35); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; border: 1px solid;"><span class="ui-icon icon-trash" aria-hidden="true"></span></div>
      <div class="c-title" style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">Remove displaced version{{ 's' if displaced|length != 1 else '' }}?</div>
      <div class="c-body" style="font-size: 13px; color: #a9b0bb; margin-bottom: 16px; line-height: 1.5;">
        Promoted <strong class="text-gray-200">{{ base }}/{{ version }}</strong> as <strong>{{ tags|join(', ') }}</strong>.
        The following version{{ 's' if displaced|length != 1 else '' }} no longer carry any tag:
      </div>
      <ul class="mb-4 flex flex-col gap-1">
        {% for ver in displaced %}
          <li class="flex items-center justify-between text-sm font-mono" style="padding: 6px 10px; background: #0f1217; border-radius: 6px;">
            <span>{{ base }}/{{ ver }}</span>
            <button type="button" class="btn btn-xs btn-danger"
                    hx-post="/delete-version"
                    hx-vals='{"base": "{{ base }}", "version": "{{ ver }}"}'
                    hx-target="#grid" hx-swap="innerHTML"
                    hx-disabled-elt="this"
                    hx-on::after-request="this.closest('li').remove()">
              <span class="label-normal"><span class="ui-icon icon-trash" aria-hidden="true"></span> delete</span>
              <span class="htmx-indicator"><span class="spin"></span> deleting…</span>
            </button>
          </li>
        {% endfor %}
      </ul>
      <div class="flex gap-2 justify-end">
        <button type="button" class="btn" onclick="document.getElementById('cleanup-bg').remove()">Done</button>
      </div>
    </div>
  </div>
  {% endif %}
</div>
"""

PROMOTE_MODAL = r"""
<div class="modal-bg" id="promote-bg" onclick="if(event.target.id==='promote-bg')this.remove()">
  <form class="modal" hx-post="/promote" hx-target="#grid" hx-swap="innerHTML"
        hx-on::after-request="document.getElementById('promote-bg').remove()">
    <h2 class="text-lg font-semibold mb-4">Promote a version</h2>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Module</label>
      <select name="module" class="w-full">
        {% for m in modules %}
          <option value="{{ m }}">{{ m }}</option>
        {% endfor %}
      </select>
    </div>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Tags to apply</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tags" value="stage" checked /> stage
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tags" value="latest" /> latest
        </label>
      </div>
    </div>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Version selection</label>
      <div class="flex flex-col gap-1 text-sm">
        <label class="flex items-center gap-2">
          <input type="radio" name="mode" value="specific" checked />
          Specific version (applied to all chains)
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" name="mode" value="auto" />
          Auto — newest 100% synced per chain
        </label>
      </div>
    </div>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Version (for "specific" mode)</label>
      <input type="text" name="version" placeholder="v0.1.1" class="w-full" />
    </div>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Chains (leave empty = all prod chains)</label>
      <div class="grid grid-cols-3 gap-1 text-xs max-h-40 overflow-auto">
        {% for c in chains %}
          <label class="flex items-center gap-1">
            <input type="checkbox" name="chains" value="{{ c.key }}" {% if c.key in prod %}checked{% endif %} />
            {{ c.key }}
          </label>
        {% endfor %}
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="require_synced" value="1" checked />
        Require 100% sync before tagging
      </label>
    </div>
    <div class="mb-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="delete_displaced" value="1" />
        Also delete displaced versioned deployments (destructive)
      </label>
    </div>
    <div class="mb-4">
      <label class="flex items-start gap-2 text-sm">
        <input type="checkbox" name="update_pipelines" value="1" checked />
        <span>
          Update managed Goldsky pipelines
          <span class="text-xs text-gray-500 block">Runs only after every selected promotion succeeds.</span>
        </span>
      </label>
    </div>

    <div class="flex gap-2 justify-end">
      <button type="button" class="btn" onclick="document.getElementById('promote-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">Promote</button>
    </div>
  </form>
</div>
"""

DEPLOY_MODAL = r"""
<div class="modal-bg" id="deploy-bg" onclick="if(event.target.id==='deploy-bg')this.remove()">
  <form class="modal" hx-post="/deploy" hx-swap="none"
        hx-on::before-request="document.getElementById('deploy-bg')?.remove()">
    <h2 class="text-lg font-semibold mb-4">Deploy a new version</h2>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Module</label>
      <select name="module" class="w-full">
        {% for m in modules %}
          <option value="{{ m }}">{{ m }}</option>
        {% endfor %}
      </select>
    </div>

    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1">Version label</label>
      <input type="text" name="version" placeholder="v0.1.2" class="w-full" required />
    </div>

    <div class="mb-4">
      <label class="text-xs text-gray-400 block mb-1">Chains</label>
      <div class="grid grid-cols-3 gap-1 text-xs max-h-40 overflow-auto">
        {% for c in chains %}
          <label class="flex items-center gap-1">
            <input type="checkbox" name="chains" value="{{ c.key }}" {% if c.key in prod %}checked{% endif %} />
            {{ c.key }}
          </label>
        {% endfor %}
      </div>
    </div>

    <div class="flex gap-2 justify-end">
      <button type="button" class="btn" onclick="document.getElementById('deploy-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">
        <span class="label-normal">Deploy</span>
        <span class="htmx-indicator"><span class="spin"></span> starting…</span>
      </button>
    </div>
  </form>
</div>
"""

JOBS_PANEL = r"""
<div class="activity-header">
  <h3 class="text-sm font-semibold text-gray-300">Activity</h3>
  <span class="text-xs text-gray-500">
    {% set running = jobs|selectattr('status','equalto','running')|list|length %}
    {% if running %}<span style="color:#e5c075;">{{ running }} running</span> · {% endif %}
    {{ jobs|length }} total
  </span>
</div>
<div class="activity-list">
{% if not jobs %}
  <div class="activity-empty">No activity yet.<br><span style="color:#4a5160;">Batch deploy, tag, promote, and delete progress appears here.</span></div>
{% else %}
  {% for j in jobs %}
    <div class="act-item {{ j.status }}" id="job-{{ j.id }}">
      <div class="act-icon {{ j.status }}"></div>
      <div class="act-body">
        <div class="act-label">{{ j.label }}</div>
        <div class="act-meta">
          <span class="act-kind {{ j.kind }}">{{ j.kind }}</span>
          {% if j.status == 'running' %}
            <span>running · {{ j.elapsed }}</span>
          {% elif j.status == 'done' %}
            <span style="color:#7ee195;">done</span>
            <span>· {{ j.elapsed }}</span>
            <span>· {{ j.ago }}</span>
          {% elif j.status == 'failed' %}
            <span style="color:#ff9a93;">failed{% if j.rc not in (None, 1) %} (rc={{ j.rc }}){% endif %}</span>
            <span>· {{ j.ago }}</span>
          {% endif %}
        </div>
        {% if j.step_total %}
          <div class="act-progress">
            <div class="act-progress-head">
              <span class="act-progress-step">
                {% if j.status == 'queued' %}
                  Queued {{ j.step_total }} steps
                {% else %}
                  Step {{ j.step_current }} of {{ j.step_total }}
                {% endif %}
              </span>
              <span>{{ j.completed_steps }}/{{ j.step_total }} complete</span>
            </div>
            {% if j.current_step_label %}
              <div class="act-progress-target">{{ j.current_step_label }}</div>
            {% endif %}
            <div class="act-progress-bar">
              <div class="act-progress-fill" style="width: {{ j.progress_percent }}%;"></div>
            </div>
          </div>
        {% endif %}
        {% if j.tail_text %}
          <details class="act-details">
            <summary>log ({{ j.line_count }} line{{ 's' if j.line_count != 1 else '' }})</summary>
            <pre class="act-log">{{ j.tail_text }}</pre>
          </details>
        {% endif %}
      </div>
    </div>
  {% endfor %}
{% endif %}
</div>
"""

PROMOTE_RESULT = r"""
<div class="card p-3 mb-3" style="border-color: #2f6feb;">
  <strong>Promote result</strong>
  <pre class="log mt-2">{{ log }}</pre>
  <div class="text-xs text-gray-500 mt-2">
    applied: {{ applied_count }} · skipped: {{ skipped_count }} · failed: {{ failed_count }}
  </div>
</div>
{{ grid | safe }}
"""

BULK_DEPLOY_MODAL = r"""
<div class="modal-bg" id="bulk-deploy-bg" onclick="if(event.target.id==='bulk-deploy-bg')this.remove()">
  <form class="modal bulk-modal"
        hx-post="/bulk-deploy" hx-swap="none"
        hx-on::before-request="document.getElementById('bulk-deploy-bg')?.remove(); window.clearSelection && window.clearSelection()">

    <div class="modal-head">
      <div class="modal-title">
        <span class="modal-icon" style="background: rgba(47,111,235,.15); color: #82b1ff; border-color: rgba(47,111,235,.35);"><span class="ui-icon icon-deploy" aria-hidden="true"></span></span>
        <div>
          <div class="modal-title-text">Deploy a new version</div>
          <div class="modal-subtitle">to {{ selections|length }} subgraph{{ 's' if selections|length != 1 else '' }}</div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Version label</label>
        <input type="text" name="version" placeholder="v0.1.2" required
               class="form-input" autofocus />
        <div class="form-hint">Becomes the Goldsky version tag — alphanumeric / dot / dash only.</div>
      </div>

      <div class="form-group">
        <label class="form-label">Targets</label>
        <div class="selection-preview">
          {% for s in selections %}
            <div class="selection-row">
              <span class="pill pill-gray" style="font-family: ui-monospace, monospace;">{{ s.base }}</span>
              <span class="text-xs text-gray-500">{{ s.chain }} · {{ s.module }}</span>
              <input type="hidden" name="selections" value="{{ s.chain }}|{{ s.module }}" />
            </div>
          {% endfor %}
        </div>
      </div>
    </div>

    <div class="modal-foot">
      <button type="button" class="btn btn-ghost"
              onclick="document.getElementById('bulk-deploy-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">
        <span class="label-normal">Deploy to {{ selections|length }}</span>
        <span class="htmx-indicator"><span class="spin"></span> starting jobs…</span>
      </button>
    </div>
  </form>
</div>
"""

BULK_PROMOTE_MODAL = r"""
<div class="modal-bg" id="bulk-promote-bg" onclick="if(event.target.id==='bulk-promote-bg')this.remove()">
  <form class="modal bulk-modal"
        hx-post="/bulk-promote" hx-swap="none"
        hx-on::before-request="document.getElementById('bulk-promote-bg')?.remove(); window.clearSelection && window.clearSelection()">

    <div class="modal-head">
      <div class="modal-title">
        <span class="modal-icon" style="background: rgba(47,111,235,.15); color: #82b1ff; border-color: rgba(47,111,235,.35);"><span class="ui-icon icon-promote" aria-hidden="true"></span></span>
        <div>
          <div class="modal-title-text">Promote a version</div>
          <div class="modal-subtitle">across {{ selections|length }} subgraph{{ 's' if selections|length != 1 else '' }}</div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Tags to apply</label>
        <div class="check-group">
          <label class="check-row">
            <input type="checkbox" name="tags" value="stage" checked />
            <span class="pill pill-blue">stage</span>
            <span class="form-hint">mark as staging</span>
          </label>
          <label class="check-row">
            <input type="checkbox" name="tags" value="latest" />
            <span class="pill pill-blue">latest</span>
            <span class="form-hint">mark as production</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Version selection</label>
        <div class="radio-group">
          <label class="radio-row">
            <input type="radio" name="mode" value="specific" checked
                   onchange="document.getElementById('bulk-ver').disabled = false" />
            <div class="radio-body">
              <div>Specific version</div>
              <div class="form-hint">apply the same version label to every selected subgraph</div>
            </div>
          </label>
          <label class="radio-row">
            <input type="radio" name="mode" value="auto"
                   onchange="document.getElementById('bulk-ver').disabled = true" />
            <div class="radio-body">
              <div>Auto — newest 100% synced per subgraph</div>
              <div class="form-hint">each subgraph gets its own highest fully-synced version</div>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Version (for "specific" mode)</label>
        <input id="bulk-ver" type="text" name="version" placeholder="v0.1.2" class="form-input" />
      </div>

      <div class="form-group">
        <label class="check-row" style="font-size: 12px;">
          <input type="checkbox" name="require_synced" value="1" checked />
          <span>Require 100% sync before tagging</span>
        </label>
        <label class="check-row" style="font-size: 12px;">
          <input type="checkbox" name="delete_displaced" value="1" />
          <span style="color: #ff9a93;">Also delete displaced versions (destructive)</span>
        </label>
      </div>

      <div class="form-group">
        <label class="check-row" style="font-size: 12px; align-items: flex-start;">
          <input type="checkbox" name="update_pipelines" value="1" checked />
          <span>
            Update managed Goldsky pipelines
            <span class="form-hint block">
              Runs only after every selected promotion succeeds{% if affected_pipelines %}: {{ affected_pipelines|join(', ') }}{% endif %}.
            </span>
          </span>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">Targets</label>
        <div class="selection-preview">
          {% for s in selections %}
            <div class="selection-row">
              <span class="pill pill-gray" style="font-family: ui-monospace, monospace;">{{ s.base }}</span>
              <span class="text-xs text-gray-500">{{ s.chain }} · {{ s.module }}</span>
              <input type="hidden" name="selections" value="{{ s.chain }}|{{ s.module }}" />
            </div>
          {% endfor %}
        </div>
      </div>
    </div>

    <div class="modal-foot">
      <button type="button" class="btn btn-ghost"
              onclick="document.getElementById('bulk-promote-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">
        <span class="label-normal">Promote {{ selections|length }}</span>
        <span class="htmx-indicator"><span class="spin"></span> promoting…</span>
      </button>
    </div>
  </form>
</div>
"""

_env = Environment(
    loader=DictLoader(
        {
            "base": BASE_HTML,
            "grid": GRID_HTML,
            "promote_modal": PROMOTE_MODAL,
            "deploy_modal": DEPLOY_MODAL,
            "jobs_panel": JOBS_PANEL,
            "promote_result": PROMOTE_RESULT,
            "skeleton_grid": SKELETON_GRID,
            "toast_oob": TOAST_OOB,
            "last_fetched_oob": LAST_FETCHED_OOB,
            "row_promote_modal": ROW_PROMOTE_MODAL,
            "post_promote_cleanup_oob": POST_PROMOTE_CLEANUP_OOB,
            "bulk_deploy_modal": BULK_DEPLOY_MODAL,
            "bulk_promote_modal": BULK_PROMOTE_MODAL,
        }
    ),
    autoescape=select_autoescape(default=True, default_for_string=True),
)


def render_toast(kind: str, title: str, body: str = "") -> str:
    return _env.get_template("toast_oob").render(kind=kind, title=title, body=body)


def render_last_fetched_oob() -> str:
    return _env.get_template("last_fetched_oob").render(label=_last_fetched_label())


# ────────────────────────────────────────────────────────────────────
# Row building
# ────────────────────────────────────────────────────────────────────


def _pipeline_views(
    base: str,
    dependencies: dict[str, list[PipelineDependency]],
    state: GoldskyState,
    target_version: str,
) -> list[dict[str, Any]]:
    views: list[dict[str, Any]] = []
    for dependency in dependencies.get(base, []):
        is_live = dependency.pipeline in state.verified_managed_pipelines
        configured_versions = (
            state.managed_pipeline_versions.get(dependency.pipeline, {}).get(base, ())
            if is_live
            else dependency.configured_versions
        )
        if not is_live or not target_version:
            status = "unknown"
        elif configured_versions == (target_version,):
            status = "current"
        else:
            status = "outdated"
        views.append(
            {
                "name": dependency.pipeline,
                "reference_count": dependency.reference_count,
                "configured_versions": list(configured_versions),
                "version_source": "goldsky" if is_live else "config",
                "status": status,
            }
        )
    return views


async def update_pipeline_to_version(base: str, version: str = "") -> tuple[str, str, str]:
    """Switch every managed pipeline reference for a subgraph to a deployed version."""
    if not base:
        raise HTTPException(400, "base required")

    dependencies = load_pipeline_dependencies()
    if base not in dependencies:
        raise HTTPException(400, f"{base} has no repository-managed pipeline")

    target_version = version.strip() or _latest_deployed_version(_store.state, base)
    if not target_version:
        raise HTTPException(400, f"{base} has no deployed version")
    if f"{base}/{target_version}" not in _store.state.deployments:
        raise HTTPException(400, f"{base}/{target_version} is not a deployed version")

    pipeline_views = _pipeline_views(base, dependencies, _store.state, target_version)
    if pipeline_views and all(pipeline["status"] == "current" for pipeline in pipeline_views):
        return "ok", "Managed pipelines already current", f"{base} already uses {target_version}"

    activity = register_activity(f"Switch managed pipelines → {base}/{target_version}", kind="pipeline")
    ok, lines = await asyncio.to_thread(do_pipeline_update, {base: target_version})
    detail = "\n".join(lines)
    activity.finish(ok, detail)
    if ok:
        _store.apply_pipeline_versions({base: target_version})
        return "ok", f"Managed pipelines switched to {target_version}", f"{base} · {len(dependencies[base])} pipeline(s)"
    return "err", "Managed pipeline switch failed", detail


def build_chain_groups(chains: list[ChainConfig], state: GoldskyState) -> list[dict[str, Any]]:
    """Group deployments by chain so analytics + events sit together in the UI.

    Chains/modules with no Goldsky presence (no deployments AND no tag pointers)
    are omitted — they're noise until something is actually deployed.

    Any Goldsky subgraph not referenced by any local config is surfaced at the
    end as an "unmapped" group so operators can still inspect/manage it."""
    groups: list[dict[str, Any]] = []
    pipeline_dependencies = load_pipeline_dependencies()
    known_bases: set[str] = set()
    for c in chains:
        for base in c.deploy_urls.values():
            known_bases.add(base)

    for c in sorted(chains, key=lambda x: _chain_sort_key(x.key)):
        module_rows: list[dict[str, Any]] = []
        for module in MODULES:
            base = c.deploy_urls.get(module)
            if not base:
                continue
            deployments = sorted(state.for_base(base), key=lambda deployment: _version_sort_key(deployment.version))
            tags = state.tags.get(base, {})
            if not deployments and not tags:
                continue
            latest_version = deployments[-1].version if deployments else ""
            module_rows.append(
                {
                    "module": module,
                    "module_short": module.split("/")[-1],
                    "base": base,
                    "deployments": deployments,
                    "tags": tags,
                    "latest_deployed_version": latest_version,
                    "managed_pipelines": _pipeline_views(base, pipeline_dependencies, state, latest_version),
                }
            )
        if not module_rows:
            continue
        groups.append(
            {
                "chain": c.key,
                "network": c.network,
                "is_prod": c.key in PROD_CONFIGS,
                "is_stage": c.key in STAGE_CONFIGS,
                "is_orphan": False,
                "logo_url": chain_logo_url(c.key),
                "modules": module_rows,
            }
        )

    # Collect every Goldsky base that actually has something deployed or tagged.
    all_goldsky_bases: set[str] = {d.base_name for d in state.deployments.values()}
    all_goldsky_bases.update(state.tags.keys())
    orphan_bases = sorted(all_goldsky_bases - known_bases)

    for orphan_base in orphan_bases:
        deployments = sorted(state.for_base(orphan_base), key=lambda deployment: _version_sort_key(deployment.version))
        tags = state.tags.get(orphan_base, {})
        if not deployments and not tags:
            continue
        # Try to guess the module ("analytics" / "events" / …) from the base name.
        guessed_module = "?"
        for m in MODULES:
            short = m.split("/")[-1]
            if short in orphan_base:
                guessed_module = short
                break
        # Try to pull a logo by detecting a known chain slug inside the base name
        # (e.g. "base_dev_analytics" → base, "vibe-back-hyperevm-mainnet" → hyperevm).
        guessed_logo: str | None = None
        for key in CHAIN_LOGO_SLUG:
            if key in orphan_base.lower():
                guessed_logo = chain_logo_url(key)
                break
        latest_version = deployments[-1].version if deployments else ""
        groups.append(
            {
                "chain": orphan_base,
                "network": "(not in local configs)",
                "is_prod": False,
                "is_stage": False,
                "is_orphan": True,
                "logo_url": guessed_logo,
                "modules": [
                    {
                        "module": "orphan",
                        "module_short": guessed_module,
                        "base": orphan_base,
                        "deployments": deployments,
                        "tags": tags,
                        "latest_deployed_version": latest_version,
                        "managed_pipelines": _pipeline_views(orphan_base, pipeline_dependencies, state, latest_version),
                    }
                ],
            }
        )
    return groups


def render_grid(store: FleetStore) -> str:
    groups = build_chain_groups(store.chains, store.state)
    active_chain_meta = [{"k": g["chain"], "o": bool(g.get("is_orphan"))} for g in groups]
    rows = [row for g in groups for row in g["modules"]]
    deployments = [d for row in rows for d in row["deployments"]]
    summary = {
        "chains": len(groups),
        "rows": len(rows),
        "deployments": len(deployments),
        "tags": sum(len(row["tags"]) for row in rows),
        "multi_version": sum(1 for row in rows if len(row["deployments"]) > 1),
        "attention": sum(1 for d in deployments if d.synced != "100%" or ("healthy" not in d.status.lower() if d.status else False)),
    }
    return _env.get_template("grid").render(
        groups=groups,
        active_chain_meta=active_chain_meta,
        summary=summary,
        goldsky_project=GOLDSKY_PROJECT_ID,
    )


def build_summary(groups: list[dict[str, Any]]) -> dict[str, int]:
    rows = [row for g in groups for row in g["modules"]]
    deployments = [d for row in rows for d in row["deployments"]]
    return {
        "chains": len(groups),
        "rows": len(rows),
        "deployments": len(deployments),
        "tags": sum(len(row["tags"]) for row in rows),
        "multi_version": sum(1 for row in rows if len(row["deployments"]) > 1),
        "attention": sum(1 for d in deployments if d.synced != "100%" or ("healthy" not in d.status.lower() if d.status else False)),
    }


def build_fleet_payload(store: FleetStore) -> dict[str, Any]:
    groups = build_chain_groups(store.chains, store.state)
    serial_groups: list[dict[str, Any]] = []
    for g in groups:
        modules = []
        for row in g["modules"]:
            modules.append({
                **row,
                "deployments": [asdict(d) for d in row["deployments"]],
            })
        serial_groups.append({**g, "modules": modules})

    return {
        "groups": serial_groups,
        "summary": build_summary(groups),
        "modules": MODULES,
        "prodChains": sorted(PROD_CONFIGS),
        "stageChains": sorted(STAGE_CONFIGS),
        "goldskyProject": GOLDSKY_PROJECT_ID,
        "lastFetchedAt": store.last_fetched_at,
        "lastFetchedLabel": _last_fetched_label(),
        "lastError": store.last_error,
        "jobs": build_job_views(),
    }


def _format_duration(seconds: float) -> str:
    if seconds < 1:
        return f"{int(seconds * 1000)}ms"
    if seconds < 60:
        return f"{seconds:.1f}s"
    if seconds < 3600:
        return f"{int(seconds // 60)}m {int(seconds % 60)}s"
    return f"{int(seconds // 3600)}h {int((seconds % 3600) // 60)}m"


def _format_ago(ts: float) -> str:
    if not ts:
        return ""
    delta = time.time() - ts
    if delta < 60:
        return f"{int(delta)}s ago"
    if delta < 3600:
        return f"{int(delta // 60)}m ago"
    if delta < 86400:
        return f"{int(delta // 3600)}h ago"
    return f"{int(delta // 86400)}d ago"


def build_job_views() -> list[dict[str, Any]]:
    job_views: list[dict[str, Any]] = []
    now = time.time()
    for j in sorted(_JOBS.values(), key=lambda j: j.started or 0, reverse=True)[:30]:
        lines = j.lines
        # Short ops don't need a log block unless they have multiple lines
        tail = "\n".join(lines[-40:])
        if j.status == "running":
            elapsed = _format_duration(now - j.started) if j.started else "…"
        else:
            elapsed = _format_duration((j.ended - j.started) if j.ended and j.started else 0)
        step_total = len(j.steps)
        step_current = j.current_step_index or (step_total if j.status in {"done", "failed"} and step_total else 0)
        progress_percent = int((step_current / step_total) * 100) if step_total else 0
        job_views.append({
            "id": j.id,
            "label": j.label,
            "kind": j.kind or "op",
            "status": j.status,
            "rc": j.rc,
            "elapsed": elapsed,
            "ago": _format_ago(j.ended or j.started),
            "step_current": step_current,
            "step_total": step_total,
            "current_step_label": j.current_step_label,
            "completed_steps": j.completed_steps,
            "progress_percent": progress_percent,
            "line_count": len(lines),
            "tail_text": tail,
        })
    return job_views


def render_jobs_panel() -> str:
    job_views = build_job_views()
    return _env.get_template("jobs_panel").render(jobs=job_views)


# ────────────────────────────────────────────────────────────────────
# App
# ────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def _lifespan(app: FastAPI):
    """Capture the running event loop so broadcast_activity (called from
    worker threads) can schedule pushes via call_soon_threadsafe."""
    global _event_loop
    _event_loop = asyncio.get_running_loop()
    yield
    _event_loop = None


app = FastAPI(title="Symmio Fleet Web", lifespan=_lifespan)
if (FLEET_UI_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FLEET_UI_DIST / "assets"), name="fleet-ui-assets")
_store = FleetStore()


@app.get("/healthz", response_class=JSONResponse)
def healthz() -> JSONResponse:
    return JSONResponse(FLEET_HEALTH_PAYLOAD)


def _last_fetched_label() -> str:
    if not _store.last_fetched_at:
        return "not yet fetched"
    ago = int(time.time() - _store.last_fetched_at)
    return f"last fetched {ago}s ago"


@app.get("/", response_class=HTMLResponse)
def index():
    if FLEET_UI_INDEX.exists():
        return FileResponse(FLEET_UI_INDEX)
    """Render the shell immediately — grid lazy-loads via htmx so the browser
    paints before the Goldsky fetch completes."""
    initial_chain_chips: list[dict[str, Any]] = []
    prod_chain_keys: list[str] = []
    stage_chain_keys: list[str] = []
    if _store.last_fetched_at:
        initial_grid = render_grid(_store)
        groups = build_chain_groups(_store.chains, _store.state)
        for g in groups:
            initial_chain_chips.append({"key": g["chain"], "orphan": bool(g.get("is_orphan"))})
            if g.get("is_prod"):
                prod_chain_keys.append(g["chain"])
            if g.get("is_stage"):
                stage_chain_keys.append(g["chain"])
    else:
        initial_grid = _env.get_template("skeleton_grid").render()
    html = _env.get_template("base").render(
        initial_grid=initial_grid,
        jobs_panel=render_jobs_panel(),
        last_fetched_label=_last_fetched_label(),
        last_error=_store.last_error,
        all_chains=initial_chain_chips,
        prod_chains=sorted(prod_chain_keys),
        stage_chains=sorted(stage_chain_keys),
        goldsky_project=GOLDSKY_PROJECT_ID,
    )
    return HTMLResponse(html)


@app.get("/grid", response_class=HTMLResponse)
async def grid_fragment() -> HTMLResponse:
    """Returned by the htmx `load` trigger on #grid. Triggers the initial
    Goldsky fetch if it hasn't run yet."""
    if not _store.last_fetched_at:
        await asyncio.to_thread(_store.fetch)
    toast = ""
    if _store.last_error:
        toast = render_toast("err", "Goldsky fetch failed", _store.last_error)
    return HTMLResponse(render_grid(_store) + render_last_fetched_oob() + toast)


@app.post("/refresh", response_class=HTMLResponse)
async def refresh() -> HTMLResponse:
    act = register_activity("Fetch goldsky state", kind="refresh")
    ok, err = await asyncio.to_thread(_store.fetch)
    if ok:
        detail = f"{len(_store.state.deployments)} deployments · {len(_store.state.tags)} subgraphs"
        act.finish(True, detail)
        toast = render_toast("ok", "State refreshed", detail)
    else:
        act.finish(False, err)
        toast = render_toast("err", "Refresh failed", err)
    return HTMLResponse(render_grid(_store) + render_last_fetched_oob() + toast)


@app.get("/promote", response_class=HTMLResponse)
def promote_form() -> HTMLResponse:
    html = _env.get_template("promote_modal").render(
        chains=sorted(_store.chains, key=lambda c: c.key),
        modules=MODULES,
        prod=PROD_CONFIGS,
    )
    return HTMLResponse(html)


@app.post("/promote", response_class=HTMLResponse)
async def promote(request: Request) -> HTMLResponse:
    form = await request.form()
    module = str(form.get("module", ""))
    tags = [str(t) for t in form.getlist("tags")]
    mode = str(form.get("mode", "specific"))
    version = str(form.get("version", "")).strip()
    chains_sel = [str(k) for k in form.getlist("chains")]
    require_synced = form.get("require_synced") == "1"
    delete_displaced = form.get("delete_displaced") == "1"
    update_pipelines = form.get("update_pipelines") == "1"

    if module not in MODULES or not tags:
        raise HTTPException(400, "module + at least one tag required")
    if mode == "specific" and not version:
        raise HTTPException(400, "version required for specific mode")

    state = _store.state
    chain_objs = [c for c in _store.chains if not chains_sel or c.key in chains_sel]

    log_lines: list[str] = []
    applied_count = 0
    skipped_count = 0
    failed_count = 0
    promoted_versions: dict[str, str] = {}

    for c in chain_objs:
        base = c.deploy_urls.get(module)
        if not base:
            log_lines.append(f"{c.key}: skip — no deploy_url for {module}")
            skipped_count += 1
            continue

        # Pick per-chain version
        if mode == "auto":
            synced = [d for d in state.for_base(base) if d.synced == "100%"]
            if not synced:
                log_lines.append(f"{c.key}: skip — no 100% synced deployment")
                skipped_count += 1
                continue
            ver_for_chain = max(synced, key=lambda deployment: _version_sort_key(deployment.version)).version
        else:
            ver_for_chain = version

        dep = state.deployments.get(f"{base}/{ver_for_chain}")
        if dep is None:
            log_lines.append(f"{c.key}: skip — {base}/{ver_for_chain} not deployed")
            skipped_count += 1
            continue
        if require_synced and dep.synced != "100%":
            log_lines.append(f"{c.key}: skip — sync {dep.synced or '?'} < 100%")
            skipped_count += 1
            continue

        displaced_versions: set[str] = set()
        chain_ok = True
        for tag in tags:
            old = state.tag_target(base, tag)
            if old == ver_for_chain:
                log_lines.append(f"{c.key}: tag '{tag}' already on {ver_for_chain}")
                continue
            if old and old != ver_for_chain:
                ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
                log_lines.append(
                    f"{c.key}: delete-old-tag {base}/{old} --tag {tag} → {'ok' if ok_del else 'fail'}"
                )
                if ok_del:
                    _store.apply_tag_remove(base, tag)
                    displaced_versions.add(old)
            ok_add, out_add = await asyncio.to_thread(do_tag_create, base, ver_for_chain, tag)
            log_lines.append(
                f"{c.key}: tag {base}/{ver_for_chain} --tag {tag} → {'ok' if ok_add else 'FAIL: ' + out_add}"
            )
            if ok_add:
                _store.apply_tag_set(base, tag, ver_for_chain)
            else:
                chain_ok = False
                break

        if chain_ok:
            applied_count += 1
            promoted_versions[base] = ver_for_chain
        else:
            failed_count += 1
            continue

        if delete_displaced:
            original_tags = state.tags.get(base, {})
            for old_ver in sorted(displaced_versions):
                # Skip if another tag we didn't touch still points at it
                remaining = [t for t, v in original_tags.items() if v == old_ver and t not in tags]
                if remaining:
                    log_lines.append(
                        f"{c.key}: keep {base}/{old_ver} — still tagged as {', '.join(remaining)}"
                    )
                    continue
                ok_d, out_d = await asyncio.to_thread(do_subgraph_delete, base, old_ver)
                log_lines.append(f"{c.key}: delete {base}/{old_ver} → {'ok' if ok_d else 'FAIL: ' + out_d}")
                if ok_d:
                    _store.apply_deployment_remove(base, old_ver)

    pipeline_ok = True
    if update_pipelines:
        if applied_count == len(chain_objs):
            pipeline_ok, pipeline_lines = await asyncio.to_thread(do_pipeline_update, promoted_versions)
            log_lines.extend(pipeline_lines)
            if pipeline_ok:
                _store.apply_pipeline_versions(promoted_versions)
        else:
            pipeline_ok = False
            log_lines.append("pipelines: skipped because not every selected promotion succeeded")

    result_html = _env.get_template("promote_result").render(
        log="\n".join(log_lines) or "(no chains matched)",
        applied_count=applied_count,
        skipped_count=skipped_count,
        failed_count=failed_count,
        grid=render_grid(_store),
    )
    if applied_count and not pipeline_ok:
        toast = render_toast(
            "err",
            "Promotion completed, but pipelines were not updated",
            f"applied {applied_count}, skipped {skipped_count}, failed {failed_count}",
        )
    elif failed_count:
        toast = render_toast("err", f"Promote finished with {failed_count} failure(s)", f"applied {applied_count}, skipped {skipped_count}")
    elif applied_count:
        toast = render_toast("ok", f"Promoted {applied_count} chain(s) → {'/'.join(tags)}", f"skipped {skipped_count}")
    else:
        toast = render_toast("err", "No chains eligible to promote", f"skipped {skipped_count}")
    return HTMLResponse(result_html + toast)


@app.get("/deploy", response_class=HTMLResponse)
def deploy_form() -> HTMLResponse:
    html = _env.get_template("deploy_modal").render(
        chains=sorted(_store.chains, key=lambda c: c.key),
        modules=MODULES,
        prod=PROD_CONFIGS,
    )
    return HTMLResponse(html)


@app.post("/deploy", response_class=HTMLResponse)
async def deploy(request: Request) -> HTMLResponse:
    form = await request.form()
    module = str(form.get("module", ""))
    version = str(form.get("version", "")).strip()
    chains_sel = [str(k) for k in form.getlist("chains")]
    if module not in MODULES or not version or not chains_sel:
        raise HTTPException(400, "module, version, and at least one chain required")

    queue_chain_deploy_jobs(module, chains_sel, version)

    return HTMLResponse(render_jobs_panel())


@app.get("/jobs", response_class=HTMLResponse)
def jobs_fragment() -> HTMLResponse:
    """Fallback fragment — also used on initial page load."""
    return HTMLResponse(render_jobs_panel())


@app.get("/events")
async def sse_events() -> StreamingResponse:
    """Server-sent events stream for activity pane updates.

    Replaces the old 3s polling — the server pushes the pane HTML only when
    job state actually changes. Sends a keepalive comment every ~25s to keep
    proxies from closing idle connections."""
    q: asyncio.Queue[str] = asyncio.Queue(maxsize=20)
    with _sse_lock:
        _sse_subscribers.add(q)

    async def gen():
        try:
            # Send the current state immediately so reconnects re-sync.
            yield _sse_message("activity", render_jobs_panel())
            while True:
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=25.0)
                    yield msg
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:  # pragma: no cover
            pass
        finally:
            with _sse_lock:
                _sse_subscribers.discard(q)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/job/{job_id}", response_class=HTMLResponse)
def job_card(job_id: str) -> HTMLResponse:
    job = _JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    tail = "\n".join(job.lines[-200:]) or "(no output yet)"
    view = {"id": job.id, "label": job.label, "status": job.status, "rc": job.rc, "tail_text": tail}
    # Render just one job card inline (matches structure inside JOBS_PANEL)
    html = _env.from_string(
        r"""
<div class="card p-3" id="job-{{ j.id }}">
  <div class="flex justify-between items-center mb-2">
    <div>
      <strong class="text-sm">{{ j.label }}</strong>
      {% if j.status == 'running' %}
        <span class="pill pill-yellow ml-2">running</span>
      {% elif j.status == 'done' %}
        <span class="pill pill-green ml-2">done</span>
      {% elif j.status == 'failed' %}
        <span class="pill pill-red ml-2">failed (rc={{ j.rc }})</span>
      {% else %}
        <span class="pill pill-gray ml-2">{{ j.status }}</span>
      {% endif %}
    </div>
    <button class="btn btn-ghost" style="font-size: 10px;"
            hx-get="/job/{{ j.id }}" hx-target="#job-{{ j.id }}" hx-swap="outerHTML">
      refresh
    </button>
  </div>
  <pre class="log">{{ j.tail_text }}</pre>
</div>
"""
    ).render(j=view)
    return HTMLResponse(html)


@app.get("/job/{job_id}/stream")
def job_stream(job_id: str) -> StreamingResponse:
    job = _JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")

    def gen():
        # Emit everything already buffered, then live-tail
        for line in list(job.lines):
            yield f"data: {line}\n\n"
        q = job.tail()
        while True:
            item = q.get()
            if item is None:
                yield "event: done\ndata: \n\n"
                break
            yield f"data: {item}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.post("/remove-tag", response_class=HTMLResponse)
async def remove_tag(request: Request) -> HTMLResponse:
    form = await request.form()
    base = str(form.get("base", ""))
    version = str(form.get("version", ""))
    tag = str(form.get("tag", ""))
    if not base or not version or not tag:
        raise HTTPException(400, "base, version, tag required")
    act = register_activity(f"Untag '{tag}' on {base}/{version}", kind="untag")
    ok, out = await asyncio.to_thread(do_tag_delete, base, version, tag)
    if ok:
        _store.apply_tag_remove(base, tag)
        act.finish(True, f"removed '{tag}' from {base}/{version}")
        toast = render_toast("ok", f"Removed '{tag}' tag", f"{base}/{version}")
    else:
        act.finish(False, out)
        toast = render_toast("err", f"Failed to remove '{tag}'", out or f"{base}/{version}")
    return HTMLResponse(render_grid(_store) + toast)


@app.post("/move-tag", response_class=HTMLResponse)
async def move_tag(request: Request) -> HTMLResponse:
    """Set `tag` to point at `base/version`. If the tag already points somewhere
    else, deletes that old pointer first (but keeps the old deployment)."""
    form = await request.form()
    base = str(form.get("base", ""))
    version = str(form.get("version", ""))
    tag = str(form.get("tag", ""))
    if not base or not version or not tag:
        raise HTTPException(400, "base, version, tag required")

    old = _store.state.tag_target(base, tag)
    label = f"Move '{tag}' → {base}/{version}" + (f" (from {old})" if old else "")
    act = register_activity(label, kind="tag")
    log_bits: list[str] = []
    ok_overall = True

    if old and old != version:
        ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
        if ok_del:
            log_bits.append(f"removed old: {base}/{old}")
            _store.apply_tag_remove(base, tag)
        else:
            log_bits.append(f"old removal FAILED: {out_del}")
            ok_overall = False

    if ok_overall:
        ok_add, out_add = await asyncio.to_thread(do_tag_create, base, version, tag)
        if ok_add:
            log_bits.append(f"tagged {base}/{version} as {tag}")
            _store.apply_tag_set(base, tag, version)
        else:
            log_bits.append(f"tag create FAILED: {out_add}")
            ok_overall = False

    act.finish(ok_overall, "\n".join(log_bits))
    if ok_overall:
        title = f"Moved '{tag}' → {version}" if old else f"Tagged '{tag}' on {version}"
        toast = render_toast("ok", title, f"{base}" + (f" (was on {old})" if old else ""))
    else:
        toast = render_toast("err", f"Failed to set '{tag}'", "; ".join(log_bits))
    return HTMLResponse(render_grid(_store) + toast)


@app.post("/delete-version", response_class=HTMLResponse)
async def delete_version(request: Request) -> HTMLResponse:
    form = await request.form()
    base = str(form.get("base", ""))
    version = str(form.get("version", ""))
    if not base or not version:
        raise HTTPException(400, "base, version required")
    act = register_activity(f"Delete {base}/{version}", kind="delete")
    ok, out = await asyncio.to_thread(do_subgraph_delete, base, version)
    if ok:
        _store.apply_deployment_remove(base, version)
        act.finish(True, f"deleted {base}/{version}")
        toast = render_toast("ok", "Deleted deployment", f"{base}/{version}")
    else:
        act.finish(False, out)
        toast = render_toast("err", "Delete failed", out or f"{base}/{version}")
    return HTMLResponse(render_grid(_store) + toast)


@app.post("/update-pipeline", response_class=HTMLResponse)
async def update_pipeline(request: Request) -> HTMLResponse:
    form = await request.form()
    kind, title, body = await update_pipeline_to_version(str(form.get("base", "")), str(form.get("version", "")))
    return HTMLResponse(render_grid(_store) + render_toast(kind, title, body))


@app.get("/row-promote-form", response_class=HTMLResponse)
def row_promote_form(base: str, version: str) -> HTMLResponse:
    current_tags = _store.state.tags.get(base, {})
    affected_pipelines = [dependency.pipeline for dependency in load_pipeline_dependencies().get(base, [])]
    html = _env.get_template("row_promote_modal").render(
        base=base,
        version=version,
        current_tags=current_tags,
        affected_pipelines=affected_pipelines,
    )
    return HTMLResponse(html)


@app.post("/row-promote", response_class=HTMLResponse)
async def row_promote(request: Request) -> HTMLResponse:
    """Promote a single version on a specific chain to one or more tags.
    After tagging, emit an OOB modal asking whether to delete the displaced
    versions that no longer carry any tag."""
    form = await request.form()
    base = str(form.get("base", ""))
    version = str(form.get("version", ""))
    tags = [str(t) for t in form.getlist("tags")]
    update_pipelines = form.get("update_pipelines") == "1"
    if not base or not version:
        raise HTTPException(400, "base and version required")
    if not tags:
        toast = render_toast("err", "No tags selected", "Pick at least one tag.")
        return HTMLResponse(render_grid(_store) + toast)

    act = register_activity(f"Promote {base}/{version} → {'+'.join(tags)}", kind="promote")
    pre_tags = dict(_store.state.tags.get(base, {}))  # snapshot before mutations
    displaced: set[str] = set()
    log_bits: list[str] = []
    ok_overall = True

    for tag in tags:
        old = pre_tags.get(tag)
        if old == version:
            log_bits.append(f"'{tag}' already on {version}")
            continue
        if old:
            ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
            if ok_del:
                _store.apply_tag_remove(base, tag)
                displaced.add(old)
                log_bits.append(f"removed old: {base}/{old} (--tag {tag})")
            else:
                log_bits.append(f"delete old FAILED: {out_del}")
                ok_overall = False
                continue
        ok_add, out_add = await asyncio.to_thread(do_tag_create, base, version, tag)
        if ok_add:
            _store.apply_tag_set(base, tag, version)
            log_bits.append(f"tagged {base}/{version} as {tag}")
        else:
            log_bits.append(f"tag create FAILED for '{tag}': {out_add}")
            ok_overall = False

    # Only consider a version "displaced" if no remaining tag still points at it.
    remaining_tags = _store.state.tags.get(base, {})
    orphaned = [v for v in sorted(displaced) if not any(rv == v for rv in remaining_tags.values())]

    tags_ok = ok_overall
    pipeline_ok = True
    if update_pipelines and tags_ok:
        pipeline_ok, pipeline_lines = await asyncio.to_thread(do_pipeline_update, {base: version})
        log_bits.extend(pipeline_lines)
        if pipeline_ok:
            _store.apply_pipeline_versions({base: version})
    elif update_pipelines:
        pipeline_ok = False
        log_bits.append("pipelines: skipped because tag promotion failed")

    act.finish(tags_ok and pipeline_ok, "\n".join(log_bits))
    if tags_ok and pipeline_ok:
        toast = render_toast(
            "ok",
            f"Promoted to {'+'.join(tags)}",
            f"{base}/{version}" + (f" · displaced {', '.join(orphaned)}" if orphaned else ""),
        )
    elif tags_ok:
        toast = render_toast("err", "Promoted, but pipeline update failed", "; ".join(log_bits))
    else:
        toast = render_toast("err", "Promote had failures", "; ".join(log_bits))

    cleanup = _env.get_template("post_promote_cleanup_oob").render(
        base=base, version=version, tags=tags, displaced=orphaned,
    )
    return HTMLResponse(render_grid(_store) + toast + cleanup)


# ────────────────────────────────────────────────────────────────────
# Bulk actions (selection-based)
# ────────────────────────────────────────────────────────────────────


def _chain_lookup() -> dict[str, ChainConfig]:
    return {c.key: c for c in _store.chains}


async def _read_selections(request: Request) -> list[dict[str, Any]]:
    """Extract bulk-action selections from either JSON body (modal open) or
    form-encoded body (modal submit)."""
    ctype = request.headers.get("content-type", "")
    if "application/json" in ctype:
        data = await request.json()
        raw = data.get("selections") or []
        sels: list[dict[str, Any]] = []
        for item in raw:
            if isinstance(item, dict):
                sels.append({
                    "chain": str(item.get("chain", "")),
                    "module": str(item.get("module", "")),
                    "base": str(item.get("base", "")),
                    "orphan": bool(item.get("orphan")),
                })
        return [s for s in sels if s["chain"] and s["module"]]
    # form-encoded: selections=<chain>|<module> repeated
    form = await request.form()
    pairs = [str(p) for p in form.getlist("selections")]
    chain_by_key = _chain_lookup()
    sels = []
    for p in pairs:
        if "|" not in p:
            continue
        chain, module = p.split("|", 1)
        c = chain_by_key.get(chain)
        if c:
            base = c.deploy_urls.get(module, "")
            sels.append({"chain": chain, "module": module, "base": base, "orphan": False})
        else:
            # orphan — base name = chain key
            sels.append({"chain": chain, "module": module, "base": chain, "orphan": True})
    return sels


def _enrich_selections(sels: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Ensure selection dicts carry a 'base' resolved from the store if missing."""
    chain_by_key = _chain_lookup()
    pipeline_dependencies = load_pipeline_dependencies()
    out = []
    for s in sels:
        if not s.get("base"):
            c = chain_by_key.get(s["chain"])
            if c:
                s["base"] = c.deploy_urls.get(s["module"], "")
        base = s.get("base", "")
        target_version = _latest_deployed_version(_store.state, base)
        s["managed_pipelines"] = _pipeline_views(base, pipeline_dependencies, _store.state, target_version)
        out.append(s)
    return out


def _config_path_arg(c: ChainConfig) -> str:
    if c.path.is_absolute():
        return str(c.path.relative_to(REPO_ROOT))
    return str(c.path)


def queue_chain_deploy_jobs(module: str, chains_sel: list[str], version: str) -> tuple[int, list[str]]:
    steps: list[tuple[str, list[str]]] = []
    deployable_chains: list[str] = []
    for c in _store.chains:
        if c.key not in chains_sel:
            continue
        if module not in c.deploy_urls:
            continue
        step_label = f"{c.key} · {module} {version}"
        cmd = [
            sys.executable,
            "scripts/manager.py",
            _config_path_arg(c),
            module,
            version,
            "--deploy",
        ]
        steps.append((step_label, cmd))
        deployable_chains.append(c.key)

    if steps:
        start_job_sequence(
            label=f"Deploy {module} {version} · {len(steps)} chain{'s' if len(steps) != 1 else ''}",
            steps=steps,
            kind="deploy",
        )
    return len(steps), deployable_chains


def queue_bulk_deploy_jobs(selections: list[dict[str, Any]], version: str) -> tuple[int, list[str]]:
    chain_by_key = _chain_lookup()
    steps: list[tuple[str, list[str]]] = []
    deployable_chains: list[str] = []
    for s in selections:
        if s.get("orphan"):
            continue  # can't deploy to an unmapped subgraph
        c = chain_by_key.get(s["chain"])
        if not c or s["module"] not in c.deploy_urls:
            continue
        step_label = f"{s['chain']} · {s['module']} {version}"
        cmd = [
            sys.executable,
            "scripts/manager.py",
            _config_path_arg(c),
            s["module"],
            version,
            "--deploy",
        ]
        steps.append((step_label, cmd))
        deployable_chains.append(s["chain"])

    if steps:
        start_job_sequence(
            label=f"Batch deploy {version} · {len(steps)} subgraph{'s' if len(steps) != 1 else ''}",
            steps=steps,
            kind="deploy",
        )
    return len(steps), deployable_chains


@app.post("/bulk-deploy-form", response_class=HTMLResponse)
async def bulk_deploy_form(request: Request) -> HTMLResponse:
    selections = _enrich_selections(await _read_selections(request))
    if not selections:
        raise HTTPException(400, "no selections")
    html = _env.get_template("bulk_deploy_modal").render(selections=selections)
    return HTMLResponse(html)


@app.post("/bulk-promote-form", response_class=HTMLResponse)
async def bulk_promote_form(request: Request) -> HTMLResponse:
    selections = _enrich_selections(await _read_selections(request))
    if not selections:
        raise HTTPException(400, "no selections")
    affected_pipelines = sorted(
        {
            pipeline["name"]
            for selection in selections
            for pipeline in selection.get("managed_pipelines", [])
        }
    )
    html = _env.get_template("bulk_promote_modal").render(
        selections=selections,
        affected_pipelines=affected_pipelines,
    )
    return HTMLResponse(html)


@app.post("/bulk-deploy", response_class=HTMLResponse)
async def bulk_deploy(request: Request) -> HTMLResponse:
    selections = _enrich_selections(await _read_selections(request))
    form = await request.form()  # second call on the same Request is fine with Starlette cache
    version = str(form.get("version", "")).strip()
    if not version:
        raise HTTPException(400, "version required")
    if not selections:
        raise HTTPException(400, "no selections")

    queued, deployable_chains = queue_bulk_deploy_jobs(selections, version)

    if queued:
        toast = render_toast(
            "ok",
            f"Queued sequential deploy for {queued} subgraph{'s' if queued != 1 else ''}",
            f"version {version} → {', '.join(deployable_chains)}",
        )
    else:
        toast = render_toast("err", "Nothing deployed", "No deployable selections (orphans are skipped)")
    return HTMLResponse(toast)


@app.post("/bulk-promote", response_class=HTMLResponse)
async def bulk_promote(request: Request) -> HTMLResponse:
    form = await request.form()
    selections = _enrich_selections(await _read_selections(request))
    tags = [str(t) for t in form.getlist("tags")]
    mode = str(form.get("mode", "specific"))
    version = str(form.get("version", "")).strip()
    require_synced = form.get("require_synced") == "1"
    delete_displaced = form.get("delete_displaced") == "1"
    update_pipelines = form.get("update_pipelines") == "1"

    if not selections:
        raise HTTPException(400, "no selections")
    if not tags:
        toast = render_toast("err", "No tags selected", "Pick at least one tag.")
        return HTMLResponse(toast)
    if mode == "specific" and not version:
        toast = render_toast("err", "Missing version", "Enter a version label or switch to auto mode.")
        return HTMLResponse(toast)

    applied = 0
    skipped = 0
    failed = 0
    log_lines: list[str] = []
    promoted_versions: dict[str, str] = {}
    state = _store.state

    act = register_activity(
        f"Bulk promote → {'+'.join(tags)} on {len(selections)} subgraph(s)",
        kind="promote",
    )

    for s in selections:
        base = s["base"]
        if not base:
            log_lines.append(f"{s['chain']}: skip — no base")
            skipped += 1
            continue

        if mode == "auto":
            synced = [d for d in state.for_base(base) if d.synced == "100%"]
            if not synced:
                log_lines.append(f"{s['chain']}: skip — no 100% synced deployment")
                skipped += 1
                continue
            ver_for_chain = max(synced, key=lambda deployment: _version_sort_key(deployment.version)).version
        else:
            ver_for_chain = version

        dep = state.deployments.get(f"{base}/{ver_for_chain}")
        if dep is None:
            log_lines.append(f"{s['chain']}: skip — {base}/{ver_for_chain} not deployed")
            skipped += 1
            continue
        if require_synced and dep.synced != "100%":
            log_lines.append(f"{s['chain']}: skip — sync {dep.synced or '?'} < 100%")
            skipped += 1
            continue

        displaced_versions: set[str] = set()
        chain_ok = True
        for tag in tags:
            old = state.tag_target(base, tag)
            if old == ver_for_chain:
                log_lines.append(f"{s['chain']}: '{tag}' already on {ver_for_chain}")
                continue
            if old and old != ver_for_chain:
                ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
                if ok_del:
                    _store.apply_tag_remove(base, tag)
                    displaced_versions.add(old)
                    log_lines.append(f"{s['chain']}: removed old {base}/{old} (--tag {tag})")
                else:
                    log_lines.append(f"{s['chain']}: delete old FAILED: {out_del}")
                    chain_ok = False
                    break
            ok_add, out_add = await asyncio.to_thread(do_tag_create, base, ver_for_chain, tag)
            if ok_add:
                _store.apply_tag_set(base, tag, ver_for_chain)
                log_lines.append(f"{s['chain']}: tagged {base}/{ver_for_chain} as {tag}")
            else:
                log_lines.append(f"{s['chain']}: tag create FAILED: {out_add}")
                chain_ok = False
                break

        if not chain_ok:
            failed += 1
            continue
        applied += 1
        promoted_versions[base] = ver_for_chain

        if delete_displaced and displaced_versions:
            original_tags = state.tags.get(base, {})
            for old_ver in sorted(displaced_versions):
                remaining = [t for t, v in original_tags.items() if v == old_ver and t not in tags]
                if remaining:
                    log_lines.append(f"{s['chain']}: keep {base}/{old_ver} — still tagged as {', '.join(remaining)}")
                    continue
                ok_d, out_d = await asyncio.to_thread(do_subgraph_delete, base, old_ver)
                if ok_d:
                    _store.apply_deployment_remove(base, old_ver)
                    log_lines.append(f"{s['chain']}: deleted {base}/{old_ver}")
                else:
                    log_lines.append(f"{s['chain']}: delete FAILED: {out_d}")

    pipeline_ok = True
    if update_pipelines:
        if applied == len(selections):
            pipeline_ok, pipeline_lines = await asyncio.to_thread(do_pipeline_update, promoted_versions)
            log_lines.extend(pipeline_lines)
            if pipeline_ok:
                _store.apply_pipeline_versions(promoted_versions)
        else:
            pipeline_ok = False
            log_lines.append("pipelines: skipped because not every selected promotion succeeded")

    overall_ok = failed == 0 and applied > 0 and pipeline_ok
    act.finish(overall_ok, "\n".join(log_lines))

    if applied and not pipeline_ok:
        toast = render_toast(
            "err",
            "Promotion completed, but pipelines were not updated",
            f"applied {applied} · failed {failed} · skipped {skipped}",
        )
    elif applied and not failed:
        toast = render_toast(
            "ok",
            f"Promoted {applied} subgraph{'s' if applied != 1 else ''} → {'+'.join(tags)}",
            f"skipped {skipped}" if skipped else "",
        )
    elif applied and failed:
        toast = render_toast(
            "err",
            f"Partial success: {applied} ok, {failed} failed",
            f"skipped {skipped}",
        )
    else:
        toast = render_toast("err", "Nothing promoted", f"failed {failed} · skipped {skipped}")
    return HTMLResponse(toast)


async def _json_body(request: Request) -> dict[str, Any]:
    try:
        data = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(400, "invalid JSON") from None
    if not isinstance(data, dict):
        raise HTTPException(400, "JSON object required")
    return data


def _api_response(kind: str, title: str, body: str = "", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        {
            "toast": {"kind": kind, "title": title, "body": body},
            "fleet": build_fleet_payload(_store),
            "jobs": build_job_views(),
        },
        status_code=status_code,
    )


def _api_selections(raw: Any) -> list[dict[str, Any]]:
    if not isinstance(raw, list):
        return []
    selections: list[dict[str, Any]] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        selection = {
            "chain": str(item.get("chain", "")),
            "module": str(item.get("module", "")),
            "base": str(item.get("base", "")),
            "orphan": bool(item.get("orphan")),
        }
        if selection["chain"] and selection["module"]:
            selections.append(selection)
    return _enrich_selections(selections)


@app.get("/api/fleet", response_class=JSONResponse)
async def api_fleet() -> JSONResponse:
    if not _store.last_fetched_at:
        await asyncio.to_thread(_store.fetch)
    return JSONResponse(build_fleet_payload(_store))


@app.post("/api/refresh", response_class=JSONResponse)
async def api_refresh() -> JSONResponse:
    act = register_activity("Fetch goldsky state", kind="refresh")
    ok, err = await asyncio.to_thread(_store.fetch)
    if ok:
        detail = f"{len(_store.state.deployments)} deployments · {len(_store.state.tags)} subgraphs"
        act.finish(True, detail)
        return _api_response("ok", "State refreshed", detail)
    act.finish(False, err)
    return _api_response("err", "Refresh failed", err, status_code=500)


@app.get("/api/jobs", response_class=JSONResponse)
def api_jobs() -> JSONResponse:
    return JSONResponse({"jobs": build_job_views()})


@app.post("/api/deploy", response_class=JSONResponse)
async def api_deploy(request: Request) -> JSONResponse:
    data = await _json_body(request)
    module = str(data.get("module", ""))
    version = str(data.get("version", "")).strip()
    chains_sel = [str(k) for k in data.get("chains", []) if str(k)]
    if module not in MODULES or not version or not chains_sel:
        raise HTTPException(400, "module, version, and at least one chain required")
    queued, deployable_chains = queue_chain_deploy_jobs(module, chains_sel, version)
    if queued:
        return _api_response(
            "ok",
            f"Queued sequential deploy for {queued} chain{'s' if queued != 1 else ''}",
            f"version {version} → {', '.join(deployable_chains)}",
        )
    return _api_response("err", "Nothing deployed", "No selected chain has that module", status_code=400)


@app.post("/api/bulk-deploy", response_class=JSONResponse)
async def api_bulk_deploy(request: Request) -> JSONResponse:
    data = await _json_body(request)
    version = str(data.get("version", "")).strip()
    selections = _api_selections(data.get("selections", []))
    if not version:
        raise HTTPException(400, "version required")
    if not selections:
        raise HTTPException(400, "no selections")
    queued, deployable_chains = queue_bulk_deploy_jobs(selections, version)
    if queued:
        return _api_response(
            "ok",
            f"Queued sequential deploy for {queued} subgraph{'s' if queued != 1 else ''}",
            f"version {version} → {', '.join(deployable_chains)}",
        )
    return _api_response("err", "Nothing deployed", "No deployable selections (orphans are skipped)", status_code=400)


@app.post("/api/remove-tag", response_class=JSONResponse)
async def api_remove_tag(request: Request) -> JSONResponse:
    data = await _json_body(request)
    base = str(data.get("base", ""))
    version = str(data.get("version", ""))
    tag = str(data.get("tag", ""))
    if not base or not version or not tag:
        raise HTTPException(400, "base, version, tag required")
    act = register_activity(f"Untag '{tag}' on {base}/{version}", kind="untag")
    ok, out = await asyncio.to_thread(do_tag_delete, base, version, tag)
    if ok:
        _store.apply_tag_remove(base, tag)
        act.finish(True, f"removed '{tag}' from {base}/{version}")
        return _api_response("ok", f"Removed '{tag}' tag", f"{base}/{version}")
    act.finish(False, out)
    return _api_response("err", f"Failed to remove '{tag}'", out or f"{base}/{version}", status_code=500)


@app.post("/api/delete-version", response_class=JSONResponse)
async def api_delete_version(request: Request) -> JSONResponse:
    data = await _json_body(request)
    base = str(data.get("base", ""))
    version = str(data.get("version", ""))
    if not base or not version:
        raise HTTPException(400, "base, version required")
    act = register_activity(f"Delete {base}/{version}", kind="delete")
    ok, out = await asyncio.to_thread(do_subgraph_delete, base, version)
    if ok:
        _store.apply_deployment_remove(base, version)
        act.finish(True, f"deleted {base}/{version}")
        return _api_response("ok", "Deleted deployment", f"{base}/{version}")
    act.finish(False, out)
    return _api_response("err", "Delete failed", out or f"{base}/{version}", status_code=500)


@app.post("/api/update-pipeline", response_class=JSONResponse)
async def api_update_pipeline(request: Request) -> JSONResponse:
    data = await _json_body(request)
    kind, title, body = await update_pipeline_to_version(str(data.get("base", "")), str(data.get("version", "")))
    return _api_response(kind, title, body)


@app.post("/api/move-tag", response_class=JSONResponse)
async def api_move_tag(request: Request) -> JSONResponse:
    data = await _json_body(request)
    base = str(data.get("base", ""))
    version = str(data.get("version", ""))
    tag = str(data.get("tag", ""))
    if not base or not version or not tag:
        raise HTTPException(400, "base, version, tag required")

    old = _store.state.tag_target(base, tag)
    act = register_activity(f"Move '{tag}' → {base}/{version}" + (f" (from {old})" if old else ""), kind="tag")
    log_bits: list[str] = []
    ok_overall = True

    if old and old != version:
        ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
        if ok_del:
            log_bits.append(f"removed old: {base}/{old}")
            _store.apply_tag_remove(base, tag)
        else:
            log_bits.append(f"old removal FAILED: {out_del}")
            ok_overall = False

    if ok_overall:
        ok_add, out_add = await asyncio.to_thread(do_tag_create, base, version, tag)
        if ok_add:
            log_bits.append(f"tagged {base}/{version} as {tag}")
            _store.apply_tag_set(base, tag, version)
        else:
            log_bits.append(f"tag create FAILED: {out_add}")
            ok_overall = False

    act.finish(ok_overall, "\n".join(log_bits))
    if ok_overall:
        title = f"Moved '{tag}' → {version}" if old else f"Tagged '{tag}' on {version}"
        return _api_response("ok", title, f"{base}" + (f" (was on {old})" if old else ""))
    return _api_response("err", f"Failed to set '{tag}'", "; ".join(log_bits), status_code=500)


@app.post("/api/row-promote", response_class=JSONResponse)
async def api_row_promote(request: Request) -> JSONResponse:
    data = await _json_body(request)
    base = str(data.get("base", ""))
    version = str(data.get("version", ""))
    tags = [str(t) for t in data.get("tags", []) if str(t)]
    update_pipelines = data.get("updatePipelines", True)
    if not isinstance(update_pipelines, bool):
        raise HTTPException(400, "updatePipelines must be a boolean")
    if not base or not version:
        raise HTTPException(400, "base and version required")
    if not tags:
        return _api_response("err", "No tags selected", "Pick at least one tag.", status_code=400)

    act = register_activity(f"Promote {base}/{version} → {'+'.join(tags)}", kind="promote")
    pre_tags = dict(_store.state.tags.get(base, {}))
    displaced: set[str] = set()
    log_bits: list[str] = []
    ok_overall = True
    for tag in tags:
        old = pre_tags.get(tag)
        if old == version:
            log_bits.append(f"'{tag}' already on {version}")
            continue
        if old:
            ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
            if ok_del:
                _store.apply_tag_remove(base, tag)
                displaced.add(old)
                log_bits.append(f"removed old: {base}/{old} (--tag {tag})")
            else:
                log_bits.append(f"delete old FAILED: {out_del}")
                ok_overall = False
                continue
        ok_add, out_add = await asyncio.to_thread(do_tag_create, base, version, tag)
        if ok_add:
            _store.apply_tag_set(base, tag, version)
            log_bits.append(f"tagged {base}/{version} as {tag}")
        else:
            log_bits.append(f"tag create FAILED for '{tag}': {out_add}")
            ok_overall = False

    remaining_tags = _store.state.tags.get(base, {})
    orphaned = [v for v in sorted(displaced) if not any(rv == v for rv in remaining_tags.values())]
    tags_ok = ok_overall
    pipeline_ok = True
    if update_pipelines and tags_ok:
        pipeline_ok, pipeline_lines = await asyncio.to_thread(do_pipeline_update, {base: version})
        log_bits.extend(pipeline_lines)
        if pipeline_ok:
            _store.apply_pipeline_versions({base: version})
    elif update_pipelines:
        pipeline_ok = False
        log_bits.append("pipelines: skipped because tag promotion failed")

    act.finish(tags_ok and pipeline_ok, "\n".join(log_bits))
    if tags_ok and pipeline_ok:
        return _api_response(
            "ok",
            f"Promoted to {'+'.join(tags)}",
            f"{base}/{version}" + (f" · displaced {', '.join(orphaned)}" if orphaned else ""),
        )
    if tags_ok:
        return _api_response("err", "Promoted, but pipeline update failed", "; ".join(log_bits))
    return _api_response("err", "Promote had failures", "; ".join(log_bits), status_code=500)


@app.post("/api/bulk-promote", response_class=JSONResponse)
async def api_bulk_promote(request: Request) -> JSONResponse:
    data = await _json_body(request)
    selections = _api_selections(data.get("selections", []))
    tags = [str(t) for t in data.get("tags", []) if str(t)]
    mode = str(data.get("mode", "specific"))
    version = str(data.get("version", "")).strip()
    require_synced = bool(data.get("requireSynced", True))
    delete_displaced = bool(data.get("deleteDisplaced", False))
    update_pipelines = data.get("updatePipelines", True)
    if not isinstance(update_pipelines, bool):
        raise HTTPException(400, "updatePipelines must be a boolean")
    if not selections:
        raise HTTPException(400, "no selections")
    if not tags:
        return _api_response("err", "No tags selected", "Pick at least one tag.", status_code=400)
    if mode == "specific" and not version:
        return _api_response("err", "Missing version", "Enter a version label or switch to auto mode.", status_code=400)

    applied = 0
    skipped = 0
    failed = 0
    log_lines: list[str] = []
    promoted_versions: dict[str, str] = {}
    state = _store.state
    act = register_activity(f"Bulk promote → {'+'.join(tags)} on {len(selections)} subgraph(s)", kind="promote")

    for s in selections:
        base = s["base"]
        if not base:
            log_lines.append(f"{s['chain']}: skip — no base")
            skipped += 1
            continue
        if mode == "auto":
            synced = [d for d in state.for_base(base) if d.synced == "100%"]
            if not synced:
                log_lines.append(f"{s['chain']}: skip — no 100% synced deployment")
                skipped += 1
                continue
            ver_for_chain = max(synced, key=lambda deployment: _version_sort_key(deployment.version)).version
        else:
            ver_for_chain = version

        dep = state.deployments.get(f"{base}/{ver_for_chain}")
        if dep is None:
            log_lines.append(f"{s['chain']}: skip — {base}/{ver_for_chain} not deployed")
            skipped += 1
            continue
        if require_synced and dep.synced != "100%":
            log_lines.append(f"{s['chain']}: skip — sync {dep.synced or '?'} < 100%")
            skipped += 1
            continue

        displaced_versions: set[str] = set()
        chain_ok = True
        for tag in tags:
            old = state.tag_target(base, tag)
            if old == ver_for_chain:
                log_lines.append(f"{s['chain']}: '{tag}' already on {ver_for_chain}")
                continue
            if old and old != ver_for_chain:
                ok_del, out_del = await asyncio.to_thread(do_tag_delete, base, old, tag)
                if ok_del:
                    _store.apply_tag_remove(base, tag)
                    displaced_versions.add(old)
                    log_lines.append(f"{s['chain']}: removed old {base}/{old} (--tag {tag})")
                else:
                    log_lines.append(f"{s['chain']}: delete old FAILED: {out_del}")
                    chain_ok = False
                    break
            ok_add, out_add = await asyncio.to_thread(do_tag_create, base, ver_for_chain, tag)
            if ok_add:
                _store.apply_tag_set(base, tag, ver_for_chain)
                log_lines.append(f"{s['chain']}: tagged {base}/{ver_for_chain} as {tag}")
            else:
                log_lines.append(f"{s['chain']}: tag create FAILED: {out_add}")
                chain_ok = False
                break

        if not chain_ok:
            failed += 1
            continue
        applied += 1
        promoted_versions[base] = ver_for_chain

        if delete_displaced and displaced_versions:
            original_tags = state.tags.get(base, {})
            for old_ver in sorted(displaced_versions):
                remaining = [t for t, v in original_tags.items() if v == old_ver and t not in tags]
                if remaining:
                    log_lines.append(f"{s['chain']}: keep {base}/{old_ver} — still tagged as {', '.join(remaining)}")
                    continue
                ok_d, out_d = await asyncio.to_thread(do_subgraph_delete, base, old_ver)
                if ok_d:
                    _store.apply_deployment_remove(base, old_ver)
                    log_lines.append(f"{s['chain']}: deleted {base}/{old_ver}")
                else:
                    log_lines.append(f"{s['chain']}: delete FAILED: {out_d}")

    pipeline_ok = True
    if update_pipelines:
        if applied == len(selections):
            pipeline_ok, pipeline_lines = await asyncio.to_thread(do_pipeline_update, promoted_versions)
            log_lines.extend(pipeline_lines)
            if pipeline_ok:
                _store.apply_pipeline_versions(promoted_versions)
        else:
            pipeline_ok = False
            log_lines.append("pipelines: skipped because not every selected promotion succeeded")

    overall_ok = failed == 0 and applied > 0 and pipeline_ok
    act.finish(overall_ok, "\n".join(log_lines))
    if applied and not pipeline_ok:
        return _api_response(
            "err",
            "Promotion completed, but pipelines were not updated",
            f"applied {applied} · failed {failed} · skipped {skipped}",
        )
    if applied and not failed:
        return _api_response(
            "ok",
            f"Promoted {applied} subgraph{'s' if applied != 1 else ''} → {'+'.join(tags)}",
            f"skipped {skipped}" if skipped else "",
        )
    if applied and failed:
        return _api_response("err", f"Partial success: {applied} ok, {failed} failed", f"skipped {skipped}", status_code=500)
    return _api_response("err", "Nothing promoted", f"failed {failed} · skipped {skipped}", status_code=400)


@app.get("/state.json", response_class=JSONResponse)
def state_json() -> JSONResponse:
    return JSONResponse(
        {
            "chains": [c.key for c in _store.chains],
            "deployments": {k: asdict(v) for k, v in _store.state.deployments.items()},
            "tags": _store.state.tags,
            "last_fetched_at": _store.last_fetched_at,
            "last_error": _store.last_error,
        }
    )


@app.get("/{path:path}", include_in_schema=False)
def react_app_fallback(path: str) -> FileResponse:
    if FLEET_UI_INDEX.exists() and "." not in path:
        return FileResponse(FLEET_UI_INDEX)
    raise HTTPException(404, "not found")


# ────────────────────────────────────────────────────────────────────
# Entry point
# ────────────────────────────────────────────────────────────────────


def main() -> None:
    import uvicorn

    parser = argparse.ArgumentParser(description="SYMMIO subgraph fleet web dashboard")
    parser.add_argument("--host", default="127.0.0.1", help="bind address (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
