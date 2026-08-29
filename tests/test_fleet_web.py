import asyncio
import json
from pathlib import Path
import sys
import tempfile
import time
from unittest import TestCase
from unittest.mock import MagicMock, patch

import scripts.fleet_web as fleet_web
import scripts.manager as manager


class HealthzTests(TestCase):
    def test_healthz_is_static_readiness_probe(self) -> None:
        response = fleet_web.healthz()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.body), fleet_web.FLEET_HEALTH_PAYLOAD)


class ToolResolutionTests(TestCase):
    def test_resolve_tool_uses_standard_mac_paths_when_path_lookup_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tool_path = Path(tmp) / "goldsky"
            tool_path.write_text("#!/bin/sh\n", encoding="utf-8")
            tool_path.chmod(0o755)

            with patch.object(fleet_web.shutil, "which", return_value=None), patch.object(fleet_web, "COMMON_TOOL_DIRS", [tmp]):
                self.assertEqual(fleet_web.resolve_tool("goldsky"), str(tool_path))

    def test_run_goldsky_reports_checked_locations_when_missing(self) -> None:
        with patch.object(fleet_web, "resolve_tool", return_value=None):
            rc, out = fleet_web.run_goldsky(["subgraph", "list"])

        self.assertEqual(rc, 127)
        self.assertIn("/usr/local/bin", out)

    def test_child_environment_augments_path_and_propagates_goldsky(self) -> None:
        with patch.object(fleet_web, "resolve_tool", return_value="/custom/bin/goldsky"):
            env = fleet_web.build_tool_env({"PATH": "/usr/bin", "KEEP_ME": "yes"})

        self.assertEqual(env["KEEP_ME"], "yes")
        self.assertEqual(env[fleet_web.GOLDSKY_BIN_ENV], "/custom/bin/goldsky")
        self.assertEqual(env["PATH"].split(os.pathsep), [*fleet_web.COMMON_TOOL_DIRS, "/usr/bin"])

    def test_manager_uses_propagated_goldsky_when_path_lookup_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tool_path = Path(tmp) / "goldsky"
            tool_path.write_text("#!/bin/sh\n", encoding="utf-8")
            tool_path.chmod(0o755)

            with (
                patch.dict(manager.os.environ, {manager.GOLDSKY_BIN_ENV: str(tool_path)}),
                patch.object(manager.shutil, "which", return_value=None),
                patch.object(manager, "COMMON_TOOL_DIRS", []),
            ):
                command = manager.goldsky_command("subgraph", "list")

        self.assertEqual(command, [str(tool_path), "subgraph", "list"])

    def test_job_process_receives_augmented_tool_environment(self) -> None:
        process = MagicMock(stdout=[], returncode=0)
        expected_env = {"PATH": "/custom/bin", fleet_web.GOLDSKY_BIN_ENV: "/custom/bin/goldsky"}
        with (
            patch.object(fleet_web, "build_tool_env", return_value=expected_env),
            patch.object(fleet_web.subprocess, "Popen", return_value=process) as popen,
        ):
            rc = fleet_web.Job(label="test", cmd=["manager"])._run_command(["manager"])

        self.assertEqual(rc, 0)
        popen.assert_called_once_with(
            ["manager"],
            cwd=fleet_web.REPO_ROOT,
            env=expected_env,
            stdout=fleet_web.subprocess.PIPE,
            stderr=fleet_web.subprocess.STDOUT,
            text=True,
            bufsize=1,
        )


class JsonRequest:
    def __init__(self, payload: dict) -> None:
        self.payload = payload

    async def json(self) -> dict:
        return self.payload


def response_json(response) -> dict:
    return json.loads(response.body)


async def run_inline(function, *args, **kwargs):
    """Keep endpoint unit tests synchronous and avoid creating executor threads."""
    return function(*args, **kwargs)


class BulkDeploySequenceTests(TestCase):
    def setUp(self) -> None:
        self._old_chains = fleet_web._store._chains
        fleet_web._store._chains = [
            fleet_web.ChainConfig(
                key="arbitrum",
                path=Path("configs/perps/arbitrum.json"),
                network="arbitrum-one",
                deploy_urls={"perps/analytics": "arbitrum_analytics"},
            ),
            fleet_web.ChainConfig(
                key="hyperevm",
                path=Path("configs/perps/hyperevm.json"),
                network="hyperevm",
                deploy_urls={"perps/analytics": "hyperevm_mainnet_analytics"},
            ),
        ]

    def tearDown(self) -> None:
        fleet_web._store._chains = self._old_chains

    def test_bulk_deploy_queues_one_ordered_sequence(self) -> None:
        selections = [
            {"chain": "hyperevm", "module": "perps/analytics", "base": "hyperevm_mainnet_analytics", "orphan": False},
            {"chain": "arbitrum", "module": "perps/analytics", "base": "arbitrum_analytics", "orphan": False},
        ]

        with patch.object(fleet_web, "start_job") as start_job, patch.object(fleet_web, "start_job_sequence") as start_sequence:
            queued, deployable_chains = fleet_web.queue_bulk_deploy_jobs(selections, "v9.9.9")

        self.assertEqual(queued, 2)
        self.assertEqual(deployable_chains, ["hyperevm", "arbitrum"])
        start_job.assert_not_called()
        start_sequence.assert_called_once()

        _, kwargs = start_sequence.call_args
        self.assertEqual(kwargs["label"], "Batch deploy v9.9.9 · 2 subgraphs")
        self.assertEqual(kwargs["kind"], "deploy")
        self.assertEqual(
            kwargs["steps"],
            [
                (
                    "hyperevm · perps/analytics v9.9.9",
                    [
                        "python3",
                        "scripts/manager.py",
                        "configs/perps/hyperevm.json",
                        "perps/analytics",
                        "v9.9.9",
                        "--deploy",
                    ],
                ),
                (
                    "arbitrum · perps/analytics v9.9.9",
                    [
                        "python3",
                        "scripts/manager.py",
                        "configs/perps/arbitrum.json",
                        "perps/analytics",
                        "v9.9.9",
                        "--deploy",
                    ],
                ),
            ],
        )


class ActivityProgressRenderTests(TestCase):
    def setUp(self) -> None:
        self._old_jobs = dict(fleet_web._JOBS)
        fleet_web._JOBS.clear()

    def tearDown(self) -> None:
        fleet_web._JOBS.clear()
        fleet_web._JOBS.update(self._old_jobs)

    def test_running_sequence_job_shows_current_step_progress(self) -> None:
        job = fleet_web.Job(
            label="Batch deploy v9.9.9 · 2 subgraphs",
            kind="deploy",
            steps=[
                ("hyperevm · perps/analytics v9.9.9", ["true"]),
                ("arbitrum · perps/analytics v9.9.9", ["true"]),
            ],
        )
        job.id = "progress-test"
        job.status = "running"
        job.started = time.time() - 3
        job.current_step_index = 1
        job.current_step_label = "hyperevm · perps/analytics v9.9.9"
        job.completed_steps = 0
        fleet_web._JOBS[job.id] = job

        html = fleet_web.render_jobs_panel()

        self.assertIn("Step 1 of 2", html)
        self.assertIn("hyperevm · perps/analytics v9.9.9", html)
        self.assertIn('style="width: 50%;"', html)

    def test_grid_cells_include_responsive_labels(self) -> None:
        store = fleet_web.FleetStore()
        store._chains = [
            fleet_web.ChainConfig(
                key="base",
                path=Path("configs/perps/base.json"),
                network="base",
                deploy_urls={"perps/analytics": "base_analytics"},
            )
        ]
        store._state = fleet_web.GoldskyState(
            deployments={
                "base_analytics/v1": fleet_web.Deployment(
                    base_name="base_analytics",
                    version="v1",
                    status="healthy",
                    synced="100%",
                )
            },
            tags={"base_analytics": {"latest": "v1"}},
        )

        html = fleet_web.render_grid(store)

        self.assertIn('data-label="Chain"', html)
        self.assertIn('data-label="Module"', html)
        self.assertIn('data-label="Deployments"', html)
        self.assertIn('data-label="Tags"', html)
        self.assertIn('id="no-filter-results"', html)

    def test_last_fetched_oob_updates_shell_timestamp(self) -> None:
        old_last_fetched = fleet_web._store._last_fetched_at
        fleet_web._store._last_fetched_at = time.time()
        try:
            html = fleet_web.render_last_fetched_oob()
        finally:
            fleet_web._store._last_fetched_at = old_last_fetched

        self.assertIn('id="last-fetched-label"', html)
        self.assertIn('hx-swap-oob="innerHTML"', html)
        self.assertIn("last fetched", html)

    def test_multi_chain_deploy_queues_one_ordered_sequence(self) -> None:
        with patch.object(fleet_web, "start_job") as start_job, patch.object(fleet_web, "start_job_sequence") as start_sequence:
            queued, deployable_chains = fleet_web.queue_chain_deploy_jobs(
                module="perps/analytics",
                chains_sel=["arbitrum", "hyperevm"],
                version="v1.2.3",
            )

        self.assertEqual(queued, 2)
        self.assertEqual(deployable_chains, ["arbitrum", "hyperevm"])
        start_job.assert_not_called()
        start_sequence.assert_called_once()

        _, kwargs = start_sequence.call_args
        self.assertEqual(kwargs["label"], "Deploy perps/analytics v1.2.3 · 2 chains")
        self.assertEqual(kwargs["kind"], "deploy")
        self.assertEqual(
            kwargs["steps"],
            [
                (
                    "arbitrum · perps/analytics v1.2.3",
                    [
                        "python3",
                        "scripts/manager.py",
                        "configs/perps/arbitrum.json",
                        "perps/analytics",
                        "v1.2.3",
                        "--deploy",
                    ],
                ),
                (
                    "hyperevm · perps/analytics v1.2.3",
                    [
                        "python3",
                        "scripts/manager.py",
                        "configs/perps/hyperevm.json",
                        "perps/analytics",
                        "v1.2.3",
                        "--deploy",
                    ],
                ),
            ],
        )


class ReactApiTests(TestCase):
    def setUp(self) -> None:
        self._old_chains = fleet_web._store._chains
        self._old_state = fleet_web._store._state
        self._old_last_fetched = fleet_web._store._last_fetched_at
        self._old_jobs = dict(fleet_web._JOBS)
        fleet_web._JOBS.clear()
        fleet_web._store._chains = [
            fleet_web.ChainConfig(
                key="base",
                path=Path("configs/perps/base.json"),
                network="base",
                deploy_urls={"perps/analytics": "base_analytics"},
            )
        ]
        fleet_web._store._state = fleet_web.GoldskyState(
            deployments={
                "base_analytics/v1": fleet_web.Deployment(
                    base_name="base_analytics",
                    version="v1",
                    status="healthy",
                    synced="100%",
                )
            },
            tags={"base_analytics": {"latest": "v1"}},
        )
        fleet_web._store._last_fetched_at = time.time()

    def tearDown(self) -> None:
        fleet_web._store._chains = self._old_chains
        fleet_web._store._state = self._old_state
        fleet_web._store._last_fetched_at = self._old_last_fetched
        fleet_web._JOBS.clear()
        fleet_web._JOBS.update(self._old_jobs)

    def test_build_fleet_payload_returns_react_api_shape(self) -> None:
        dependencies = {
            "base_analytics": [
                fleet_web.PipelineDependency(
                    pipeline="base-solvency-engine",
                    config_path=Path("pipelines/base-solvency-engine.yaml"),
                    reference_count=3,
                )
            ]
        }
        with patch.object(fleet_web, "load_pipeline_dependencies", return_value=dependencies):
            data = fleet_web.build_fleet_payload(fleet_web._store)

        self.assertEqual(data["summary"]["rows"], 1)
        self.assertEqual(data["groups"][0]["modules"][0]["deployments"][0]["version"], "v1")
        self.assertEqual(data["groups"][0]["modules"][0]["tags"]["latest"], "v1")
        self.assertEqual(
            data["groups"][0]["modules"][0]["managed_pipelines"],
            [{"name": "base-solvency-engine", "reference_count": 3}],
        )
        self.assertIn("last fetched", data["lastFetchedLabel"])

    def test_row_promote_updates_pipeline_after_tag_success(self) -> None:
        with (
            patch.object(fleet_web.asyncio, "to_thread", new=run_inline),
            patch.object(fleet_web, "do_pipeline_update", return_value=(True, ["pipeline updated"])) as update_pipeline,
        ):
            response = asyncio.run(
                fleet_web.api_row_promote(
                    JsonRequest({
                        "base": "base_analytics",
                        "version": "v1",
                        "tags": ["latest"],
                        "updatePipelines": True,
                    })
                )
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_json(response)["toast"]["kind"], "ok")
        update_pipeline.assert_called_once_with({"base_analytics": "v1"})

    def test_row_promote_does_not_update_pipeline_when_option_is_disabled(self) -> None:
        with patch.object(fleet_web, "do_pipeline_update") as update_pipeline:
            response = asyncio.run(
                fleet_web.api_row_promote(
                    JsonRequest({
                        "base": "base_analytics",
                        "version": "v1",
                        "tags": ["latest"],
                        "updatePipelines": False,
                    })
                )
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_json(response)["toast"]["kind"], "ok")
        update_pipeline.assert_not_called()

    def test_row_promote_reports_pipeline_failure_without_hiding_tag_success(self) -> None:
        with (
            patch.object(fleet_web.asyncio, "to_thread", new=run_inline),
            patch.object(fleet_web, "do_pipeline_update", return_value=(False, ["pipeline failed"])),
        ):
            response = asyncio.run(
                fleet_web.api_row_promote(
                    JsonRequest({
                        "base": "base_analytics",
                        "version": "v1",
                        "tags": ["latest"],
                        "updatePipelines": True,
                    })
                )
            )

        payload = response_json(response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["toast"]["kind"], "err")
        self.assertEqual(payload["toast"]["title"], "Promoted, but pipeline update failed")
        self.assertEqual(payload["fleet"]["groups"][0]["modules"][0]["tags"]["latest"], "v1")

    def test_bulk_promote_updates_pipeline_after_every_selection_succeeds(self) -> None:
        selections = [{"chain": "base", "module": "perps/analytics", "base": "base_analytics", "orphan": False}]
        with (
            patch.object(fleet_web.asyncio, "to_thread", new=run_inline),
            patch.object(fleet_web, "do_pipeline_update", return_value=(True, ["pipeline updated"])) as update_pipeline,
        ):
            response = asyncio.run(
                fleet_web.api_bulk_promote(
                    JsonRequest({
                        "selections": selections,
                        "tags": ["latest"],
                        "mode": "specific",
                        "version": "v1",
                        "requireSynced": True,
                        "deleteDisplaced": False,
                        "updatePipelines": True,
                    })
                )
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_json(response)["toast"]["kind"], "ok")
        update_pipeline.assert_called_once_with({"base_analytics": "v1"})

    def test_bulk_promote_skips_pipeline_when_a_selection_is_not_promoted(self) -> None:
        selections = [
            {"chain": "base", "module": "perps/analytics", "base": "base_analytics", "orphan": False},
            {"chain": "missing", "module": "perps/analytics", "base": "missing_analytics", "orphan": True},
        ]
        with (
            patch.object(fleet_web.asyncio, "to_thread", new=run_inline),
            patch.object(fleet_web, "do_pipeline_update") as update_pipeline,
        ):
            response = asyncio.run(
                fleet_web.api_bulk_promote(
                    JsonRequest({
                        "selections": selections,
                        "tags": ["latest"],
                        "mode": "specific",
                        "version": "v1",
                        "requireSynced": True,
                        "deleteDisplaced": False,
                        "updatePipelines": True,
                    })
                )
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_json(response)["toast"]["kind"], "err")
        update_pipeline.assert_not_called()
