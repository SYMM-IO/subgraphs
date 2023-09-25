import json
import os
import subprocess
import sys


def deploy_subgraph(subgraph_dir, config_file, deploy_url):
    print(f"Deploying {subgraph_dir} to {deploy_url} with config {config_file}")

    # Adjust the path for the config file when inside a subgraph directory
    adjusted_config_path = os.path.join("..", config_file)

    # Set working directory to the specific subgraph's directory
    os.chdir(subgraph_dir)

    # Prepare the subgraph
    if subgraph_dir == "analytics":
        subprocess.run(["mustache", adjusted_config_path, "template.yaml"], check=True,
                       stdout=open("subgraph.yaml", "w"))
        subprocess.run(["mustache", adjusted_config_path, "src/contract_utils.template.ts"], check=True,
                       stdout=open("src/contract_utils.ts", "w"))
    else:
        subprocess.run(["mustache", adjusted_config_path, "template.yaml"], check=True,
                       stdout=open("subgraph.yaml", "w"))

    subprocess.run(["graph", "build"], check=True)

    # Deploy the subgraph
    subprocess.run(["graph", "deploy", "--product", "hosted-service", deploy_url], check=True)

    # Change directory back to the root directory
    os.chdir("..")


def main():
    if len(sys.argv) < 2:
        print("Please provide the full path to the configuration file (e.g., configs/fix_review_test.json)")
        sys.exit(1)

    config_file = sys.argv[1]

    # Check if the configuration file exists
    if not os.path.exists(config_file):
        print(f"Configuration file {config_file} does not exist!")
        sys.exit(1)

    # Load the configuration file
    with open(config_file, "r") as f:
        config = json.load(f)

    deploy_subgraph("analytics", config_file, config["analyticsDeployUrl"])
    deploy_subgraph("main", config_file, config["mainDeployUrl"])
    deploy_subgraph("parties", config_file, config["partiesDeployUrl"])

    print("All subgraphs have been prepared and deployed!")


if __name__ == "__main__":
    main()
