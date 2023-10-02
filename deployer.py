import json
import os
import shutil
import subprocess
import sys


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

        # Copy content from source to destination
        with open(source, 'r') as src_file, open(destination_path, 'w') as dest_file:
            content = src_file.read()
            print(f"Writing {src_file.name} to {dest_file.name}")
            dest_file.write(content)


def deploy_subgraph(subgraph_dir, config_file, deploy_url, prepare_only):
    print(f"Deploying {subgraph_dir} to {deploy_url} with config {config_file}")

    # Adjust the path for the config file when inside a subgraph directory
    adjusted_config_path = os.path.join("..", config_file)

    # Set working directory to the specific subgraph's directory
    os.chdir(subgraph_dir)

    # Prepare the subgraph
    if subgraph_dir == "analytics":
        subprocess.run(
            ["mustache", adjusted_config_path, "template.yaml"],
            check=True,
            stdout=open("subgraph.yaml", "w"),
        )
        subprocess.run(
            ["mustache", adjusted_config_path, "src/contract_utils.template.ts"],
            check=True,
            stdout=open("src/contract_utils.ts", "w"),
        )
    else:
        subprocess.run(
            ["mustache", adjusted_config_path, "template.yaml"],
            check=True,
            stdout=open("subgraph.yaml", "w"),
        )

    subprocess.run(["graph", "codegen"], check=True)
    subprocess.run(["graph", "build"], check=True)

    if not prepare_only:
        subprocess.run(
            ["graph", "deploy", "--product", "hosted-service", deploy_url], check=True
        )

    # Change directory back to the root directory
    os.chdir("..")


def main():
    prepare_only = "--prepare-only" in sys.argv

    if prepare_only:
        sys.argv.remove("--prepare-only")

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

    for subgraph in ["analytics", "main", "parties"]:
        # Copy the ABI files to each subgraph directory
        copy_abi_files(subgraph, config["symmioVersion"])

        deploy_subgraph(subgraph, config_file, config[f"{subgraph}DeployUrl"], prepare_only)

        print(f"{subgraph} subgraph deployed")

    print("Done")


if __name__ == "__main__":
    main()
