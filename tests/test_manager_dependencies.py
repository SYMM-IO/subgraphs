import json
import os
import re
import tempfile
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

import scripts.manager as manager


REPO_ROOT = Path(__file__).resolve().parents[1]

EVENTS_OVERLOAD_SIGNATURES = {
    "Deposit": "Deposit(address,address,uint256,bool)",
    "SendQuote": "SendQuote(address,uint256,address[],address,bytes,bytes)",
    "OpenPosition": "OpenPosition(uint256,address,address,uint256,uint256,(uint256,uint256,uint256,uint256))",
    "FillCloseRequest": "FillCloseRequest(uint256,address,address,uint256,uint256,uint8,uint256,(uint256,uint256,uint256,uint256))",
    "LiquidatePositionsPartyA": "LiquidatePositionsPartyA(address,address,uint256[],uint256[],uint256[],uint256[],bytes)",
    "LiquidatePositionsPartyB": "LiquidatePositionsPartyB(address,address,address,uint256[],uint256[],uint256[],uint256[])",
}

INTENTIONALLY_UNMAPPED_V086_EVENTS = {
    "Deposit(address,address,uint256)",
    "FillCloseRequest(uint256,address,address,uint256,uint256,uint8,uint256)",
    "LiquidatePositionsPartyA(address,address,uint256[],uint256[],uint256[],bytes)",
    "LiquidatePositionsPartyB(address,address,address,uint256[],uint256[],uint256[])",
    "LogAddress(address)",
    "LogInt(int256)",
    "LogString(string)",
    "LogUint(uint256)",
    "OpenPosition(uint256,address,address,uint256,uint256)",
    "SendQuote(address,uint256,address[],uint256,uint8,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
    "SettlePartyALiquidation(address,address[],int256[],bytes)",
}


class DependencyInheritanceTests(TestCase):
    def test_child_model_lists_replace_parent_lists(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "parent.json").write_text(json.dumps({"Inherited": ["A"], "Replaced": ["old"]}))
            (root / "child.json").write_text(
                json.dumps({"__extends": "parent.json", "Replaced": ["new"], "ChildOnly": ["B"]})
            )

            dependencies = manager.load_dependencies(str(root / "child.json"))

        self.assertEqual(dependencies, {"Inherited": ["A"], "Replaced": ["new"], "ChildOnly": ["B"]})

    def test_dependency_inheritance_rejects_cycles(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "a.json").write_text(json.dumps({"__extends": "b.json"}))
            (root / "b.json").write_text(json.dumps({"__extends": "a.json"}))

            with self.assertRaisesRegex(ValueError, "cycle"):
                manager.load_dependencies(str(root / "a.json"))

    def test_explicit_parent_must_exist(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            child = Path(temp_dir) / "child.json"
            child.write_text(json.dumps({"__extends": "missing.json"}))

            with self.assertRaisesRegex(FileNotFoundError, "Inherited dependencies file not found"):
                manager.load_dependencies(str(child))

    def test_needed_events_are_deduplicated_without_reordering(self) -> None:
        contract = manager.Contract(address="0x1", abi="symmio", version="0_8_5", startBlock="0")
        quote_events = manager.load_dependencies(str(REPO_ROOT / "perps/common/deps_symmio_0_8_5.json"))["Quote"]

        previous_cwd = Path.cwd()
        try:
            os.chdir(REPO_ROOT)
            events = manager.get_needed_events_for(["Quote", "User"], "perps/analytics", contract)
        finally:
            os.chdir(previous_cwd)

        self.assertEqual(events, [*quote_events, "AddAccount"])

    def test_ordered_unique_preserves_first_seen_order(self) -> None:
        self.assertEqual(manager.ordered_unique(["B", "A", "B", "C", "A"]), ["B", "A", "C"])


class SchemaGenerationTests(TestCase):
    def test_common_models_are_imported_in_deterministic_filename_order(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            models = root / "perps/common/models"
            module = root / "perps/events"
            models.mkdir(parents=True)
            module.mkdir(parents=True)
            (models / "A.graphql").write_text("type A @entity { id: ID! }\n")
            (models / "Z.graphql").write_text("type Z @entity { id: ID! }\n")
            (module / "schema.graphql").write_text("type Local @entity { id: ID! }\n")

            previous_cwd = Path.cwd()
            try:
                os.chdir(root)
                with patch.object(manager.os, "listdir", return_value=["Z.graphql", "A.graphql"]):
                    manager.create_schema_file("perps/events", {"importModels": ["A", "Z"]})
                generated = (root / "schema.graphql").read_text()
            finally:
                os.chdir(previous_cwd)

        self.assertLess(generated.index("type A "), generated.index("type Z "))


class Symmio086DependencyTests(TestCase):
    def test_events_dependencies_resolve_one_full_fidelity_event_per_entity(self) -> None:
        dependencies = manager.load_dependencies(str(REPO_ROOT / "perps/events/deps_symmio_0_8_6.json"))
        event_refs = {event_ref for model_events in dependencies.values() for event_ref in model_events}
        contract = manager.Contract(address="0x1", abi="symmio", version="0_8_6", startBlock="0")

        previous_cwd = Path.cwd()
        try:
            os.chdir(REPO_ROOT)
            events = manager.get_events_with_signatures(event_refs, contract)
            abi = json.loads((REPO_ROOT / "configs/abis/symmio_0_8_6.json").read_text())
            all_event_names = {entry["name"] for entry in abi if entry["type"] == "event"}
            all_events = manager.get_events_with_signatures(all_event_names, contract)
        finally:
            os.chdir(previous_cwd)

        self.assertEqual(len(dependencies), 233)
        self.assertEqual(len(event_refs), 233)
        self.assertEqual(len(events), 233)
        self.assertEqual(len({event.name for event in events}), 233)
        resolved = {event.name: event.signature.replace("indexed ", "") for event in events}
        for event_name, signature in EVENTS_OVERLOAD_SIGNATURES.items():
            self.assertEqual(resolved[event_name], signature)

        mapped_signatures = {event.signature.replace("indexed ", "") for event in events}
        all_signatures = {event.signature.replace("indexed ", "") for event in all_events}
        self.assertEqual(
            all_signatures - mapped_signatures,
            INTENTIONALLY_UNMAPPED_V086_EVENTS,
            "only compatibility duplicates and development logging declarations may be omitted",
        )

    def test_real_primary_contract_with_no_events_is_rejected(self) -> None:
        contract = manager.Contract(address="0x1", abi="symmio", version="0_8_6", startBlock="0")

        with self.assertRaisesRegex(ValueError, "resolved zero events"):
            manager.validate_contract_event_source(contract, "perps/events")

        contract.fake = True
        manager.validate_contract_event_source(contract, "perps/events")


class AccountLayerV3DependencyTests(TestCase):
    def test_events_dependencies_cover_the_complete_current_abi(self) -> None:
        dependencies = manager.load_dependencies(str(REPO_ROOT / "perps/events/deps_accountLayer_3.json"))
        event_refs = {event_ref for model_events in dependencies.values() for event_ref in model_events}
        contract = manager.Contract(address="0x1", abi="accountLayer", version="3", startBlock="0")

        previous_cwd = Path.cwd()
        try:
            os.chdir(REPO_ROOT)
            events = manager.get_events_with_signatures(event_refs, contract)
            abi = json.loads((REPO_ROOT / "configs/abis/accountLayer_3.json").read_text())
        finally:
            os.chdir(previous_cwd)

        self.assertEqual(len(events), 46)
        self.assertEqual({event.name for event in events}, {entry["name"] for entry in abi if entry["type"] == "event"})
        self.assertIn("SignerScopeUpdated", {event.name for event in events})
        self.assertNotIn("ExpressRateSet", event_refs)
        self.assertNotIn("VirtualProviderSet", event_refs)


class GeneratedSourceParityTests(TestCase):
    def _module_models(self, target_module: str) -> list[str]:
        module_path = REPO_ROOT / target_module
        schema = (module_path / "schema.graphql").read_text()
        local_models = re.findall(r"(?m)^type\s+([A-Za-z_][A-Za-z0-9_]*)\b", schema)
        config = json.loads((module_path / "subgraph_config.json").read_text())
        return [*local_models, *config.get("importModels", [])]

    def test_live_symmio_entrypoints_match_resolved_dependencies(self) -> None:
        cases = (
            ("perps/analytics", "0_8_5"),
            ("perps/analytics", "0_8_6"),
            ("perps/events", "0_8_5"),
            ("perps/events", "0_8_6"),
        )

        previous_cwd = Path.cwd()
        try:
            os.chdir(REPO_ROOT)
            for target_module, version in cases:
                with self.subTest(module=target_module, version=version):
                    contract = manager.Contract(address="0x1", abi="symmio", version=version, startBlock="0")
                    event_refs = set(manager.get_needed_events_for(self._module_models(target_module), target_module, contract))
                    expected_handlers = {
                        event.handler_name for event in manager.get_events_with_signatures(event_refs, contract)
                    }
                    source = (REPO_ROOT / target_module / f"src_symmio_{version}.ts").read_text()
                    exported_handlers = set(re.findall(r"(?m)^export function (handle[A-Za-z0-9_]+)\(", source))
                    exported_handlers.discard("handleLatestAccountBalanceBlock")

                    self.assertEqual(
                        exported_handlers,
                        expected_handlers,
                        f"{target_module} symmio {version} entrypoint is stale; regenerate it with --create-src",
                    )
        finally:
            os.chdir(previous_cwd)


class HandlerAbiDependencyTests(TestCase):
    def test_versioned_shared_handler_bindings_are_declared(self) -> None:
        account_layer_v2 = manager.Contract(address="0x1", abi="accountLayer", version="2", startBlock="0")
        account_layer_v3 = manager.Contract(address="0x1", abi="accountLayer", version="3", startBlock="0")
        symmio_v086 = manager.Contract(address="0x1", abi="symmio", version="0_8_6", startBlock="0")

        self.assertEqual(manager.get_handler_abi_dependencies(account_layer_v2), ["accountLayer_1"])
        self.assertEqual(manager.get_handler_abi_dependencies(account_layer_v3), ["accountLayer_1", "accountLayer_2"])
        self.assertEqual(manager.get_handler_abi_dependencies(symmio_v086), ["symmio_0_8_5"])

    def test_unrelated_versions_do_not_gain_fallback_abis(self) -> None:
        account_layer_v1 = manager.Contract(address="0x1", abi="accountLayer", version="1", startBlock="0")
        symmio_v085 = manager.Contract(address="0x1", abi="symmio", version="0_8_5", startBlock="0")

        self.assertEqual(manager.get_handler_abi_dependencies(account_layer_v1), [])
        self.assertEqual(manager.get_handler_abi_dependencies(symmio_v085), [])


class DynamicTemplateHandlerTests(TestCase):
    def test_auto_detected_express_provider_uses_real_handlers(self) -> None:
        contract = manager.Contract(address="0x1", abi="expressProvider", version="1", startBlock="0", fake=True)

        previous_cwd = Path.cwd()
        try:
            os.chdir(REPO_ROOT)
            events = manager.get_events_with_signatures({"WithdrawAccepted", "WithdrawProcessed"}, contract)
        finally:
            os.chdir(previous_cwd)

        self.assertEqual(
            {event.name: event.handler_name for event in events},
            {
                "WithdrawAccepted": "handleWithdrawAccepted",
                "WithdrawProcessed": "handleWithdrawProcessed",
            },
        )

    def test_auto_detected_express_provider_uses_template_source_generator(self) -> None:
        contract = manager.Contract(address="0x1", abi="expressProvider", version="1", startBlock="0", fake=True)
        contract.events = [
            manager.Event(
                source="expressProvider_1",
                name="WithdrawAccepted",
                signature="WithdrawAccepted(address,uint256)",
                handler_name="handleWithdrawAccepted",
                numbered_name="WithdrawAccepted",
                overload_index=0,
            )
        ]

        with (
            patch.object(manager, "generate_template_src_ts") as generate_template,
            patch.object(manager, "generate_src_ts") as generate_regular,
        ):
            manager.generate_module_src_files("perps/events", [contract])

        generate_template.assert_called_once_with("perps/events", contract, "ExpressProvider")
        generate_regular.assert_not_called()

    def test_fake_non_template_contract_does_not_overwrite_real_source(self) -> None:
        contract = manager.Contract(address="0x1", abi="symmio", version="0_8_6", startBlock="0", fake=True)
        contract.events = [
            manager.Event(
                source="symmio_0_8_6",
                name="AddAccount",
                signature="AddAccount(address)",
                handler_name="handleIgnoredEvent",
                numbered_name="AddAccount",
                overload_index=0,
            )
        ]

        with (
            patch.object(manager, "generate_template_src_ts") as generate_template,
            patch.object(manager, "generate_src_ts") as generate_regular,
        ):
            manager.generate_module_src_files("perps/events", [contract])

        generate_template.assert_not_called()
        generate_regular.assert_not_called()
