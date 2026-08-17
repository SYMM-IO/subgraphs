"""Shared identity contract for the SYMMIO Fleet health endpoint."""

from __future__ import annotations

import json

FLEET_HEALTH_PAYLOAD = {"service": "symmio-fleet", "ok": True}


def is_fleet_health_response(body: bytes) -> bool:
    """Return whether an HTTP response body identifies SYMMIO Fleet."""
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return False
    return payload == FLEET_HEALTH_PAYLOAD and payload["ok"] is True
