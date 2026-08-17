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
from collections.abc import Callable
from pathlib import Path

try:
    from scripts.fleet_identity import is_fleet_health_response
except ModuleNotFoundError:  # Direct execution places scripts/, not the repository root, on sys.path.
    from fleet_identity import is_fleet_health_response

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ICON = REPO_ROOT / "assets" / "fleet-app" / "AppIcon.icns"
DEFAULT_WEBVIEW_STORAGE = Path.home() / "Library" / "Application Support" / "SYMMIO Fleet" / "WebView"
FLEET_HEALTH_PATH = "/healthz"
NATIVE_ZOOM_SCRIPT = r"""
(() => {
    if (window.__symmioFleetZoom) return;

    const levels = [0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
    const storageKey = "symmio-fleet-native-zoom";
    const saved = Number.parseFloat(window.localStorage.getItem(storageKey) || "1");
    let index = levels.reduce((best, level, candidate) =>
        Math.abs(level - saved) < Math.abs(levels[best] - saved) ? candidate : best, 3);

    let status = document.getElementById("fleet-native-zoom-status");
    if (!status) {
        status = document.createElement("div");
        status.id = "fleet-native-zoom-status";
        status.className = "sr-only";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        document.body.appendChild(status);
    }

    const apply = (announce = true) => {
        const zoom = levels[index];
        const percent = Math.round(zoom * 100);
        document.documentElement.style.zoom = String(zoom);
        document.documentElement.dataset.nativeZoom = String(percent);
        window.localStorage.setItem(storageKey, String(zoom));
        if (announce) status.textContent = `Zoom ${percent}%`;
        return percent;
    };

    const zoomIn = () => { index = Math.min(index + 1, levels.length - 1); return apply(); };
    const zoomOut = () => { index = Math.max(index - 1, 0); return apply(); };
    const actualSize = () => { index = levels.indexOf(1); return apply(); };

    window.__symmioFleetZoom = { zoomIn, zoomOut, actualSize, current: () => Math.round(levels[index] * 100) };
    window.addEventListener("keydown", (event) => {
        if (!event.metaKey || event.ctrlKey || event.altKey) return;

        let action = null;
        if (event.key === "+" || event.key === "=") action = zoomIn;
        else if (event.key === "-" || event.key === "_") action = zoomOut;
        else if (event.key === "0") action = actualSize;
        if (!action) return;

        event.preventDefault();
        event.stopPropagation();
        action();
    }, true);

    apply(false);
})();
"""

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


def _install_zoom_controls(window: object) -> None:
    """Install browser-style zoom shortcuts after each page load."""
    window.run_js(NATIVE_ZOOM_SCRIPT)  # type: ignore[attr-defined]


def _install_macos_zoom_menu(window: object) -> None:
    """Add standard zoom commands to pywebview's existing View menu."""
    if sys.platform != "darwin":
        return

    try:
        import AppKit  # type: ignore
        from PyObjCTools import AppHelper  # type: ignore
        from webview.platforms.cocoa import menu_handler  # type: ignore
    except Exception:
        return

    actions: list[tuple[str, str, str, Callable[[], object]]] = [
        ("Zoom In", "+", "fleet.zoom.in", lambda: window.run_js("window.__symmioFleetZoom?.zoomIn()")),  # type: ignore[attr-defined]
        ("Zoom Out", "-", "fleet.zoom.out", lambda: window.run_js("window.__symmioFleetZoom?.zoomOut()")),  # type: ignore[attr-defined]
        ("Actual Size", "0", "fleet.zoom.actual", lambda: window.run_js("window.__symmioFleetZoom?.actualSize()")),  # type: ignore[attr-defined]
    ]
    for _, _, action_id, action in actions:
        menu_handler.register_action(action_id, action)

    def add_menu_items() -> None:
        main_menu = AppKit.NSApplication.sharedApplication().mainMenu()
        if main_menu is None:
            return

        view_menu = None
        for item in main_menu.itemArray():
            submenu = item.submenu()
            if submenu is not None and str(submenu.title()) == "View":
                view_menu = submenu
                break
        if view_menu is None or view_menu.itemWithTitle_("Zoom In") is not None:
            return

        modifier = getattr(AppKit, "NSEventModifierFlagCommand", None)
        if modifier is None:
            modifier = AppKit.NSCommandKeyMask
        view_menu.insertItem_atIndex_(AppKit.NSMenuItem.separatorItem(), 0)
        for title, key, action_id, _ in reversed(actions):
            item = AppKit.NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(title, "handleMenuAction:", key)
            item.setKeyEquivalentModifierMask_(modifier)
            item.setTarget_(menu_handler)
            item.setRepresentedObject_(action_id)
            view_menu.insertItem_atIndex_(item, 0)

    AppHelper.callAfter(add_menu_items)


def _run_with_webview(url: str, icon: Path) -> bool:
    try:
        import webview  # type: ignore
    except Exception:
        return False

    _set_dock_icon(icon)
    window = webview.create_window(
        "SYMMIO Fleet",
        url,
        width=1320,
        height=860,
        min_size=(980, 640),
        background_color="#0a0f16",
        zoomable=True,
    )
    if window is None:
        return False

    window.events.loaded += lambda: _install_zoom_controls(window)
    webview.start(
        _install_macos_zoom_menu,
        args=(window,),
        private_mode=False,
        storage_path=str(DEFAULT_WEBVIEW_STORAGE),
    )
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
