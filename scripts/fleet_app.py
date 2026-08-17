#!/usr/bin/env python3
"""Run the SYMMIO Fleet dashboard in a native desktop window.

Starts the existing FastAPI app (from ``fleet_web``) on loopback in a background
thread, waits for it to come up, then shows it in a native WKWebView window via
pywebview. Closing the window stops the server and exits.

If pywebview is unavailable for any reason, it degrades gracefully: a chromeless
Chrome ``--app`` window, and finally the default browser.

    uv run --extra app scripts/fleet_app.py --host 127.0.0.1 --port 8787
"""

from __future__ import annotations

import argparse
import socket
import sys
import threading
import time
import urllib.request
from pathlib import Path

try:
    from scripts.fleet_identity import is_fleet_health_response
except ModuleNotFoundError:  # Direct execution places scripts/, not the repository root, on sys.path.
    from fleet_identity import is_fleet_health_response

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ICON = REPO_ROOT / "assets" / "fleet-app" / "AppIcon.icns"
FLEET_HEALTH_PATH = "/healthz"

# fleet_web lives alongside this file.
sys.path.insert(0, str(Path(__file__).resolve().parent))


def _port_is_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex((host, port)) == 0


class PortOccupiedError(RuntimeError):
    """Raised when another service already owns the requested Fleet port."""


def _is_fleet_ready(health_url: str, request_timeout: float = 1.5) -> bool:
    try:
        with urllib.request.urlopen(health_url, timeout=request_timeout) as resp:
            return resp.status == 200 and is_fleet_health_response(resp.read())
    except Exception:
        return False


def _wait_until_ready(health_url: str, timeout: float = 40.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if _is_fleet_ready(health_url):
            return True
        time.sleep(0.3)
    return False


def _start_server(host: str, port: int) -> "object | None":
    """Start uvicorn, or attach only when the existing listener is Fleet."""
    if _port_is_open(host, port):
        health_url = f"http://{host}:{port}{FLEET_HEALTH_PATH}"
        if _is_fleet_ready(health_url):
            return None
        raise PortOccupiedError(
            f"Port {port} on {host} is already in use by a service that is not SYMMIO Fleet. "
            "Close that service or choose another port."
        )

    import uvicorn

    from fleet_web import app  # noqa: WPS433 — imported lazily so failures surface here

    config = uvicorn.Config(app, host=host, port=port, log_level="warning")
    server = uvicorn.Server(config)
    # We're not on the main thread; uvicorn must not install signal handlers.
    server.install_signal_handlers = lambda: None
    thread = threading.Thread(target=server.run, name="fleet-uvicorn", daemon=True)
    thread.start()
    return server


def _set_dock_icon(icon: Path) -> None:
    """Best-effort: give the running process our dock icon on macOS."""
    if sys.platform != "darwin" or not icon.exists():
        return
    try:
        from AppKit import NSApplication, NSImage  # type: ignore

        nsapp = NSApplication.sharedApplication()
        image = NSImage.alloc().initWithContentsOfFile_(str(icon))
        if image is not None:
            nsapp.setApplicationIconImage_(image)
    except Exception:
        pass


def _run_with_webview(url: str, icon: Path) -> bool:
    try:
        import webview  # type: ignore
    except Exception:
        return False

    _set_dock_icon(icon)
    webview.create_window(
        "SYMMIO Fleet",
        url,
        width=1320,
        height=860,
        min_size=(980, 640),
        background_color="#0a0f16",
    )
    webview.start()
    return True


def _run_with_chrome_app(url: str) -> bool:
    import shutil
    import subprocess

    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not Path(chrome).exists():
        chrome = shutil.which("google-chrome") or shutil.which("chromium") or ""
    if not chrome:
        return False
    try:
        subprocess.run([chrome, f"--app={url}", "--window-size=1320,860"], check=False)
        return True
    except Exception:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="SYMMIO Fleet desktop window")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--icon", type=Path, default=DEFAULT_ICON)
    args = parser.parse_args()

    url = f"http://{args.host}:{args.port}/"
    health_url = f"http://{args.host}:{args.port}{FLEET_HEALTH_PATH}"
    try:
        server = _start_server(args.host, args.port)
    except PortOccupiedError as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1) from exc

    if not _wait_until_ready(health_url):
        print(f"Fleet server did not return the expected identity at {health_url}", file=sys.stderr)
        raise SystemExit(1)

    try:
        if _run_with_webview(url, args.icon):
            return
        print("pywebview unavailable — falling back to a Chrome app window", file=sys.stderr)
        if _run_with_chrome_app(url):
            return
        import webbrowser

        print("Opening in the default browser", file=sys.stderr)
        webbrowser.open(url)
        # Keep the in-process server alive while the browser tab is open.
        if server is not None:
            while True:
                time.sleep(3600)
    finally:
        if server is not None:
            server.should_exit = True


if __name__ == "__main__":
    main()
