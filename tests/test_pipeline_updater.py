import subprocess
import tempfile
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

import yaml

import scripts.manager as manager
from scripts.pipeline_updater import render_subgraph_version, update_related_pipelines


def write_pipeline(path: Path, name: str, subgraph: str, version: str = "old") -> None:
    config = {
        "name": name,
        "apiVersion": 3,
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

    def test_dry_run_only_returns_related_pipelines(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "base_analytics")
            write_pipeline(config_dir / "unrelated.yaml", "unrelated", "arbitrum_analytics")

            results = update_related_pipelines("base_analytics", "v3", apply=False, config_dir=config_dir)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].pipeline, "related")
        self.assertEqual(results[0].status, "planned")
        self.assertIn("2 source reference(s)", results[0].message)


class PipelineApplyTests(TestCase):
    def test_apply_checks_existing_pipeline_validates_and_uses_fresh_snapshot(self) -> None:
        calls: list[list[str]] = []
        rendered_versions: list[str] = []

        def runner(command, **_kwargs):
            calls.append(command)
            if command[1:3] in (["pipeline", "validate"], ["pipeline", "apply"]):
                with Path(command[3]).open() as rendered_file:
                    rendered = yaml.safe_load(rendered_file)
                rendered_versions.append(rendered["sources"]["first_entity"]["subgraphs"][0]["version"])
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "related.yaml", "related", "base_analytics")

            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertEqual(results[0].status, "updated")
        self.assertEqual(rendered_versions, ["v3", "v3"])
        self.assertEqual(calls[0], ["goldsky", "pipeline", "get", "related", "--definition"])
        self.assertEqual(calls[1][1:3], ["pipeline", "validate"])
        self.assertEqual(calls[2][1:3], ["pipeline", "apply"])
        self.assertEqual(calls[2][-3:], ["--from-snapshot", "new", "--force"])
        self.assertIn("--from-snapshot", calls[2])

    def test_failure_is_reported_and_does_not_stop_other_pipelines(self) -> None:
        def runner(command, **_kwargs):
            if command[1:4] == ["pipeline", "get", "broken"]:
                return subprocess.CompletedProcess(command, 1, stdout="", stderr="not found")
            return subprocess.CompletedProcess(command, 0, stdout="ok", stderr="")

        with tempfile.TemporaryDirectory() as temp_dir:
            config_dir = Path(temp_dir)
            write_pipeline(config_dir / "broken.yaml", "broken", "base_analytics")
            write_pipeline(config_dir / "working.yaml", "working", "base_analytics")

            results = update_related_pipelines("base_analytics", "v3", apply=True, config_dir=config_dir, runner=runner)

        self.assertEqual([(result.pipeline, result.status) for result in results], [("broken", "failed"), ("working", "updated")])
        self.assertIn("not found", results[0].message)


class ManagerPipelineHookTests(TestCase):
    def test_pipeline_updater_failure_is_non_fatal(self) -> None:
        completed = subprocess.CompletedProcess(["pipeline_updater"], 1)
        with patch.object(manager.subprocess, "run", return_value=completed), patch.object(manager, "warn") as warn:
            result = manager.update_pipelines_after_deploy("base_analytics", "v3")

        self.assertFalse(result)
        warn.assert_called_once()

    def test_pipeline_updater_start_error_is_non_fatal(self) -> None:
        with patch.object(manager.subprocess, "run", side_effect=OSError("missing python")), patch.object(manager, "warn") as warn:
            result = manager.update_pipelines_after_deploy("base_analytics", "v3")

        self.assertFalse(result)
        self.assertIn("deployment succeeded", warn.call_args.args[0])
