import json
import os
import shutil
import subprocess
import sys
from shutil import copyfile


def copy_abi_files(subgraph_dir, version):
    """
    Copy the ABI files for the provided version from the root 'abis' directory
    to the 'abis' directory inside the given subgraph directory.
    """
    root_abis_dir = "abis"
    subgraph_abis_dir = os.path.join(subgraph_dir, "abis")

    files_to_copy = [f"symmio_{version}.json", f"symmioMultiAccount_{version}.json"]

    for file_name in files_to_copy:
        source = os.path.join(root_abis_dir, file_name)
        destination_path = os.path.join(
            subgraph_abis_dir, file_name.replace(f"_{version}", "")
        )

        # Ensure destination directory exists
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)

        copyfile(source, destination_path)


def generate_subgraph_config(subgraph_dir, config_file):
    print(f"Deploying {subgraph_dir} with config {config_file}")

    os.chdir(subgraph_dir)

    # Prepare the subgraph
    subprocess.run(
        ["npx", "mustache", f'../{config_file}', "template.yaml"],
        check=True,
        stdout=open("subgraph.yaml", "w"),
    )


    os.chdir("..")


def main():
    if len(sys.argv) < 2:
        print(
            "Please provide the full path to the configuration file (e.g., configs/fix_review_test.json)"
        )
        sys.exit(1)

    config_file = sys.argv[1]

    # Check if the configuration file exists
    if not os.path.exists(config_file):
        print(f"Configuration file {config_file} does not exist!")
        sys.exit(1)

    # Load the configuration file
    with open(config_file, "r") as f:
        config = json.load(f)

    for subgraph in ["main", "parties", "fundingrate", "events"]:
        # Copy the ABI files to each subgraph directory
        copy_abi_files(subgraph, config["symmioVersion"])

        generate_subgraph_config(subgraph, config_file)

        print(f"{subgraph} subgraph deployed")

    print("Done")


if __name__ == "__main__":
    main()
