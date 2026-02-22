import argparse
import re
import subprocess
import time
from datetime import datetime


SUBGRAPHS = [
    # (chain, subgraph_name)
    ("bnb", "bnb_analytics"),
    ("bnb", "bnb_events"),
    ("base", "base_analytics"),
    ("base", "base_events"),
    ("blast", "blast_analytics"),
    ("blast", "blast_events"),
    ("mantle", "mantle_analytics"),
    ("mantle", "mantle_events"),
    ("arbitrum", "arbitrum_analytics"),
    ("arbitrum", "arbitrum_events"),
    ("bera", "bera_analytics"),
    ("bera", "bera_events"),
    ("sonic", "sonic_analytics"),
    ("sonic", "sonic_events"),
    ("plasma", "plasma_analytics"),
    ("plasma", "plasma_events"),
    ("base_lc", "base_lc_analytics"),
    ("base_lc", "base_lc_events"),
    ("base_lc_test", "base_lc_test_analytics"),
    ("base_lc_test", "base_lc_test_events"),
]


def parse_subgraph_list(output):
    """Parse `goldsky subgraph list` output into a dict keyed by name/version."""
    results = {}
    current = None

    for line in output.splitlines():
        line = line.strip()

        # Entry line: "* name/version" or "* name/tag -> name/version"
        if line.startswith("* "):
            parts = line[2:].strip()
            # Handle tag aliases like "base_analytics/latest -> base_analytics/0.0.70"
            if " -> " in parts:
                tag_part, target = parts.split(" -> ", 1)
                name_version = tag_part
            else:
                name_version = parts
                target = None

            slash_idx = name_version.find("/")
            if slash_idx != -1:
                name = name_version[:slash_idx]
                version = name_version[slash_idx + 1:]
            else:
                name = name_version
                version = "?"

            current = {
                "name": name,
                "version": version,
                "tag_target": target,
                "status": "unknown",
                "synced": "?",
                "blocks": "",
                "chain": "",
                "created": "",
                "endpoint": "",
            }
            key = f"{name}/{version}"
            results[key] = current

        elif current:
            if line.startswith("Status:"):
                current["status"] = line.split("Status:", 1)[1].strip()
            elif line.startswith("Synced:"):
                current["synced"] = line.split("Synced:", 1)[1].strip()
            elif line.startswith("Blocks indexed:"):
                current["blocks"] = line.split("Blocks indexed:", 1)[1].strip()
            elif line.startswith("Chain:"):
                current["chain"] = line.split("Chain:", 1)[1].strip()
            elif line.startswith("Created:"):
                current["created"] = line.split("Created:", 1)[1].strip()
            elif line.startswith("GraphQL API:"):
                current["endpoint"] = line.split("GraphQL API:", 1)[1].strip()

    return results


def fetch_all():
    """Run goldsky subgraph list and parse results."""
    try:
        result = subprocess.run(
            ["goldsky", "subgraph", "list"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return parse_subgraph_list(result.stdout + result.stderr)
    except Exception as e:
        print(f"  Failed to run goldsky CLI: {e}")
        return {}


def check_all(version, filter_chain=None):
    subgraphs = SUBGRAPHS
    if filter_chain:
        subgraphs = [(c, n) for c, n in subgraphs if c in filter_chain]

    all_data = fetch_all()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n{'=' * 86}")
    print(f"  Subgraph Monitor — {now_str}  (version: {version})")
    print(f"{'=' * 86}")
    print(f"  {'STATUS':<8}  {'SUBGRAPH':<30}  {'SYNCED':>8}  {'BLOCKS':>28}")
    print(f"  {'—' * 8}  {'—' * 30}  {'—' * 8}  {'—' * 28}")

    issues = []
    for chain, name in subgraphs:
        key = f"{name}/{version}"
        info = all_data.get(key)

        if not info:
            print(f"  {'MISSING':<8}  {name:<30}  {'—':>8}  {'not found':>28}")
            issues.append((name, "not deployed"))
            continue

        status_raw = info["status"]
        synced = info["synced"]
        blocks = info["blocks"]

        # Determine display status
        is_healthy = "healthy" in status_raw.lower()
        is_error = "error" in status_raw.lower() or "fail" in status_raw.lower()
        synced_pct = 0.0
        match = re.search(r"([\d.]+)%", synced)
        if match:
            synced_pct = float(match.group(1))

        if is_error:
            icon = "ERROR"
        elif synced_pct >= 100:
            icon = "  OK"
        elif synced_pct >= 50:
            icon = "SYNC.."
        else:
            icon = "SYNC.."

        if not is_healthy:
            icon = "WARN"

        print(f"  {icon:<8}  {name:<30}  {synced:>8}  {blocks:>28}")

        if is_error:
            issues.append((name, status_raw))
        elif synced_pct < 100 and synced_pct > 0:
            issues.append((name, f"syncing ({synced})"))

    print(f"{'=' * 86}")
    fully_synced = len(subgraphs) - len(issues)
    if issues:
        print(f"  {fully_synced}/{len(subgraphs)} fully synced, {len(issues)} issue(s):")
        for name, issue in issues:
            print(f"    - {name}: {issue}")
    else:
        print(f"  All {len(subgraphs)} subgraphs healthy and synced.")
    print()


def main():
    parser = argparse.ArgumentParser(description="Monitor Goldsky subgraph sync status and errors.")
    parser.add_argument("--version", default="latest", help="Subgraph version/tag to check (default: latest)")
    parser.add_argument("--chain", nargs="*", help="Filter by chain(s), e.g. --chain base bnb")
    parser.add_argument("--watch", type=int, metavar="SECONDS", help="Re-check every N seconds")
    args = parser.parse_args()

    if args.watch:
        try:
            while True:
                check_all(args.version, args.chain)
                print(f"  Next check in {args.watch}s... (Ctrl+C to stop)\n")
                time.sleep(args.watch)
        except KeyboardInterrupt:
            print("\nStopped.")
    else:
        check_all(args.version, args.chain)


if __name__ == "__main__":
    main()
