"""Promotion-gated updates for repository-managed Goldsky pipelines.

Pipeline definitions under ``pipelines/`` are the source of truth. When a
subgraph is promoted, every matching ``subgraph_entity`` reference is rendered
with the promoted immutable version and applied to the existing pipeline.

This module deliberately reports failures instead of raising them so callers
can report tag promotion and pipeline maintenance as separate outcomes.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import tempfile
from collections import Counter
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Mapping

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG_DIR = REPO_ROOT / "pipelines"
DEFAULT_COMMAND_TIMEOUT = int(os.environ.get("GOLDSKY_PIPELINE_TIMEOUT_SECONDS", "900"))

CommandRunner = Callable[..., subprocess.CompletedProcess[str]]


@dataclass(frozen=True)
class PipelineUpdateResult:
    pipeline: str
    config_path: Path
    status: str
    message: str

    @property
    def failed(self) -> bool:
        return self.status == "failed"


@dataclass(frozen=True)
class PipelineDependency:
    pipeline: str
    config_path: Path
    reference_count: int


def load_pipeline_dependencies(config_dir: Path = DEFAULT_CONFIG_DIR) -> dict[str, list[PipelineDependency]]:
    """Index valid managed pipeline definitions by referenced subgraph name."""
    dependencies: dict[str, list[PipelineDependency]] = {}
    if not config_dir.exists():
        return dependencies

    for config_path in sorted((*config_dir.glob("*.yaml"), *config_dir.glob("*.yml"))):
        try:
            with config_path.open() as config_file:
                config = yaml.safe_load(config_file)
        except (OSError, yaml.YAMLError):
            continue
        if not isinstance(config, dict):
            continue

        pipeline = config.get("name")
        sources = config.get("sources")
        if not isinstance(pipeline, str) or not pipeline or not isinstance(sources, dict):
            continue

        reference_counts: Counter[str] = Counter()
        for source in sources.values():
            if not isinstance(source, dict) or source.get("type") != "subgraph_entity":
                continue
            references = source.get("subgraphs")
            if not isinstance(references, list):
                continue
            for reference in references:
                if isinstance(reference, dict) and isinstance(reference.get("name"), str) and reference["name"]:
                    reference_counts[reference["name"]] += 1

        for subgraph, reference_count in sorted(reference_counts.items()):
            dependencies.setdefault(subgraph, []).append(
                PipelineDependency(
                    pipeline=pipeline,
                    config_path=config_path,
                    reference_count=reference_count,
                )
            )

    return dependencies


def render_subgraph_versions(config: dict[str, Any], subgraph_versions: Mapping[str, str]) -> tuple[dict[str, Any], int]:
    """Return a copy with every matching source pinned to its requested version."""
    rendered = deepcopy(config)
    updated_references = 0

    sources = rendered.get("sources")
    if not isinstance(sources, dict):
        return rendered, updated_references

    for source in sources.values():
        if not isinstance(source, dict) or source.get("type") != "subgraph_entity":
            continue
        references = source.get("subgraphs")
        if not isinstance(references, list):
            continue
        for reference in references:
            if not isinstance(reference, dict):
                continue
            subgraph = reference.get("name")
            if isinstance(subgraph, str) and subgraph in subgraph_versions:
                reference["version"] = subgraph_versions[subgraph]
                updated_references += 1

    return rendered, updated_references


def render_subgraph_version(config: dict[str, Any], subgraph: str, version: str) -> tuple[dict[str, Any], int]:
    """Backward-compatible single-subgraph rendering helper."""
    return render_subgraph_versions(config, {subgraph: version})


def _command_error(result: subprocess.CompletedProcess[str]) -> str:
    output = (result.stderr or result.stdout or "Goldsky command failed").strip()
    return output[-4000:]


def _run_goldsky(
    runner: CommandRunner,
    arguments: list[str],
    timeout: int,
) -> subprocess.CompletedProcess[str]:
    return runner(
        ["goldsky", *arguments],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def update_managed_pipelines(
    subgraph_versions: Mapping[str, str],
    *,
    apply: bool,
    config_dir: Path = DEFAULT_CONFIG_DIR,
    command_timeout: int = DEFAULT_COMMAND_TIMEOUT,
    runner: CommandRunner = subprocess.run,
) -> list[PipelineUpdateResult]:
    """Render and optionally apply pipelines related to deployed subgraphs.

    Every pipeline is isolated: a malformed config, timeout, or Goldsky error is
    returned as a failed result and does not prevent other pipelines from being
    attempted.
    """
    if not subgraph_versions:
        return []
    if not config_dir.exists():
        return []

    results: list[PipelineUpdateResult] = []
    for config_path in sorted((*config_dir.glob("*.yaml"), *config_dir.glob("*.yml"))):
        try:
            with config_path.open() as config_file:
                config = yaml.safe_load(config_file)
            if not isinstance(config, dict):
                raise ValueError("pipeline config must be a YAML object")

            pipeline = config.get("name")
            if not isinstance(pipeline, str) or not pipeline:
                raise ValueError("pipeline config is missing a non-empty 'name'")

            rendered, updated_references = render_subgraph_versions(config, subgraph_versions)
            if updated_references == 0:
                continue

            matched_subgraphs = sorted(
                {
                    reference.get("name")
                    for source in config.get("sources", {}).values()
                    if isinstance(source, dict) and isinstance(source.get("subgraphs"), list)
                    for reference in source["subgraphs"]
                    if isinstance(reference, dict) and reference.get("name") in subgraph_versions
                }
            )
            targets = ", ".join(f"{subgraph}/{subgraph_versions[subgraph]}" for subgraph in matched_subgraphs)

            if not apply:
                results.append(
                    PipelineUpdateResult(
                        pipeline=pipeline,
                        config_path=config_path,
                        status="planned",
                        message=f"would update {updated_references} source reference(s): {targets}",
                    )
                )
                continue

            # Applying a config can create a missing pipeline. Automatic updates
            # must only modify an existing pipeline, so guard against creation.
            existing = _run_goldsky(runner, ["pipeline", "get", pipeline, "--definition"], command_timeout)
            if existing.returncode != 0:
                results.append(
                    PipelineUpdateResult(
                        pipeline=pipeline,
                        config_path=config_path,
                        status="failed",
                        message=f"pipeline does not exist or could not be read: {_command_error(existing)}",
                    )
                )
                continue

            with tempfile.TemporaryDirectory(prefix="goldsky-pipeline-") as temp_dir:
                rendered_path = Path(temp_dir) / config_path.name
                with rendered_path.open("w") as rendered_file:
                    yaml.safe_dump(rendered, rendered_file, sort_keys=False)

                validation = _run_goldsky(runner, ["pipeline", "validate", str(rendered_path)], command_timeout)
                if validation.returncode != 0:
                    results.append(
                        PipelineUpdateResult(
                            pipeline=pipeline,
                            config_path=config_path,
                            status="failed",
                            message=f"rendered config failed validation: {_command_error(validation)}",
                        )
                    )
                    continue

                applied = _run_goldsky(
                    runner,
                    ["pipeline", "apply", str(rendered_path), "--from-snapshot", "new", "--force"],
                    command_timeout,
                )
                if applied.returncode != 0:
                    results.append(
                        PipelineUpdateResult(
                            pipeline=pipeline,
                            config_path=config_path,
                            status="failed",
                            message=f"pipeline apply failed: {_command_error(applied)}",
                        )
                    )
                    continue

            results.append(
                PipelineUpdateResult(
                    pipeline=pipeline,
                    config_path=config_path,
                    status="updated",
                    message=f"updated {updated_references} source reference(s): {targets}",
                )
            )
        except subprocess.TimeoutExpired as exc:
            pipeline_name = config_path.stem
            results.append(
                PipelineUpdateResult(
                    pipeline=pipeline_name,
                    config_path=config_path,
                    status="failed",
                    message=f"Goldsky command timed out after {exc.timeout}s; check the pipeline update status in Goldsky",
                )
            )
        except OSError as exc:
            results.append(
                PipelineUpdateResult(
                    pipeline=config_path.stem,
                    config_path=config_path,
                    status="failed",
                    message=f"pipeline update could not run: {exc}",
                )
            )
        except (ValueError, yaml.YAMLError) as exc:
            results.append(
                PipelineUpdateResult(
                    pipeline=config_path.stem,
                    config_path=config_path,
                    status="failed",
                    message=f"could not load pipeline config: {exc}",
                )
            )

    return results


def update_related_pipelines(
    subgraph: str,
    version: str,
    *,
    apply: bool,
    config_dir: Path = DEFAULT_CONFIG_DIR,
    command_timeout: int = DEFAULT_COMMAND_TIMEOUT,
    runner: CommandRunner = subprocess.run,
) -> list[PipelineUpdateResult]:
    """Backward-compatible single-subgraph pipeline update entry point."""
    return update_managed_pipelines(
        {subgraph: version},
        apply=apply,
        config_dir=config_dir,
        command_timeout=command_timeout,
        runner=runner,
    )


def print_results(results: list[PipelineUpdateResult]) -> None:
    if not results:
        print("No related managed pipelines found.")
        return
    for result in results:
        marker = "✓" if result.status == "updated" else "→" if result.status == "planned" else "⚠"
        print(f"  {marker} {result.pipeline}: {result.message}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Update Goldsky pipelines that consume deployed subgraphs.")
    parser.add_argument("--subgraph", help="Goldsky subgraph name (use with --version)")
    parser.add_argument("--version", help="Immutable Goldsky subgraph version (use with --subgraph)")
    parser.add_argument(
        "--subgraph-version",
        action="append",
        default=[],
        metavar="NAME=VERSION",
        help="Subgraph/version override; repeat to update a pipeline from a deployment batch",
    )
    parser.add_argument("--apply", action="store_true", help="Validate and apply updates; otherwise only show the plan")
    parser.add_argument("--config-dir", type=Path, default=DEFAULT_CONFIG_DIR, help="Directory containing pipeline YAML files")
    parser.add_argument("--command-timeout", type=int, default=DEFAULT_COMMAND_TIMEOUT, help="Timeout in seconds for each Goldsky command")
    args = parser.parse_args()

    if bool(args.subgraph) != bool(args.version):
        parser.error("--subgraph and --version must be provided together")

    subgraph_versions: dict[str, str] = {}
    if args.subgraph and args.version:
        subgraph_versions[args.subgraph] = args.version
    for value in args.subgraph_version:
        subgraph, separator, version = value.partition("=")
        if not separator or not subgraph.strip() or not version.strip():
            parser.error(f"invalid --subgraph-version {value!r}; expected NAME=VERSION")
        subgraph_versions[subgraph.strip()] = version.strip()
    if not subgraph_versions:
        parser.error("provide --subgraph with --version, or at least one --subgraph-version")

    results = update_managed_pipelines(
        subgraph_versions,
        apply=args.apply,
        config_dir=args.config_dir,
        command_timeout=args.command_timeout,
    )
    print_results(results)
    return 1 if any(result.failed for result in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
