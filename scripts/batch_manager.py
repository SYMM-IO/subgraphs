import argparse
import os
import subprocess
import sys


# ANSI colors
class Style:
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"
    GREEN = "\033[32m"
    RED = "\033[31m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    CYAN = "\033[36m"


def main():
    configs = [
        # "./configs/perps/fantom_just_8_0.json",
        # "./configs/perps/base_just_8_0.json",
        # "./configs/perps/bnb_just_8_0.json",
        # "./configs/perps/bnb.json",
        # "./configs/perps/base.json",
        # "./configs/perps/blast.json",
        # "./configs/perps/mantle.json",
        # "./configs/perps/arbitrum.json",
        # "./configs/perps/bera.json",
        # "./configs/perps/sonic.json",
        "./configs/perps/base_lc_test.json",
        # "./configs/perps/base_test.json",
        # "./configs/perps/plasma.json",
        # "./configs/perps/hyperevm.json",
        # "./configs/perps/mode.json",
        # "./configs/perps/polygon.json",
        # "./configs/perps/iota.json",
        # "./configs/vaults/base.json",
        # "./configs/vaults/blast.json",
        # "./configs/vaults/bnb.json",
        # "./configs/vaults/mantle.json",
        # "./configs/timelocks/base.json",
        # "./configs/timelocks/arbitrum.json",
        # "./configs/timelocks/bnb.json",
        # "./configs/timelocks/mantle.json",
        # "./configs/timelocks/mode.json",
        # "./configs/timelocks/iota.json",
        # "./configs/timelocks/bera.json",
    ]

    parser = argparse.ArgumentParser(description="Run manager.py with specified action, version, and component on multiple configs.")
    parser.add_argument(
        "--action",
        required=True,
        choices=["deploy", "delete", "add-latest-tag", "delete-latest-tag", "add-stage-tag", "delete-stage-tag"],
        help="Action to perform",
    )
    parser.add_argument("--version", required=True, help="Version number to use")
    parser.add_argument("--subgraph", required=True, help="Subgraph name (e.g., analytics)")
    parser.add_argument("--provider", choices=["goldsky", "0xgraph"], default="goldsky", help="Deployment provider (default: goldsky)")

    args = parser.parse_args()

    total = len(configs)
    print(f"\n{Style.CYAN}{Style.BOLD}{'─' * 50}")
    print(f"  Batch {args.action}  ·  {args.subgraph}  ·  {args.version}  ·  {args.provider}")
    print(f"  {total} configs")
    print(f"{'─' * 50}{Style.RESET}\n")

    passed = []
    failed = []

    for i, config in enumerate(configs, 1):
        chain = os.path.splitext(os.path.basename(config))[0]
        print(f"{Style.BLUE}{Style.BOLD}[{i}/{total}]{Style.RESET} {chain}...")

        cmd = [
            "python3",
            "scripts/manager.py",
            config,
            args.subgraph,
            args.version,
            f"--{args.action}",
            "--provider",
            args.provider,
        ]
        result = subprocess.run(cmd)
        if result.returncode == 0:
            passed.append(chain)
            print(f"  {Style.GREEN}✓{Style.RESET} {chain}\n")
        else:
            failed.append(chain)
            print(f"  {Style.RED}✗{Style.RESET} {chain}\n")

    # Summary
    print(f"{'─' * 50}")
    if not failed:
        print(f"{Style.GREEN}{Style.BOLD}✓ {len(passed)}/{total} configs completed successfully{Style.RESET}")
    else:
        print(f"{Style.RED}{Style.BOLD}✗ {len(failed)}/{total} failed:{Style.RESET} {', '.join(failed)}")
        if passed:
            print(f"{Style.GREEN}{Style.BOLD}✓ {len(passed)}/{total} succeeded:{Style.RESET} {', '.join(passed)}")
    print()

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
