import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import scripts.fleet_app as fleet_app
from scripts.fleet_identity import FLEET_HEALTH_PAYLOAD


class _Response:
    def __init__(self, body: bytes, status: int = 200) -> None:
        self.body = body
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        return None

    def read(self) -> bytes:
        return self.body


class FleetReadinessTests(unittest.TestCase):
    def test_readiness_requires_fleet_health_identity(self) -> None:
        fleet_body = json.dumps(FLEET_HEALTH_PAYLOAD, indent=2).encode()
        with patch.object(fleet_app.urllib.request, "urlopen", return_value=_Response(fleet_body)):
            self.assertTrue(fleet_app._is_fleet_ready("http://127.0.0.1:8787/healthz"))

        with patch.object(
            fleet_app.urllib.request,
            "urlopen",
            return_value=_Response(json.dumps({"service": "another-app", "ok": True}).encode()),
        ):
            self.assertFalse(fleet_app._is_fleet_ready("http://127.0.0.1:8787/healthz"))

        for non_boolean_ok in (1, 1.0):
            with patch.object(
                fleet_app.urllib.request,
                "urlopen",
                return_value=_Response(json.dumps({"service": "symmio-fleet", "ok": non_boolean_ok}).encode()),
            ):
                self.assertFalse(fleet_app._is_fleet_ready("http://127.0.0.1:8787/healthz"))

    def test_occupied_non_fleet_port_is_rejected_clearly(self) -> None:
        with (
            patch.object(fleet_app, "_port_is_open", return_value=True),
            patch.object(fleet_app, "_is_fleet_ready", return_value=False) as ready,
        ):
            with self.assertRaisesRegex(fleet_app.PortOccupiedError, "already in use.*not SYMMIO Fleet"):
                fleet_app._start_server("127.0.0.1", 8787)

        ready.assert_called_once_with("http://127.0.0.1:8787/healthz")

    def test_occupied_fleet_port_can_be_reused(self) -> None:
        with (
            patch.object(fleet_app, "_port_is_open", return_value=True),
            patch.object(fleet_app, "_is_fleet_ready", return_value=True),
        ):
            self.assertIsNone(fleet_app._start_server("127.0.0.1", 8787))


class _FakeEvent:
    def __init__(self) -> None:
        self.callbacks = []

    def __iadd__(self, callback):
        self.callbacks.append(callback)
        return self


class _FakeWindow:
    def __init__(self) -> None:
        self.events = SimpleNamespace(loaded=_FakeEvent())
        self.scripts: list[str] = []

    def run_js(self, script: str) -> None:
        self.scripts.append(script)


class FleetDesktopZoomTests(unittest.TestCase):
    def test_webview_enables_zoom_shortcuts_and_persistent_storage(self) -> None:
        window = _FakeWindow()
        create_window = Mock(return_value=window)
        start = Mock()
        fake_webview = SimpleNamespace(create_window=create_window, start=start)

        with (
            patch.dict(sys.modules, {"webview": fake_webview}),
            patch.object(fleet_app, "_set_dock_icon"),
        ):
            self.assertTrue(fleet_app._run_with_webview("http://127.0.0.1:8787/", fleet_app.DEFAULT_ICON))

        self.assertTrue(create_window.call_args.kwargs["zoomable"])
        self.assertFalse(start.call_args.kwargs["private_mode"])
        self.assertEqual(start.call_args.kwargs["storage_path"], str(fleet_app.DEFAULT_WEBVIEW_STORAGE))

        self.assertEqual(len(window.events.loaded.callbacks), 1)
        window.events.loaded.callbacks[0]()
        self.assertEqual(window.scripts, [fleet_app.NATIVE_ZOOM_SCRIPT])

    def test_zoom_script_supports_standard_macos_shortcuts_and_reset(self) -> None:
        script = fleet_app.NATIVE_ZOOM_SCRIPT
        self.assertIn('event.metaKey', script)
        self.assertIn('event.key === "+" || event.key === "="', script)
        self.assertIn('event.key === "-" || event.key === "_"', script)
        self.assertIn('event.key === "0"', script)
        self.assertIn('window.localStorage.setItem(storageKey', script)
        self.assertIn('status.setAttribute("role", "status")', script)


if __name__ == "__main__":
    unittest.main()
