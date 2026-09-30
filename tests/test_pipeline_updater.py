import subprocess
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest import TestCase

import yaml

from scripts.pipeline_updater import (
    extract_subgraph_versions,
    load_managed_pipeline_paths,
    load_pipeline_dependencies,
    parse_pipeline_definition_versions,
    render_subgraph_version,
    render_subgraph_versions,
    update_managed_pipelines,
    update_related_pipelines,
)


def write_pipeline(path: Path, name: str, subgraph: str, version: str = "old") -> dict:
    config = {
        "name": name,
        "apiVersion": 3,
        "resource_size": "s",
        "use_dedicated_ip": False,
        "sources": {
            "first_entity": {
                "type": "subgraph_entity",
                "name": "first_entity",
                "subgraphs": [{"name": subgraph, "version": version}],
            },
            "second_entity": {
                "type": "subgraph_entity",
                "name": "second_entity",
                "subgraphs": [{"name": subgraph, "version": version}],
            },
        },
        "transforms": {},
        "sinks": {"sink": {"type": "kafka", "from": "first_entity", "secret_name": "TEST"}},
    }
    with path.open("w") as config_file:
        yaml.safe_dump(config, config_file, sort_keys=False)
    return config


def live_response(command: list[str], config: dict, version: int = 1) -> subprocess.CompletedProcess:
    response = {
        **deepcopy(config),
        "version": version,
        "status": "ACTIVE",
        "project_id": "test-project",
        "runtime_details": {"status": "RUNNING", "errors": []},
    }
    return subprocess.CompletedProcess(command, 0, stdout=yaml.safe_dump(response), stderr="")


class PipelineRenderingTests(TestCase):
    def test_render_updates_every_matching_reference_without_mutating_source(self) -> None:
        config = {
            "sources": {
                "matching": {
                    "type": "subgraph_entity",
                    "subgraphs": [
                        {"name": "base_analytics", "version": "v1"},
                        {"name": "arbitrum_analytics", "version": "v2"},
                    ],
                },
                "dataset": {"type": "dataset", "dataset_name": "base.logs", "version": "1.0.0"},
            }
        }

        rendered, count = render_subgraph_version(config, "base_analytics", "v3")

        self.assertEqual(count, 1)
        self.assertEqual(rendered["sources"]["matching"]["subgraphs"][0]["version"], "v3")
        self.assertEqual(rendered["sources"]["matching"]["subgraphs"][1]["version"], "v2")
        self.assertEqual(config["sources"]["matching"]["subgraphs"][0]["version"], "v1")

    def test_render_updates_multiple_subgraphs_in_one_pass(self) -> None:
        config = {
            "sources": {
                "matching": {
                    "type": "subgraph_entity",
                    "subgraphs": [
                        {"name": "arbitrum_analytics", "version": "v1"},
                        {"name": "arbitrum-vibe-analytics", "version": "v2"},
                    ],
                }
            }
        }

        rendered, count = render_subgraph_versions(
            config,
            {"arbitrum_analytics": "v3", "arbitrum-vibe-analytics": "v4"},
        )

        self.assertEqual(count, 2)
        self.assertEqual(
            rendered["sources"]["matching"]["subgraphs"],
            [
                {"name": "arbitrum_analytics", "version": "v3"},
                {"name": "arbitrum-vibe-analytics", "version": "v4"},
            ],
        )

    def test_dependency_index_counts_references_by_subgraph(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "base_analytics")

            dependencies = load_pipeline_dependencies(config_dir)

        self.assertEqual(len(dependencies["base_analytics"]), 1)
        self.assertEqual(dependencies["base_analytics"][0].pipeline, "related")
        self.assertEqual(dependencies["base_analytics"][0].reference_count, 2)
        self.assertEqual(dependencies["base_analytics"][0].configured_versions, ("old",))

    def test_extracts_versions_from_flat_goldsky_definition(self) -> None:
        definition = {
            "funding": {
                "type": "subgraph_entity",
                "subgraphs": [{"name": "base_analytics", "version": "v2"}],
            },
            "position": {
                "type": "subgraph_entity",
                "subgraphs": [{"name": "base_analytics", "version": "v2"}],
            },
            "transform": {"type": "sql", "sql": "select 1"},
        }

        self.assertEqual(extract_subgraph_versions(definition), {"base_analytics": ("v2",)})
        self.assertEqual(parse_pipeline_definition_versions(yaml.safe_dump(definition)), {"base_analytics": ("v2",)})

    def test_live_dependencies_replace_stale_local_references(self) -> None:
        live = {
            entity: {"type": "subgraph_entity", "subgraphs": [{"name": "arbitrum-vibe-mainnet-analytics", "version": "v0.0.1"}]}
            for entity in ("funding", "position", "balance")
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "old_analytics")
            dependencies = load_pipeline_dependencies(config_dir, live_definitions={"related": live})

        self.assertNotIn("old_analytics", dependencies)
        dependency = dependencies["arbitrum-vibe-mainnet-analytics"][0]
        self.assertEqual(dependency.pipeline, "related")
        self.assertEqual(dependency.reference_count, 3)
        self.assertEqual(dependency.configured_versions, ("v0.0.1",))

    def test_registry_does_not_require_local_subgraph_sources(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config_path = config_dir / "related.yaml"
            config_path.write_text("name: related\nsources: {}\n")
            live = {"sources": {"funding": {"type": "subgraph_entity", "subgraphs": [{"name": "live_analytics", "version": "v1"}]}}}

            self.assertEqual(load_managed_pipeline_paths(config_dir), {"related": config_path})
            self.assertEqual(load_pipeline_dependencies(config_dir), {})
            dependencies = load_pipeline_dependencies(config_dir, live_definitions={"related": live, "unmanaged": live})

        self.assertEqual([dependency.pipeline for dependency in dependencies["live_analytics"]], ["related"])

    def test_unverified_pipeline_dependencies_fall_back_to_local_config(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            dependencies = load_pipeline_dependencies(config_dir, live_definitions={})

        self.assertEqual(dependencies["base_analytics"][0].configured_versions, ("old",))

    def test_dry_run_only_returns_related_pipelines(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            return live_response(command, configs[command[3]])

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            configs = {
                "related": write_pipeline(config_dir / "related.yaml", "related", "base_analytics"),
                "unrelated": write_pipeline(config_dir / "unrelated.yaml", "unrelated", "arbitrum_analytics"),
            }

            results = update_related_pipelines("base_analytics", "v3", apply=False, config_dir=config_dir, runner=runner)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].pipeline, "related")
        self.assertEqual(results[0].status, "planned")
        self.assertIn("2 source reference(s)", results[0].message)
        self.assertEqual([command[2] for command in calls], ["get", "get"])


class PipelineApplyTests(TestCase):
    def test_confirmed_absent_unrelated_pipeline_does_not_block_live_dependency_discovery(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] == ["pipeline", "get"]:
                if command[3] == "deleted":
                    return subprocess.CompletedProcess(command, 1, stdout="", stderr="Pipeline with name:deleted not found")
                return live_response(command, live)
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "deleted.yaml", "deleted", "another_analytics")
            local = write_pipeline(config_dir / "related.yaml", "related", "old_analytics")
            live = deepcopy(local)
            for source in live["sources"].values():
                source["subgraphs"][0]["name"] = "live_analytics"
            results = update_related_pipelines("live_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertEqual([(result.pipeline, result.status) for result in results], [("related", "updated")])
        self.assertEqual([command[3] for command in calls if command[2] == "get"], ["deleted", "related", "related"])

    def test_unreadable_unrelated_pipeline_fails_discovery_instead_of_silently_skipping_it(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "unknown.yaml", "unknown", "another_analytics")
            for error in ("access denied", "connection failed", "Pipeline with name:another-pipeline not found"):
                with self.subTest(error=error):
                    calls = []

                    def runner(command, **_kwargs):
                        calls.append(command)
                        return subprocess.CompletedProcess(command, 1, stdout="", stderr=error)

                    results = update_related_pipelines("live_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

                    self.assertEqual(len(results), 1)
                    self.assertTrue(results[0].failed)
                    self.assertEqual([command[2] for command in calls], ["get"])

    def test_confirmed_absent_locally_related_pipeline_fails_without_creating_it(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            return subprocess.CompletedProcess(command, 1, stdout="", stderr="Pipeline with name:related not found")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertTrue(results[0].failed)
        self.assertIn("does not exist", results[0].message)
        self.assertEqual([command[2] for command in calls], ["get"])

    def test_batch_apply_keeps_every_requested_subgraph_version(self) -> None:
        rendered_references: list[list[dict[str, str]]] = []

        def runner(command, **_kwargs):
            if command[1:3] == ["pipeline", "get"]:
                return live_response(command, config)
            if command[1:3] == ["pipeline", "apply"]:
                with Path(command[3]).open() as rendered_file:
                    rendered = yaml.safe_load(rendered_file)
                rendered_references.append(rendered["sources"]["entities"]["subgraphs"])
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        config = {
            "name": "shared",
            "apiVersion": 3,
            "resource_size": "s",
            "use_dedicated_ip": False,
            "sources": {
                "entities": {
                    "type": "subgraph_entity",
                    "subgraphs": [
                        {"name": "arbitrum_analytics", "version": "old-prod"},
                        {"name": "arbitrum-vibe-analytics", "version": "old-stage"},
                    ],
                }
            },
            "transforms": {},
            "sinks": {},
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            with (config_dir / "shared.yaml").open("w") as config_file:
                yaml.safe_dump(config, config_file, sort_keys=False)

            results = update_managed_pipelines(
                {"arbitrum_analytics": "new-prod", "arbitrum-vibe-analytics": "new-stage"},
                apply=True,
                config_dir=config_dir,
                runner=runner,
            )

        self.assertEqual(results[0].status, "updated")
        self.assertEqual(
            rendered_references,
            [
                [
                    {"name": "arbitrum_analytics", "version": "new-prod"},
                    {"name": "arbitrum-vibe-analytics", "version": "new-stage"},
                ]
            ],
        )

    def test_apply_checks_existing_pipeline_validates_and_uses_fresh_snapshot(self) -> None:
        calls: list[list[str]] = []
        rendered_versions: list[str] = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] == ["pipeline", "get"]:
                return live_response(command, config)
            if command[1:3] in (["pipeline", "validate"], ["pipeline", "apply"]):
                with Path(command[3]).open() as rendered_file:
                    rendered = yaml.safe_load(rendered_file)
                rendered_versions.append(rendered["sources"]["first_entity"]["subgraphs"][0]["version"])
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config = write_pipeline(config_dir / "related.yaml", "related", "base_analytics")

            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertEqual(results[0].status, "updated")
        self.assertEqual(rendered_versions, ["v3", "v3"])
        self.assertEqual(calls[0], ["goldsky", "pipeline", "get", "related", "--output", "yaml", "--color", "false"])
        self.assertEqual(calls[1][1:3], ["pipeline", "validate"])
        self.assertEqual(calls[2], calls[0])
        self.assertEqual(calls[3][1:3], ["pipeline", "apply"])
        self.assertEqual(calls[3][-3:], ["--from-snapshot", "new", "--force"])

    def test_failure_is_reported_and_does_not_stop_other_pipelines(self) -> None:
        def runner(command, **_kwargs):
            if command[1:4] == ["pipeline", "get", "broken"]:
                return subprocess.CompletedProcess(command, 1, stdout="", stderr="not found")
            if command[1:3] == ["pipeline", "get"]:
                return live_response(command, working)
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "broken.yaml", "broken", "base_analytics")
            working = write_pipeline(config_dir / "working.yaml", "working", "base_analytics")

            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertEqual([(result.pipeline, result.status) for result in results], [("broken", "failed"), ("working", "updated")])
        self.assertIn("not found", results[0].message)

    def test_stale_repository_config_discovers_live_only_branch_and_preserves_all_18_sinks(self) -> None:
        live = {
            "name": "arbitrum-solvency-engine",
            "apiVersion": 3,
            "description": "Live configuration maintained in Goldsky",
            "resource_size": "m",
            "use_dedicated_ip": True,
            "sources": {},
            "transforms": {},
            "sinks": {},
        }
        subgraphs = {"canonical": "arbitrum_analytics", "vibe_stage": "arbitrum-vibe-analytics", "vibe_prod": "arbitrum-vibe-mainnet-analytics"}
        for branch, subgraph in subgraphs.items():
            for entity in ("funding", "position", "balance"):
                source = f"{entity}_{branch}"
                transform = f"liquidator_{source}"
                live["sources"][source] = {"type": "subgraph_entity", "name": entity, "subgraphs": [{"name": subgraph, "version": f"old-{branch}"}]}
                live["transforms"][transform] = {"type": "sql", "sql": f"SELECT * FROM {source}", "primary_key": "id"}
                for destination in ("prod", "stage"):
                    live["sinks"][f"{transform}_to_{destination}"] = {
                        "type": "kafka",
                        "from": transform,
                        "topic": source,
                        "secret_name": f"KAFKA_{destination.upper()}",
                        "upsert_mode": False,
                    }
        stale = deepcopy(live)
        stale["resource_size"] = "s"
        stale["use_dedicated_ip"] = False
        for section in ("sources", "transforms", "sinks"):
            stale[section] = {name: value for name, value in stale[section].items() if "vibe_prod" not in name}
        stale["sinks"] = {name: value for name, value in stale["sinks"].items() if "vibe_stage_to_prod" not in name}
        self.assertEqual(len(stale["sinks"]), 9)
        self.assertEqual(len(live["sinks"]), 18)
        applied = []
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] == ["pipeline", "get"]:
                return live_response(command, live, version=23)
            if command[1:3] == ["pipeline", "apply"]:
                applied.append(yaml.safe_load(Path(command[3]).read_text()))
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            (config_dir / "arbitrum.yaml").write_text(yaml.safe_dump(stale))
            for subgraph, version in (("arbitrum-vibe-analytics", "v0.0.6"), ("arbitrum-vibe-mainnet-analytics", "v0.0.4")):
                for apply in (False, True):
                    with self.subTest(subgraph=subgraph, apply=apply):
                        applied.clear()
                        calls.clear()
                        expected, count = render_subgraph_version(live, subgraph, version)
                        self.assertEqual(count, 3)
                        results = update_related_pipelines(subgraph, version, apply=apply, config_dir=config_dir, runner=runner)
                        self.assertEqual(len(results), 1)
                        self.assertEqual(results[0].status, "updated" if apply else "planned")
                        self.assertIn("3 source reference(s)", results[0].message)
                        self.assertEqual(applied, [expected] if apply else [])
                        if not apply:
                            self.assertEqual([command[2] for command in calls], ["get"])
        self.assertEqual(live["sources"]["funding_vibe_stage"]["subgraphs"][0]["version"], "old-vibe_stage")

    def test_invalid_live_config_never_falls_back_to_repository(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config = write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            invalid = ["ok", "[]", "sources: [", yaml.safe_dump({**config, "name": "another-pipeline", "version": 1})]
            invalid.append(yaml.safe_dump({**config, "version": 1, "unknown_pipeline_setting": True}))
            invalid.extend(
                yaml.safe_dump({key: value for key, value in {**config, "version": 1}.items() if key != missing})
                for missing in ("sources", "transforms", "sinks", "apiVersion", "resource_size", "use_dedicated_ip", "version")
            )
            for text in invalid:
                with self.subTest(text=text):
                    calls = []

                    def runner(command, **_kwargs):
                        calls.append(command)
                        return subprocess.CompletedProcess(command, 0, stdout=text, stderr="")

                    results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)
                    self.assertTrue(results[0].failed)
                    self.assertEqual(len(calls), 1)

    def test_missing_live_reference_never_applies_local_sources(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            live = deepcopy(config)
            for source in live["sources"].values():
                source["subgraphs"][0]["name"] = "another_analytics"
            return live_response(command, live)

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config = write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertTrue(results[0].failed)
        self.assertIn("base_analytics", results[0].message)
        self.assertEqual(len(calls), 1)

    def test_change_during_validation_aborts_apply(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] == ["pipeline", "get"]:
                live = deepcopy(config)
                version = 1
                if len(calls) > 1:
                    live["sinks"]["new_sink"] = {"type": "kafka", "from": "first_entity", "secret_name": "OTHER"}
                    version = 2
                return live_response(command, live, version)
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config = write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertTrue(results[0].failed)
        self.assertIn("changed", results[0].message)
        self.assertFalse(any(command[1:3] == ["pipeline", "apply"] for command in calls))

    def test_validation_failure_never_applies(self) -> None:
        calls = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] == ["pipeline", "get"]:
                return live_response(command, config)
            return subprocess.CompletedProcess(command, 1, stdout="", stderr="invalid transform")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            config = write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertTrue(results[0].failed)
        self.assertIn("invalid transform", results[0].message)
        self.assertEqual([command[2] for command in calls], ["get", "validate"])
