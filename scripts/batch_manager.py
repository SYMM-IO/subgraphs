import argparse
import subprocess


def main():
    configs = [
        # "./configs/perps/fantom_just_8_0.json",
        # "./configs/perps/base_just_8_0.json",
        # "./configs/perps/bnb_just_8_0.json",
        # "./configs/perps/bnb.json",
        # "./configs/perps/base.json",
        # "./configs/perps/blast.json",
        # "./configs/perps/mantle.json",
        # "./configs/perps/mode.json",
        # "./configs/perps/arbitrum.json",
        # "./configs/perps/iota.json",
        # "./configs/perps/polygon.json",
        # "./configs/perps/bera.json",
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
        choices=["deploy", "delete", "add-latest-tag", "delete-latest-tag"],
        help="Action to perform",
    )
    parser.add_argument("--version", required=True, help="Version number to use")
    parser.add_argument("--subgraph", required=True, help="Subgraph name (e.g., analytics)")

    args = parser.parse_args()

    for config in configs:
        cmd = [
            "python",
            "scripts/manager.py",
            config,
            args.subgraph,
            args.version,
            f"--{args.action}",
        ]
        print("Executing:", " ".join(cmd))
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
