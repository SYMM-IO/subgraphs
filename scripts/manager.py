import argparse
import dataclasses
import json
import os
import re
import subprocess
import sys
from typing import List, Optional, Dict, Any

import yaml


class Contract:
    def __init__(self, address: str, abi: str, version: str, startBlock: str, endBlock: Optional[str] = None,
                 name: Optional[str] = None, events: List[Any] = None):
        self.address = address
        self.abi = abi
        self.version = version
        self.startBlock = startBlock
        self.endBlock = endBlock
        self.name = name
        self.events = events or []

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Contract':
        return cls(**data)

    def path(self) -> str:
        return f"{self.abi}_{self.version}"


class Config:
    def __init__(self, network: str, contracts: List[Contract], deploy_urls: Dict[str, str]):
        self.network = network
        self.contracts = contracts
        self.deploy_urls = deploy_urls

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Config':
        contracts = [Contract.from_dict(c) for c in data['contracts']]
        deploy_urls = data['deploy_urls']
        return cls(data['network'], contracts, deploy_urls)


@dataclasses.dataclass
class Event:
    source: str
    signature: str
    name: str


def json_to_yaml(json_data):
    return yaml.dump(json_data, default_flow_style=False)


def copy_abi_files(abi_path):
    root_abis_dir = "./configs/abis"
    subgraph_abis_dir = "./abis"

    source = os.path.join(root_abis_dir, abi_path)
    destination_path = os.path.join(subgraph_abis_dir, abi_path)

    os.makedirs(os.path.dirname(destination_path), exist_ok=True)

    if os.path.exists(source):
        with open(source, "r") as src_file, open(destination_path, "w") as dest_file:
            content = src_file.read()
            dest_file.write(content)
    else:
        raise Exception(f"Source ABI not found: {abi_path}")


def create_schema_file(target_module, target_config):
    common_models_dir = os.path.join("./common", "models")

    with open(os.path.join(target_module, "schema.graphql"), "r") as src_file, open(
            "./schema.graphql", "w"
    ) as dest_file:
        dest_file.write("# Imported Models\n")
        for model in os.listdir(common_models_dir):
            model_name = model.split(".")[0]
            if model_name in target_config["importModels"]:
                with open(os.path.join(common_models_dir, model), "r") as model_file:
                    dest_file.write("\n" + model_file.read())
        dest_file.write("#=======================\n\n")
        dest_file.write(src_file.read())


def generate_src_ts(target_module, contract: Contract):
    imports_code = ""
    handlers_code = ""
    for event in contract.events:
        source = event.source
        event_name = event.name
        handler_class_name = event_name + "Handler"

        imports_code += f"""
import {{{handler_class_name}}} from "./handlers/{contract.abi}/{handler_class_name}"
import {{{event_name}}} from "../generated/{source}/{source}"
"""

        handlers_code += f"""
export function handle{event_name}(event: {event_name}): void {{
    let handler = new {handler_class_name}<{event_name}>()
    handler.handle(event, Version.v_{contract.version})
}}
        """
    imports_code += "\n\n"
    with open(os.path.join(target_module, f"src_{contract.path()}.ts"), "w") as src_file:
        src_file.write(imports_code)
        src_file.write(f"import {{Version}} from \"../common/BaseHandler\"")
        src_file.write(handlers_code)


def create_handler_classes(target_module, contract: Contract):
    with open(os.path.join(target_module, "subgraph_config.json"), "r") as target_config_file:
        target_config = json.load(target_config_file)

    for event in contract.events:
        source = event["source"]
        event_name = event["name"]
        handler_class_name = event_name + "Handler"
        handler_file_name = handler_class_name + ".ts"
        handler_dir_path = os.path.join(target_module, "handlers")
        if not os.path.exists(handler_dir_path):
            os.makedirs(handler_dir_path)
        handler_file_path = os.path.join(handler_dir_path, handler_file_name)

        super_calls = []
        for model in target_config["importModels"]:
            super_calls.append(f"        super.handle{model}(\"{contract.version}\")")
        super_calls_str = "\n".join(super_calls)

        with open(handler_file_path, "w") as handler_file:
            handler_file.write(
                f"""
import {{{handler_class_name} as Common{handler_class_name}}} from "../../common/handlers/{handler_file_name[:-3]}"
import {{{event_name}}} from "../../generated/{source}/{source}"

export class {handler_class_name} extends Common{handler_class_name} {{

    handle(_event: ethereum.Event, version: Version): void {{
        super.handle(_event, version)
{super_calls_str}
    }}
}}
"""
            )


def get_scheme_models():
    with open("./schema.graphql", "r") as schema_file:
        schema_content = schema_file.read()
    pattern = re.compile(r"\btype\s+(\w+)(\s+@\w+)?\s*{", re.MULTILINE)
    return [match[0] for match in pattern.findall(schema_content)]


def get_needed_events_for(models, target_module, contract: Contract):
    try:
        with open(os.path.join("./common", f"deps_{contract.path()}.json"), "r") as deps_file:
            common_dependencies = json.load(deps_file)
    except Exception as _:
        print(f"Dependencies file for common for {contract.path()} not found")
        common_dependencies = []

    try:
        with open(os.path.join(target_module, f"deps_{contract.path()}.json"), "r") as deps_file:
            target_dependencies = json.load(deps_file)
    except Exception as _:
        print(f"Dependencies file for {target_module} for {contract.path()} not found")
        target_dependencies = []

    events = []
    for model in models:
        if model in common_dependencies:
            events += common_dependencies[model]
        if model in target_dependencies:
            events += target_dependencies[model]
    return list(set(events))


def get_event_signature(event_name, abi_file_path):
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            input_types = [
                ("indexed " if input["indexed"] else "") + input["type"]
                for input in entry["inputs"]
            ]
            event_signature = f"{event_name}({','.join(input_types)})"
            return event_signature
    return None


def get_events_with_signatures(needed_events, contract: Contract) -> List[Event]:
    events = []
    source = contract.path()
    abi_file = f"./configs/abis/{source}.json"
    for event in needed_events:
        sig = get_event_signature(event, abi_file)
        events.append(Event(source=source, name=event, signature=sig))
    return events


def prepare_module(config: Config, target_module: str):
    with open(os.path.join(target_module, "subgraph_config.json"), "r") as target_config_file:
        target_config = json.load(target_config_file)

    create_schema_file(target_module, target_config)
    models = get_scheme_models()

    events_debts = []
    for contract in config.contracts:
        needed_events = get_needed_events_for(models, target_module, contract) + events_debts
        events = get_events_with_signatures(needed_events, contract)
        for e in events:
            if e.signature is None:
                events_debts.append(e.name)
        contract.events = list({(e.name, e.signature): e for e in events if e.signature is not None}.values())

    subgraph_config = {
        "specVersion": "0.0.4",
        "description": f"{target_module} Subgraph of SYMMIO",
        "schema": {
            "file": "./schema.graphql"
        },
        "indexerHints": {
            "prune": "auto"
        },
        "dataSources": []
    }

    for contract in config.contracts:
        if len(contract.events) == 0:
            continue
        source_config = {
            "kind": "ethereum/contract",
            "name": contract.path(),
            "network": config.network,
            "source": {
                "address": contract.address,
                "abi": contract.path(),
                "startBlock": int(contract.startBlock)
            },
            "mapping": {
                "kind": "ethereum/events",
                "apiVersion": "0.0.6",
                "language": "wasm/assemblyscript",
                "entities": ["Account"],
                "abis": [{
                    "name": contract.path(),
                    "file": f"./abis/{contract.path()}.json"
                }],
                "eventHandlers": [{
                    "event": event.signature,
                    "handler": f"handle{event.name}"
                } for event in contract.events],
                "file": f"./{target_module}/src_{contract.path()}.ts"
            }
        }
        if contract.endBlock:
            source_config["source"]["endBlock"] = int(contract.endBlock)
        if contract.name:
            source_config["name"] += f"_{contract.name}"

        subgraph_config["dataSources"].append(source_config)

    yaml_content = json_to_yaml(subgraph_config)
    with open("./subgraph.yaml", "w") as yaml_file:
        yaml_file.write(yaml_content)


def main():
    parser = argparse.ArgumentParser(description="Module preparation script.")
    parser.add_argument("config_file", type=str, help="Configuration file path")
    parser.add_argument("module_name", type=str, help="Target module name")
    parser.add_argument(
        "--create-src", action="store_true", help="Create the src_symmio_0_8_2.ts file"
    )
    parser.add_argument(
        "--create-handlers", action="store_true", help="Create the handler files"
    )
    parser.add_argument(
        "--deploy", action="store_true", help="Deploy the module"
    )
    parser.add_argument(
        "--mantle", action="store_true", help="Deployment is on mantle or not"
    )

    args = parser.parse_args()
    if not os.path.exists(args.config_file):
        print(f"Configuration file {args.config_file} does not exist!")
        sys.exit(1)

    with open(args.config_file, "r") as f:
        config_data = json.load(f)
    config = Config.from_dict(config_data)

    prepare_module(config, args.module_name)

    if args.create_src:
        for contract in config.contracts:
            if len(contract.events) > 0:
                generate_src_ts(args.module_name, contract)

    if args.create_handlers:
        for contract in config.contracts:
            create_handler_classes(args.module_name, contract)

    for abi_path in set(f'{c.path()}.json' for c in config.contracts):
        copy_abi_files(abi_path)

    subprocess.run(["graph", "codegen"], check=True)
    subprocess.run(["graph", "build"], check=True)

    if args.deploy:
        deploy_url = config.deploy_urls[args.module_name]
        if args.mantle:
            subprocess.run(["graph", "deploy", deploy_url, "--node", "https://subgraph-api.mantle.xyz/deploy",
                            "--ipfs", "https://subgraph-api.mantle.xyz/ipfs"], check=True)
        else:
            subprocess.run(["graph", "deploy", "--studio", deploy_url], check=True)


if __name__ == "__main__":
    main()
