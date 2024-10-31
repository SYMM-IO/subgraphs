import argparse
import subprocess


def main():
    configs = [
        # "./configs/fantom_just_8_0.json",
        # "./configs/base_just_8_0.json",
        # "./configs/bnb_just_8_0.json",
        # "./configs/bnb.json",
        # "./configs/base.json",
        # "./configs/blast.json",
        # "./configs/mantle.json",
        # "./configs/mode.json",
        # "./configs/arbitrum.json",
        # "./configs/iota.json"

        # "./configs/vaults/base.json",
        # "./configs/vaults/blast.json",
        # "./configs/vaults/bnb.json",
        # "./configs/vaults/mantle.json",

        # "./configs/timelocks/base.json",
        # "./configs/timelocks/arbitrum.json",
        # "./configs/timelocks/bnb.json",
        # "./configs/timelocks/mantle.json",
        # "./configs/timelocks/mode.json",
    ]

    parser = argparse.ArgumentParser(
        description='Run manager.py with specified action, version, and component on multiple configs.')
    parser.add_argument('--action', required=True, choices=['deploy', 'delete', 'add-latest-tag', 'delete-latest-tag'],
                        help='Action to perform')
    parser.add_argument('--version', required=True, help='Version number to use')
    parser.add_argument('--subgraph', required=True, help='Subgraph name (e.g., analytics)')

    args = parser.parse_args()

    for config in configs:
        cmd = [
            'python', 'scripts/manager.py',
            config,
            args.subgraph,
            args.version,
            f'--{args.action}'
        ]
        print('Executing:', ' '.join(cmd))
        subprocess.run(cmd, check=True)


if __name__ == '__main__':
    main()
