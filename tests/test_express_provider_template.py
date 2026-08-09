import json
from pathlib import Path
from unittest import TestCase

from scripts.manager import express_provider_template_entities


REPO_ROOT = Path(__file__).resolve().parents[1]


class ExpressProviderTemplateEntityTests(TestCase):
    def test_analytics_template_declares_mutated_analytics_entities(self) -> None:
        self.assertEqual(
            express_provider_template_entities("perps/analytics"),
            [
                "AffiliateExpressWithdrawComponents",
                "ExpressProviderSource",
                "ExpressProviderSourceByCore",
                "ExpressProviderWithdrawLifecycleHint",
                "WithdrawRequest",
            ],
        )

    def test_events_template_declares_every_raw_provider_event_entity(self) -> None:
        abi = json.loads((REPO_ROOT / "configs/abis/expressProvider_1.json").read_text())
        expected = [entry["name"] for entry in abi if entry["type"] == "event"]

        self.assertEqual(express_provider_template_entities("perps/events"), expected)

    def test_other_modules_fail_closed(self) -> None:
        with self.assertRaisesRegex(ValueError, "Unsupported ExpressProvider template module"):
            express_provider_template_entities("perps/liquidation")
