import argparse
import json
import os
import re
import subprocess
import sys
from typing import List


def copy_abi_files(version):
    """
    Copy the ABI files for the provided version from the root 'abis' directory
    to the 'abis' directory inside the given subgraph directory.
    """
    root_abis_dir = "../abis"
    subgraph_abis_dir = "abis"

    files_to_copy = [f"symmio_{version}.json", f"symmioMultiAccount_{version}.json"]

    for file_name in files_to_copy:
        source = os.path.join(root_abis_dir, file_name)
        destination_path = os.path.join(
            subgraph_abis_dir, file_name.replace(f"_{version}", "")
        )

        # Ensure destination directory exists
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)

        # Copy content from source to destination
        with open(source, "r") as src_file, open(destination_path, "w") as dest_file:
            content = src_file.read()
            dest_file.write(content)


def create_schema_file(target_module, target_config):
    common_models_dir = os.path.join("common", "models")

    with open(os.path.join(target_module, "schema.graphql"), "r") as src_file, open(
        "schema.graphql", "w"
    ) as dest_file:
        dest_file.write("# Imported Models\n")
        for model in os.listdir(common_models_dir):
            model_name = model.split(".")[0]
            if model_name in target_config["importModels"]:
                with open(os.path.join(common_models_dir, model), "r") as model_file:
                    dest_file.write("\n" + model_file.read())
        dest_file.write("#=======================\n\n")
        dest_file.write(src_file.read())


def generate_src_ts(target_module, events):
    imports_code = ""
    handlers_code = ""
    for event in events:
        source = event["source"]
        event = event["name"]
        handler_class_name = event + "Handler"
        imports_code += f"""
import {{{handler_class_name}}} from "./handlers/{handler_class_name}"
import {{{event}}} from "../generated/{source}"
		"""

        handlers_code += f"""
export function handle{event}(event: {event}): void {{
	let handler = new {handler_class_name}(event)
	handler.handle()
}}
		"""
    with open(os.path.join(target_module, "src.ts"), "w") as src_file:
        src_file.write(imports_code)
        src_file.write(handlers_code)


def create_handler_classes(target_module, events):
    # Create handler classes if they don't already exist in the target module
    for event in events:
        source = event["source"]
        event = event["name"]
        handler_class_name = event + "Handler"
        handler_file_name = handler_class_name + ".ts"
        handler_dir_path = os.path.join(target_module, "handlers")
        if not os.path.exists(handler_dir_path):
            os.makedirs(handler_dir_path)
        handler_file_path = os.path.join(handler_dir_path, handler_file_name)
        with open(handler_file_path, "w") as handler_file:
            handler_file.write(
                f"""
import {{{handler_class_name} as Common{handler_class_name}}} from "../../common/handlers/{handler_file_name[:-3]}"
import {{{event}}} from "../../generated/{source}"

export class {handler_class_name} extends Common{handler_class_name} {{

    constructor(event: {event}) {{
        super(event)
    }}

    handle(): void {{
		super.handle()
    }}
}}
"""
            )


def get_scheme_models():
    with open("schema.graphql", "r") as schema_file:
        schema_content = schema_file.read()
    pattern = re.compile(r"\btype\s+(\w+)(\s+@\w+)?\s*{", re.MULTILINE)
    return [match[0] for match in pattern.findall(schema_content)]


def get_needed_events_for(models: List[str], common_dependencies, target_dependencies):
    events = []
    for model in models:
        if model in common_dependencies:
            events += common_dependencies[model]
        if model in target_dependencies:
            events += target_dependencies[model]
    return list(set(events))


def get_event_signature(event_name, abi_file_path):
    # Load the ABI from the specified file
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    # Iterate over the ABI entries to find the event
    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            # Extract the input types for the event
            input_types = [input["type"] for input in entry["inputs"]]
            # Construct the full event signature
            event_signature = f"{event_name}({','.join(input_types)})"
            return event_signature
    return None


def get_events_with_signatures(needed_events):
    symmio_events = []
    for event in needed_events:
        sig = get_event_signature(
            event, f"../abis/symmio_{config['symmioVersion']}.json"
        )
        if sig:
            symmio_events.append(
                {"source": "symmio/symmio", "name": event, "signature": sig}
            )
    multi_account_events = []
    for event in needed_events:
        sig = get_event_signature(
            event, f"../abis/symmioMultiAccount_{config['symmioVersion']}.json"
        )
        if sig:
            multi_account_events.append(
                {
                    "source": "symmioMultiAccount_0/symmioMultiAccount",
                    "name": event,
                    "signature": sig,
                }
            )
    return symmio_events, multi_account_events


def prepare_module(
    config, target_module, create_src_file: bool, create_handler_files: bool
):
    with open(os.path.join("common", "dependencies.json"), "r") as dependencies_file:
        common_dependencies = json.load(dependencies_file)

    with open(
        os.path.join(target_module, "dependencies.json"), "r"
    ) as dependencies_file:
        target_dependencies = json.load(dependencies_file)

    with open(
        os.path.join(target_module, "subgraph_config.json"), "r"
    ) as target_config_file:
        target_config = json.load(target_config_file)

    create_schema_file(target_module, target_config)
    models = get_scheme_models()
    needed_events = get_needed_events_for(
        models, common_dependencies, target_dependencies
    )
    symmio_events, multi_account_events = get_events_with_signatures(needed_events)
    i = 0
    for ma in config["multiAccounts"]:
        ma["index"] = i
        i += 1
    config.update(
        {
            "symmioEvents": symmio_events,
            "multiAccountEvents": multi_account_events,
            "subgraphName": target_module,
            "includeMultiAccount": len(multi_account_events) > 0,
        }
    )
    with open("UniConfig.json", "w") as output_file:
        json.dump(config, output_file, indent=4)

    # build subgraph.yaml
    subprocess.run(
        ["npx", "mustache", "UniConfig.json", "template.yaml"],
        check=True,
        stdout=open("subgraph.yaml", "w"),
    )
    if create_src_file:
        generate_src_ts(target_module, symmio_events + multi_account_events)
    if create_handler_files:
        create_handler_classes(target_module, symmio_events + multi_account_events)

    copy_abi_files(config["symmioVersion"])

    subprocess.run(["graph", "codegen"], check=True)
    subprocess.run(["graph", "build"], check=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Module preparation script.")
    parser.add_argument("config_file", type=str, help="Configuration file path")
    parser.add_argument("module_name", type=str, help="Target module name")
    parser.add_argument(
        "--create-src", action="store_true", help="Create the src.ts file"
    )
    parser.add_argument(
        "--create-handlers", action="store_true", help="Create the handler files"
    )

    args = parser.parse_args()

    # Check if the configuration file exists
    if not os.path.exists(args.config_file):
        print(f"Configuration file {args.config_file} does not exist!")
        sys.exit(1)

    # Load the configuration file
    with open(args.config_file, "r") as f:
        config = json.load(f)

    prepare_module(config, args.module_name, args.create_src, args.create_handlers)
