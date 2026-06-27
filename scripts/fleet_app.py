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

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ICON = REPO_ROOT / "assets" / "fleet-app" / "AppIcon.icns"

# fleet_web lives alongside this file.
sys.path.insert(0, str(Path(__file__).resolve().parent))


def _port_is_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex((host, port)) == 0


def _wait_until_ready(url: str, timeout: float = 40.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.5) as resp:
                if resp.status < 500:
                    return True
        except Exception:
            time.sleep(0.3)
    return False


def _start_server(host: str, port: int) -> "object | None":
    """Start uvicorn in a daemon thread. Returns the server, or None if a server
    is already listening on the port (we'll just attach a window to it)."""
    if _port_is_open(host, port):
        return None

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
    server = _start_server(args.host, args.port)

    if not _wait_until_ready(url):
        print("Fleet server did not become ready in time", file=sys.stderr)
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
