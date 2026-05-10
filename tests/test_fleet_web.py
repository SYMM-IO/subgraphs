from pathlib import Path
import time
from unittest import TestCase
from unittest.mock import patch

import scripts.fleet_web as fleet_web


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
                    ["python3", "scripts/manager.py", "configs/perps/hyperevm.json", "perps/analytics", "v9.9.9", "--deploy"],
                ),
                (
                    "arbitrum · perps/analytics v9.9.9",
                    ["python3", "scripts/manager.py", "configs/perps/arbitrum.json", "perps/analytics", "v9.9.9", "--deploy"],
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
                    ["python3", "scripts/manager.py", "configs/perps/arbitrum.json", "perps/analytics", "v1.2.3", "--deploy"],
                ),
                (
                    "hyperevm · perps/analytics v1.2.3",
                    ["python3", "scripts/manager.py", "configs/perps/hyperevm.json", "perps/analytics", "v1.2.3", "--deploy"],
                ),
            ],
        )


class ReactApiTests(TestCase):
    def setUp(self) -> None:
        self._old_chains = fleet_web._store._chains
        self._old_state = fleet_web._store._state
        self._old_last_fetched = fleet_web._store._last_fetched_at
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

    def test_build_fleet_payload_returns_react_api_shape(self) -> None:
        data = fleet_web.build_fleet_payload(fleet_web._store)

        self.assertEqual(data["summary"]["rows"], 1)
        self.assertEqual(data["groups"][0]["modules"][0]["deployments"][0]["version"], "v1")
        self.assertEqual(data["groups"][0]["modules"][0]["tags"]["latest"], "v1")
        self.assertIn("last fetched", data["lastFetchedLabel"])
