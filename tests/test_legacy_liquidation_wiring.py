import json
import os
import re
import tempfile
from pathlib import Path
from unittest import TestCase

from scripts import manager


REPO_ROOT = Path(__file__).resolve().parents[1]


class LegacyLiquidationWiringTests(TestCase):
    def test_real_dependencies_generate_legacy_completion_entrypoints(self) -> None:
        previous_cwd = Path.cwd()
        try:
            for module in ("perps/analytics", "perps/events"):
                schema = (REPO_ROOT / module / "schema.graphql").read_text()
                models = re.findall(r"(?m)^type\s+([A-Za-z_][A-Za-z0-9_]*)\b", schema)
                models += json.loads((REPO_ROOT / module / "subgraph_config.json").read_text()).get("importModels", [])
                for version in ("0_8_1", "0_8_2"):
                    with self.subTest(module=module, version=version):
                        os.chdir(REPO_ROOT)
                        contract = manager.Contract(address="0x1", abi="symmio", version=version, startBlock="0")
                        references = manager.get_needed_events_for(models, module, contract)
                        self.assertIn("FullyLiquidatedPartyA", references)
                        contract.events = manager.get_events_with_signatures(references, contract)
                        completion = [event for event in contract.events if event.name == "FullyLiquidatedPartyA"]
                        self.assertEqual(len(completion), 1, "ABI must resolve the requested legacy completion event")
                        self.assertEqual(completion[0].signature, "FullyLiquidatedPartyA(address)")
                        self.assertEqual(completion[0].handler_name, "handleFullyLiquidatedPartyA")

                        with tempfile.TemporaryDirectory() as temporary:
                            os.chdir(temporary)
                            Path(module).mkdir(parents=True)
                            manager.generate_src_ts(module, contract)
                            generated = Path(module, f"src_symmio_{version}.ts").read_text()

                        checked_in = (REPO_ROOT / module / f"src_symmio_{version}.ts").read_text()
                        for source in (generated, checked_in):
                            self.assertRegex(source, r"import\s*\{\s*FullyLiquidatedPartyAHandler\s*\}")
                            self.assertRegex(
                                source,
                                rf"import\s*\{{[^}}]*\bFullyLiquidatedPartyA\b[^}}]*\}}\s*from [\"']../../generated/symmio_{version}/symmio_{version}[\"']",
                            )
                            body = re.search(r"export function handleFullyLiquidatedPartyA\([^)]*\): void \{([^}]+)\}", source)
                            self.assertIsNotNone(body)
                            self.assertIn("ensureSyncMeta(event.block)", body[1])
                            self.assertIn("new FullyLiquidatedPartyAHandler<FullyLiquidatedPartyA>()", body[1])
                            self.assertIn(f"handler.handle(event, Version.v_{version})", body[1])

                        exports = lambda source: set(re.findall(r"(?m)^export function (handle[A-Za-z0-9_]+)\(", source))
                        self.assertEqual(exports(generated), exports(checked_in))
        finally:
            os.chdir(previous_cwd)
