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
import json
import queue
import re
import subprocess
import threading
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from jinja2 import DictLoader, Environment, select_autoescape


# ────────────────────────────────────────────────────────────────────
# Shared constants
# ────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIGS_DIR = REPO_ROOT / "configs" / "perps"

MODULES = ["perps/analytics", "perps/events"]

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
        try:
            proc = subprocess.run(
                ["goldsky", "subgraph", "list"],
                capture_output=True,
                text=True,
                timeout=60,
            )
        except FileNotFoundError:
            with self._lock:
                self._last_error = "goldsky CLI not found on PATH"
            return False, self._last_error
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


# ────────────────────────────────────────────────────────────────────
# Job registry (for long-running deploy commands)
# ────────────────────────────────────────────────────────────────────


class Job:
    __slots__ = ("id", "label", "cmd", "status", "rc", "started", "ended", "lines", "_q", "_thread")

    def __init__(self, label: str, cmd: list[str]) -> None:
        self.id = uuid.uuid4().hex[:12]
        self.label = label
        self.cmd = cmd
        self.status = "queued"  # queued|running|done|failed
        self.rc: int | None = None
        self.started: float = 0.0
        self.ended: float = 0.0
        self.lines: list[str] = []
        self._q: queue.Queue[str | None] = queue.Queue()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self) -> None:
        self.status = "running"
        self.started = time.time()
        try:
            proc = subprocess.Popen(
                self.cmd,
                cwd=REPO_ROOT,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                line = line.rstrip("\n")
                self.lines.append(line)
                self._q.put(line)
                if len(self.lines) > 5000:
                    self.lines = self.lines[-5000:]
            proc.wait()
            self.rc = proc.returncode
            self.status = "done" if proc.returncode == 0 else "failed"
        except Exception as e:  # pragma: no cover
            self.rc = -1
            self.status = "failed"
            self.lines.append(f"[job error] {e}")
        finally:
            self.ended = time.time()
            self._q.put(None)  # sentinel for SSE consumers

    def tail(self) -> queue.Queue[str | None]:
        return self._q


_JOBS: dict[str, Job] = {}


def start_job(label: str, cmd: list[str]) -> Job:
    job = Job(label=label, cmd=cmd)
    _JOBS[job.id] = job
    job.start()
    return job


# ────────────────────────────────────────────────────────────────────
# Goldsky command helpers (synchronous, short-running)
# ────────────────────────────────────────────────────────────────────


def run_goldsky(args: list[str], timeout: int = 60) -> tuple[int, str]:
    try:
        proc = subprocess.run(
            ["goldsky", *args],
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
  :root { color-scheme: dark; }
  body { background: #0b0d10; color: #e6e8eb; }
  .card { background: #14171c; border: 1px solid #242830; border-radius: 10px; }
  .btn { padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;
         border: 1px solid #2a3240; background: #1c2129; color: #cfd4db;
         cursor: pointer; transition: all .12s ease; display: inline-flex; align-items: center; gap: 4px; }
  .btn:hover { background: #242a34; color: #fff; }
  .btn:disabled, .btn.htmx-request { opacity: .55; pointer-events: none; cursor: wait; }
  .btn-primary { background: #2f6feb; border-color: #2f6feb; color: #fff; }
  .btn-primary:hover { background: #2459c4; }
  .btn-danger { background: #742a2a; border-color: #8a3232; color: #ffe3e3; }
  .btn-danger:hover { background: #8a3232; color: #fff; }
  .btn-ghost { background: transparent; border-color: #2a3240; }
  .btn-xs { padding: 2px 8px; font-size: 10px; border-radius: 5px; }
  .btn.active { background: #2f6feb; border-color: #2f6feb; color: #fff; }
  .btn-icon { padding: 3px 7px; font-size: 12px; line-height: 1; background: transparent;
              border-color: transparent; color: #6a7280; }
  .btn-icon:hover { background: rgba(248,81,73,.1); color: #ff9a93; border-color: rgba(248,81,73,.3); }

  /* Inline tag indicator — subtle, not a loud pill */
  .tag-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
              color: #82b1ff; font-weight: 500; letter-spacing: 0.01em; }
  .tag-chip::before { content: ''; display: inline-block; width: 6px; height: 6px;
              background: #82b1ff; border-radius: 50%; }

  /* Version row — single horizontal line */
  .v-row { display: flex; align-items: center; gap: 10px; padding: 4px 0;
           border-left: 1px dashed #2a3240; padding-left: 12px; margin-left: -2px; }
  .v-row:hover { border-left-color: #3a4250; }
  .v-row .v-ver { font-family: ui-monospace, monospace; font-weight: 600; font-size: 12px;
                  color: #cfd4db; min-width: 60px; }
  .v-row .v-meta { display: inline-flex; gap: 6px; align-items: center; }
  .v-row .v-tags { display: inline-flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .v-row .v-actions { margin-left: auto; display: inline-flex; gap: 4px; align-items: center;
                      opacity: .55; transition: opacity .12s; }
  .v-row:hover .v-actions, .v-row:focus-within .v-actions { opacity: 1; }

  /* Modal "busy" state — shown while an action inside it is in flight */
  .modal-bg.busy { cursor: wait; }
  .modal-bg.busy .modal { pointer-events: none; }
  .modal-bg.busy .modal::before { content: ''; position: absolute; inset: 0;
              background: rgba(20,23,28,.55); backdrop-filter: blur(1px);
              border-radius: 12px; z-index: 1; pointer-events: none; }
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
  /* Segmented control */
  .segmented { display: inline-flex; background: #0f1217; border: 1px solid #242830;
               border-radius: 7px; padding: 2px; gap: 1px; }
  .segmented button { padding: 4px 11px; font-size: 11px; font-weight: 500; background: transparent;
                       border: none; color: #8a93a3; border-radius: 5px; cursor: pointer;
                       transition: all .1s; }
  .segmented button:hover { color: #cfd4db; background: rgba(255,255,255,.03); }
  .segmented button.active { background: #2f6feb; color: #fff; }
  .segmented button.active:hover { background: #2459c4; }

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
  .chip-toggle { display: inline-flex; align-items: center; padding: 3px 11px;
                  border-radius: 999px; border: 1px solid #303844;
                  background: rgba(125,133,144,.08); color: #a9b0bb;
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

  .pill { display:inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px;
          border: 1px solid #303844; line-height: 1.5; }
  .pill-green { background: rgba(46,160,67,.15); border-color: rgba(46,160,67,.4); color: #7ee195; }
  .pill-red { background: rgba(248,81,73,.15); border-color: rgba(248,81,73,.4); color: #ff9a93; }
  .pill-yellow { background: rgba(210,153,34,.15); border-color: rgba(210,153,34,.4); color: #e5c075; }
  .pill-blue { background: rgba(56,139,253,.15); border-color: rgba(56,139,253,.4); color: #82b1ff; }
  .pill-gray { background: rgba(125,133,144,.15); border-color: rgba(125,133,144,.4); color: #a9b0bb; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 12px; border-bottom: 1px solid #1e242d; font-size: 13px; vertical-align: top; }
  th { text-align: left; color: #8a93a3; font-weight: 500; font-size: 11px;
       text-transform: uppercase; letter-spacing: 0.04em; position: sticky; top: 0; background: #14171c; }
  tr:hover td { background: #161a21; }

  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(2px);
              display: flex; align-items: center; justify-content: center; z-index: 50;
              animation: modal-bg-in .12s ease-out; }
  .modal { background: #14171c; border: 1px solid #242830; border-radius: 12px;
           padding: 20px; max-width: 600px; width: 90%; max-height: 85vh; overflow: auto;
           box-shadow: 0 20px 40px rgba(0,0,0,.5); animation: modal-in .16s ease-out; }
  @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modal-in { from { opacity: 0; transform: translateY(-6px) scale(.98); }
                         to { opacity: 1; transform: translateY(0) scale(1); } }

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
                     display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .toast { background: #14171c; border: 1px solid #242830; border-left: 3px solid #2f6feb;
           border-radius: 6px; padding: 10px 14px; min-width: 260px; max-width: 420px;
           box-shadow: 0 6px 20px rgba(0,0,0,.4); pointer-events: auto;
           animation: toast-in .18s ease-out; font-size: 13px; }
  .toast.ok { border-left-color: #2ea043; }
  .toast.err { border-left-color: #f85149; }
  .toast .t-title { font-weight: 600; margin-bottom: 2px; }
  .toast .t-body { color: #a9b0bb; font-size: 12px; word-break: break-word; }
  .toast.fading { opacity: 0; transform: translateY(-6px); transition: all .35s ease; }
  @keyframes toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>
<script>
  // Auto-dismiss toasts after 4s, with fade
  document.addEventListener('htmx:afterSwap', function(e) {
    document.querySelectorAll('#toast-container .toast:not([data-dismissing])').forEach(function(el) {
      el.setAttribute('data-dismissing', '1');
      setTimeout(function() { el.classList.add('fading'); }, 3600);
      setTimeout(function() { el.remove(); }, 4000);
    });
  });
</script>
</head>
<body>
<div id="top-bar"></div>

<div class="max-w-7xl mx-auto p-6">
  <header class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-xl font-bold">SYMMIO Subgraph Fleet</h1>
      <p class="text-xs text-gray-500" id="last-fetched-label">{{ last_fetched_label }}</p>
    </div>
    <div class="flex gap-2">
      <button class="btn"
              hx-post="/refresh" hx-target="#grid" hx-swap="innerHTML"
              hx-disabled-elt="this">
        <span class="label-normal">Refresh state</span>
        <span class="htmx-indicator"><span class="spin"></span> refreshing…</span>
      </button>
      <button class="btn btn-primary"
              hx-get="/promote" hx-target="body" hx-swap="beforeend"
              hx-disabled-elt="this">
        <span class="label-normal">Promote</span>
        <span class="htmx-indicator"><span class="spin"></span> opening…</span>
      </button>
      <button class="btn"
              hx-get="/deploy" hx-target="body" hx-swap="beforeend"
              hx-disabled-elt="this">
        <span class="label-normal">Deploy</span>
        <span class="htmx-indicator"><span class="spin"></span> opening…</span>
      </button>
    </div>
  </header>

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
        <button onclick="setPresetFilter('all')">show all</button>
        <button onclick="setPresetFilter('prod')">prod only</button>
        <button onclick="setPresetFilter('stage')">stage only</button>
      </div>

      <label class="filter-toggle">
        <input type="checkbox" id="filter-multi-version" onchange="applyFleetFilters()" />
        <span>2+ versions</span>
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
      var moduleFilter = window.currentModuleFilter || '';
      var rows = document.querySelectorAll('#grid tr.chain-row');
      var visible = 0;
      rows.forEach(function(r) {
        var chain = r.dataset.chain || '';
        var mod = r.dataset.module || '';
        var vcount = parseInt(r.dataset.versionCount || '0', 10);
        var match = true;
        if (chips.length > 0 && chips.indexOf(chain) === -1) match = false;
        if (multiOnly && vcount < 2) match = false;
        if (moduleFilter && mod !== moduleFilter) match = false;
        r.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      var total = rows.length;
      document.getElementById('filter-count').textContent = visible + ' / ' + total + ' rows';
    };
    window.setPresetFilter = function(mode) {
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
  </script>

  <div class="card p-0 overflow-hidden mb-6" id="grid"
       hx-get="/grid" hx-trigger="load" hx-swap="innerHTML">
    {{ initial_grid | safe }}
  </div>

  <div class="card p-4" id="jobs">
    {{ jobs_panel | safe }}
  </div>
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
  </div>
</div>
"""

GRID_HTML = r"""
<table data-active-chains='{{ active_chain_meta | tojson }}'>
  <thead>
    <tr>
      <th style="width: 120px;">Chain</th>
      <th style="width: 110px;">Module</th>
      <th>Deployments</th>
      <th style="width: 200px;">Tags</th>
    </tr>
  </thead>
  <tbody>
  {% for g in groups %}
    {% for row in g.modules %}
    <tr class="chain-row" data-chain="{{ g.chain }}" data-prod="{{ '1' if g.is_prod else '0' }}"
        data-module="{{ row.module_short }}"
        data-version-count="{{ row.deployments|length }}"
        {% if loop.first %}style="border-top: 2px solid #2a3240;"{% endif %}>
      <td class="align-top">
        {% if loop.first %}
          {% if g.is_orphan %}
            <div class="font-semibold text-yellow-300 font-mono" style="font-size: 12px; word-break: break-all;">{{ g.chain }}</div>
            <div class="text-xs text-yellow-500 mt-1">⚠ unmapped</div>
            <div class="text-xs text-gray-500">{{ g.network }}</div>
          {% else %}
            <div class="font-semibold text-cyan-300">{{ g.chain }}</div>
            <div class="text-xs text-gray-500">{{ g.network }}</div>
            {% if g.is_prod %}<div class="pill pill-blue mt-1" style="font-size: 10px;">prod</div>
            {% elif g.is_stage %}<div class="pill pill-yellow mt-1" style="font-size: 10px;">stage</div>{% endif %}
          {% endif %}
        {% endif %}
      </td>
      <td class="align-top text-gray-400">{{ row.module_short }}
        <div class="text-xs text-gray-600 mt-1 font-mono" style="font-size: 10px;">{{ row.base }}</div>
      </td>
      <td class="align-top">
        {% if row.deployments %}
          <details class="versions-details" open>
            <summary class="version-summary">
              <span class="chev">▸</span>
              <span class="text-xs text-gray-400">{{ row.deployments|length }} version{{ 's' if row.deployments|length != 1 else '' }}</span>
            </summary>
            <div class="flex flex-col mt-1">
          {% for d in row.deployments %}
            <div class="v-row">
              <span class="v-ver">{{ d.version }}</span>
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
                    <span class="label-normal">⬆ promote</span>
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
                  <span class="label-normal">🗑</span>
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
      <td class="align-top">
        {% if row.tags %}
          <div class="flex flex-col gap-2">
          {% for tag, ver in row.tags.items() %}
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="pill pill-blue">{{ tag }}</span>
              <span class="text-gray-400 text-xs">→ {{ ver }}</span>
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
  })();
</script>
"""

ROW_PROMOTE_MODAL = r"""
<div class="modal-bg" id="row-promote-bg" onclick="if(event.target.id==='row-promote-bg' && !event.currentTarget.classList.contains('busy'))this.remove()">
  <form class="modal" style="max-width: 460px;"
        hx-post="/row-promote" hx-target="#grid" hx-swap="innerHTML"
        hx-disabled-elt="find button, find input"
        hx-on::before-request="document.getElementById('row-promote-bg').classList.add('busy')"
        hx-on::after-settle="document.getElementById('row-promote-bg')?.remove()"
        hx-on::response-error="document.getElementById('row-promote-bg')?.classList.remove('busy')">
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
      <div class="c-icon" style="background: rgba(248,81,73,.12); color: #ff9a93; border-color: rgba(248,81,73,.35); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; border: 1px solid;">🗑</div>
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
              <span class="label-normal">🗑 delete</span>
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

    <div class="flex gap-2 justify-end">
      <button type="button" class="btn" onclick="document.getElementById('promote-bg').remove()">Cancel</button>
      <button type="submit" class="btn btn-primary">Promote</button>
    </div>
  </form>
</div>
"""

DEPLOY_MODAL = r"""
<div class="modal-bg" id="deploy-bg" onclick="if(event.target.id==='deploy-bg')this.remove()">
  <form class="modal" hx-post="/deploy" hx-target="#jobs" hx-swap="innerHTML"
        hx-on::after-request="document.getElementById('deploy-bg').remove()">
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
      <button type="submit" class="btn btn-primary">Deploy</button>
    </div>
  </form>
</div>
"""

JOBS_PANEL = r"""
<div class="flex justify-between items-center mb-2">
  <h3 class="text-sm font-semibold text-gray-300">Jobs</h3>
  <span class="text-xs text-gray-500">{{ jobs|length }} total</span>
</div>
{% if not jobs %}
  <p class="text-xs text-gray-600">No jobs yet. Kick off a deploy.</p>
{% else %}
  <div class="flex flex-col gap-3">
  {% for j in jobs %}
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
  {% endfor %}
  </div>
{% endif %}
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
            "row_promote_modal": ROW_PROMOTE_MODAL,
            "post_promote_cleanup_oob": POST_PROMOTE_CLEANUP_OOB,
        }
    ),
    autoescape=select_autoescape(default=True, default_for_string=True),
)


def render_toast(kind: str, title: str, body: str = "") -> str:
    return _env.get_template("toast_oob").render(kind=kind, title=title, body=body)


# ────────────────────────────────────────────────────────────────────
# Row building
# ────────────────────────────────────────────────────────────────────


def build_chain_groups(chains: list[ChainConfig], state: GoldskyState) -> list[dict[str, Any]]:
    """Group deployments by chain so analytics + events sit together in the UI.

    Chains/modules with no Goldsky presence (no deployments AND no tag pointers)
    are omitted — they're noise until something is actually deployed.

    Any Goldsky subgraph not referenced by any local config is surfaced at the
    end as an "unmapped" group so operators can still inspect/manage it."""
    groups: list[dict[str, Any]] = []
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
            deployments = sorted(state.for_base(base), key=lambda d: d.version)
            tags = state.tags.get(base, {})
            if not deployments and not tags:
                continue
            module_rows.append(
                {
                    "module": module,
                    "module_short": module.split("/")[-1],
                    "base": base,
                    "deployments": deployments,
                    "tags": tags,
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
                "modules": module_rows,
            }
        )

    # Collect every Goldsky base that actually has something deployed or tagged.
    all_goldsky_bases: set[str] = {d.base_name for d in state.deployments.values()}
    all_goldsky_bases.update(state.tags.keys())
    orphan_bases = sorted(all_goldsky_bases - known_bases)

    for orphan_base in orphan_bases:
        deployments = sorted(state.for_base(orphan_base), key=lambda d: d.version)
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
        groups.append(
            {
                "chain": orphan_base,
                "network": "(not in local configs)",
                "is_prod": False,
                "is_stage": False,
                "is_orphan": True,
                "modules": [
                    {
                        "module": "orphan",
                        "module_short": guessed_module,
                        "base": orphan_base,
                        "deployments": deployments,
                        "tags": tags,
                    }
                ],
            }
        )
    return groups


def render_grid(store: FleetStore) -> str:
    groups = build_chain_groups(store.chains, store.state)
    active_chain_meta = [{"k": g["chain"], "o": bool(g.get("is_orphan"))} for g in groups]
    return _env.get_template("grid").render(groups=groups, active_chain_meta=active_chain_meta)


def render_jobs_panel() -> str:
    job_views: list[dict[str, Any]] = []
    for j in sorted(_JOBS.values(), key=lambda j: j.started or 0, reverse=True)[:10]:
        tail = "\n".join(j.lines[-200:]) or "(no output yet)"
        job_views.append({"id": j.id, "label": j.label, "status": j.status, "rc": j.rc, "tail_text": tail})
    return _env.get_template("jobs_panel").render(jobs=job_views)


# ────────────────────────────────────────────────────────────────────
# App
# ────────────────────────────────────────────────────────────────────


app = FastAPI(title="Symmio Fleet Web")
_store = FleetStore()


def _last_fetched_label() -> str:
    if not _store.last_fetched_at:
        return "not yet fetched"
    ago = int(time.time() - _store.last_fetched_at)
    return f"last fetched {ago}s ago"


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
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
    )
    return HTMLResponse(html)


@app.get("/grid", response_class=HTMLResponse)
def grid_fragment() -> HTMLResponse:
    """Returned by the htmx `load` trigger on #grid. Triggers the initial
    Goldsky fetch if it hasn't run yet."""
    if not _store.last_fetched_at:
        _store.fetch()
    toast = ""
    if _store.last_error:
        toast = render_toast("err", "Goldsky fetch failed", _store.last_error)
    return HTMLResponse(render_grid(_store) + toast)


@app.post("/refresh", response_class=HTMLResponse)
def refresh() -> HTMLResponse:
    ok, err = _store.fetch()
    toast = (
        render_toast("ok", "State refreshed", f"{len(_store.state.deployments)} deployments · {len(_store.state.tags)} subgraphs")
        if ok
        else render_toast("err", "Refresh failed", err)
    )
    return HTMLResponse(render_grid(_store) + toast)


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
            ver_for_chain = sorted(synced, key=lambda d: d.version)[-1].version
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
                ok_del, out_del = do_tag_delete(base, old, tag)
                log_lines.append(
                    f"{c.key}: delete-old-tag {base}/{old} --tag {tag} → {'ok' if ok_del else 'fail'}"
                )
                if ok_del:
                    _store.apply_tag_remove(base, tag)
                    displaced_versions.add(old)
            ok_add, out_add = do_tag_create(base, ver_for_chain, tag)
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
                ok_d, out_d = do_subgraph_delete(base, old_ver)
                log_lines.append(f"{c.key}: delete {base}/{old_ver} → {'ok' if ok_d else 'FAIL: ' + out_d}")
                if ok_d:
                    _store.apply_deployment_remove(base, old_ver)

    result_html = _env.get_template("promote_result").render(
        log="\n".join(log_lines) or "(no chains matched)",
        applied_count=applied_count,
        skipped_count=skipped_count,
        failed_count=failed_count,
        grid=render_grid(_store),
    )
    if failed_count:
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

    for c in _store.chains:
        if c.key not in chains_sel:
            continue
        if module not in c.deploy_urls:
            continue
        cmd = [
            "python3",
            "scripts/manager.py",
            str(c.path.relative_to(REPO_ROOT)),
            module,
            version,
            "--deploy",
        ]
        start_job(label=f"{c.key} · {module} {version}", cmd=cmd)

    return HTMLResponse(render_jobs_panel())


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
    ok, out = do_tag_delete(base, version, tag)
    if ok:
        _store.apply_tag_remove(base, tag)
        toast = render_toast("ok", f"Removed '{tag}' tag", f"{base}/{version}")
    else:
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
    log_bits: list[str] = []
    ok_overall = True

    if old and old != version:
        ok_del, out_del = do_tag_delete(base, old, tag)
        if ok_del:
            log_bits.append(f"removed old: {base}/{old}")
            _store.apply_tag_remove(base, tag)
        else:
            log_bits.append(f"old removal FAILED: {out_del}")
            ok_overall = False

    if ok_overall:
        ok_add, out_add = do_tag_create(base, version, tag)
        if ok_add:
            log_bits.append(f"tagged {base}/{version} as {tag}")
            _store.apply_tag_set(base, tag, version)
        else:
            log_bits.append(f"tag create FAILED: {out_add}")
            ok_overall = False

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
    ok, out = do_subgraph_delete(base, version)
    if ok:
        _store.apply_deployment_remove(base, version)
        toast = render_toast("ok", "Deleted deployment", f"{base}/{version}")
    else:
        toast = render_toast("err", "Delete failed", out or f"{base}/{version}")
    return HTMLResponse(render_grid(_store) + toast)


@app.get("/row-promote-form", response_class=HTMLResponse)
def row_promote_form(base: str, version: str) -> HTMLResponse:
    current_tags = _store.state.tags.get(base, {})
    html = _env.get_template("row_promote_modal").render(
        base=base, version=version, current_tags=current_tags
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
    if not base or not version:
        raise HTTPException(400, "base and version required")
    if not tags:
        toast = render_toast("err", "No tags selected", "Pick at least one tag.")
        return HTMLResponse(render_grid(_store) + toast)

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
            ok_del, out_del = do_tag_delete(base, old, tag)
            if ok_del:
                _store.apply_tag_remove(base, tag)
                displaced.add(old)
                log_bits.append(f"removed old: {base}/{old} (--tag {tag})")
            else:
                log_bits.append(f"delete old FAILED: {out_del}")
                ok_overall = False
                continue
        ok_add, out_add = do_tag_create(base, version, tag)
        if ok_add:
            _store.apply_tag_set(base, tag, version)
            log_bits.append(f"tagged {base}/{version} as {tag}")
        else:
            log_bits.append(f"tag create FAILED for '{tag}': {out_add}")
            ok_overall = False

    # Only consider a version "displaced" if no remaining tag still points at it.
    remaining_tags = _store.state.tags.get(base, {})
    orphaned = [v for v in sorted(displaced) if not any(rv == v for rv in remaining_tags.values())]

    if ok_overall:
        toast = render_toast(
            "ok",
            f"Promoted to {'+'.join(tags)}",
            f"{base}/{version}" + (f" · displaced {', '.join(orphaned)}" if orphaned else ""),
        )
    else:
        toast = render_toast("err", "Promote had failures", "; ".join(log_bits))

    cleanup = _env.get_template("post_promote_cleanup_oob").render(
        base=base, version=version, tags=tags, displaced=orphaned,
    )
    return HTMLResponse(render_grid(_store) + toast + cleanup)


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
