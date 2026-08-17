import json
import unittest
from unittest.mock import patch

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


if __name__ == "__main__":
    unittest.main()
