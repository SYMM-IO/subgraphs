import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import yaml


@dataclass
class Event:
    source: str
    signature: str
    name: str
    numbered_name: str
    handler_name: str


@dataclass
class Contract:
    address: str
    abi: str
    version: str
    startBlock: str
    fake: bool
    endBlock: Optional[str] = None
    name: Optional[str] = None
    events: List[Event] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)

    def path(self) -> str:
        return f"{self.abi}_{self.version}"


@dataclass
class Config:
    network: str
    contracts: List[Contract]
    deploy_urls: Dict[str, str]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Config":
        contracts = [Contract(**c, fake=False) for c in data["contracts"]]
        return cls(data["network"], contracts, data["deploy_urls"])


abi_versions = {
    "symmio": ["0_8_0", "0_8_1", "0_8_2", "0_8_3"],
    "symmioMultiAccount": ["1"],
    "off_chain_vault": ["1"],
    "on_chain_vault": ["1"],
}


def json_to_yaml(json_data):
    return yaml.dump(json_data, default_flow_style=False)


def copy_abi_files(abi_path: str):
    root_abis_dir = "./configs/abis"
    subgraph_abis_dir = "./abis"

    source = os.path.join(root_abis_dir, abi_path)
    destination_path = os.path.join(subgraph_abis_dir, abi_path)

    os.makedirs(os.path.dirname(destination_path), exist_ok=True)

    if os.path.exists(source):
        shutil.copyfile(source, destination_path)
    else:
        raise FileNotFoundError(f"Source ABI not found: {source}")


def create_schema_file(target_module: str, target_config: Dict[str, Any]):
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


def generate_src_ts(target_module: str, contract: Contract):
    imports = set()
    handlers_code = []

    # Sort events by name
    sorted_events = sorted(contract.events, key=lambda e: e.name)

    for event in sorted_events:
        imports.add(
            f"import {{{event.name}Handler}} from './handlers/{contract.abi}/{event.name}Handler'"
        )
        imports.add(
            f"import {{{event.numbered_name}}} from '../generated/{event.source}/{event.source}'"
        )
        handlers_code.append(
            textwrap.dedent(
                f"""
                export function {event.handler_name}(event: {event.numbered_name}): void {{
                    let handler = new {event.name}Handler<{event.numbered_name}>()
                    handler.handle(event, Version.v_{contract.version})
                }}
                """
            )
        )

    imports.add("import {Version} from '../common/BaseHandler'")

    with open(
            os.path.join(target_module, f"src_{contract.path()}.ts"), "w"
    ) as src_file:
        src_file.write("\n".join(sorted(imports)))
        src_file.write("\n\n")
        src_file.write("\n".join(handlers_code))


def get_event_inputs(event_name: str, abi_file_path: str) -> List[Dict[str, Any]]:
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            return entry["inputs"]
    return []


def generate_handler_files(
        target_module: str, contract: Contract, simple_mapping: bool = False
):
    for event in contract.events:
        handler_dir = os.path.join(target_module, "handlers", contract.abi)
        os.makedirs(handler_dir, exist_ok=True)
        handler_file_path = os.path.join(handler_dir, f"{event.name}Handler.ts")

        content = generate_handler_content(event, contract, simple_mapping)

        with open(handler_file_path, "w") as handler_file:
            handler_file.write(content)


def generate_handler_content(event, contract: Contract, simple_mapping: bool) -> str:
    if simple_mapping:
        return generate_simple_mapping_content(event, contract)
    else:
        return generate_default_content(event, contract)


def generate_simple_mapping_content(event, contract: Contract) -> str:
    content = f"""
import {{ {event.name} as {event.name}Entity }} from "../../../generated/schema";
import {{ {event.name}Handler as Common{event.name}Handler }} from "../../../common/handlers/{contract.abi}/{event.name}Handler"
import {{ethereum}} from "@graphprotocol/graph-ts";
import {{Version}} from "../../../common/BaseHandler";

export class {event.name}Handler<T> extends Common{event.name}Handler<T> {{
    handle(_event: ethereum.Event, version: Version): void {{
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

        let entity = new {event.name}Entity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
"""

    for input in get_event_inputs(event.name, f"./abis/{contract.path()}.json"):
        content += f"        entity.{input['name']} = event.params.{input['name']};\n"

    content += """
        entity.blockTimestamp = event.block.timestamp;
        entity.transactionHash = event.transaction.hash;
        entity.save();
    }
}
"""
    return textwrap.dedent(content)


def generate_default_content(event, contract: Contract) -> str:
    return textwrap.dedent(
        f"""
        import {{ {event.name}Handler as Common{event.name}Handler }} from "../../../common/handlers/{contract.abi}/{event.name}Handler"
        import {{ethereum}} from "@graphprotocol/graph-ts";
        import {{Version}} from "../../../common/BaseHandler";

        export class {event.name}Handler<T> extends Common{event.name}Handler<T> {{
            handle(_event: ethereum.Event, version: Version): void {{
                // @ts-ignore
                const event = changetype<T>(_event)
                super.handle(_event, version)

            }}
        }}
    """
    )


def get_scheme_models():
    with open("./schema.graphql", "r") as schema_file:
        schema_content = schema_file.read()
    pattern = re.compile(
        r"\btype\s+(\w+)((?:\s+@\w+(?:\([^)]*\))?)*)\s*{", re.MULTILINE
    )
    return [match[0] for match in pattern.findall(schema_content)]


def load_dependencies(file_path: str) -> Dict[str, List[str]]:
    try:
        with open(file_path, "r") as deps_file:
            return json.load(deps_file)
    except FileNotFoundError:
        print(f"Dependencies file not found: {file_path}")
        return {}


def get_needed_events_for(
        models: List[str], target_module: str, contract: Contract
) -> List[str]:
    common_dependencies = load_dependencies(
        os.path.join("./common", f"deps_{contract.path()}.json")
    )
    target_dependencies = load_dependencies(
        os.path.join(target_module, f"deps_{contract.path()}.json")
    )

    events = []
    for model in models:
        events.extend(common_dependencies.get(model, []))
        events.extend(target_dependencies.get(model, []))
    return list(set(events))


def get_event_signature(event_name: str, abi_file_path: str) -> List[str]:
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    signatures = []
    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            inputs = [
                ("indexed " if input["indexed"] else "") + input["type"]
                for input in entry["inputs"]
            ]
            signature = f"{entry['name']}({','.join(inputs)})"
            signatures.append(signature)
    return signatures


def get_events_with_signatures(
        needed_events: List[str], contract: Contract
) -> List[Event]:
    events = []
    source = contract.path()
    abi_file = f"./configs/abis/{source}.json"
    for event in needed_events:
        sigs = get_event_signature(event, abi_file)
        for sig in sigs:
            events.append(
                Event(
                    source=source,
                    name=event,
                    signature=sig,
                    handler_name=(
                        f"handle{event}" if not contract.fake else "handleIgnoredEvent"
                    ),
                    numbered_name=event,
                )
            )
    return events


def prepare_module(config: Config, target_module: str):
    with open(
            os.path.join(target_module, "subgraph_config.json"), "r"
    ) as target_config_file:
        target_config = json.load(target_config_file)

    create_schema_file(target_module, target_config)
    models = get_scheme_models()

    # First pass: Collect all needed events across all contracts
    all_needed_events = set()
    for contract in config.contracts:
        needed_events = set(get_needed_events_for(models, target_module, contract))
        all_needed_events.update(needed_events)

    # Create a set of all unique ABIs
    unique_abis = set(contract.abi for contract in config.contracts)

    # Create a list to store all contracts, including the new versions
    all_contracts = []

    # Second pass: Process events for each contract and add missing versions
    for abi in unique_abis:
        versions = abi_versions[abi]
        max_start_block = max(
            int(c.startBlock) for c in config.contracts if c.abi == abi
        )

        for version in versions:
            existing_contracts = [
                c for c in config.contracts if c.abi == abi and c.version == version
            ]
            if existing_contracts:
                all_contracts.extend(existing_contracts)
            else:
                new_contract = Contract(
                    fake=True,
                    address=next(c.address for c in config.contracts if c.abi == abi),
                    abi=abi,
                    version=version,
                    startBlock=str(max_start_block),
                    endBlock=str(max_start_block),
                    name=next(
                        (c.name for c in config.contracts if c.abi == abi and c.name),
                        None,
                    ),
                )
                all_contracts.append(new_contract)

    # Process events for all contracts
    for contract in all_contracts:
        events = get_events_with_signatures(list(all_needed_events), contract)

        event_counter = {}
        for e in events:
            if e.signature is None:
                continue  # Skip events without signatures
            event_counter[e.name] = event_counter.get(e.name, 0) + 1
            if event_counter[e.name] > 1:
                e.handler_name = f"handle{e.name}{event_counter[e.name] - 1}"
                e.numbered_name = f"{e.name}{event_counter[e.name] - 1}"
        contract.events = events

    subgraph_config = {
        "specVersion": "1.2.0",
        "description": f"{target_module} Subgraph of SYMMIO",
        "schema": {"file": "./schema.graphql"},
        "indexerHints": {"prune": "never"},
        "dataSources": [],
    }
    contract_indexes = defaultdict(int)
    for contract in all_contracts:
        if not contract.events:
            continue
        copy_abi_files(f"{contract.path()}.json")
        contract_events = contract.events
        if contract.fake:
            contract_events = [contract.events[0]]
        source_config = {
            "kind": "ethereum/contract",
            "name": contract.path(),
            "network": config.network,
            "source": {
                "address": contract.address,
                "abi": contract.path(),
                "startBlock": int(contract.startBlock),
            },
            "mapping": {
                "kind": "ethereum/events",
                "apiVersion": "0.0.6",
                "language": "wasm/assemblyscript",
                "entities": ["Account"],
                "abis": [
                    {"name": contract.path(), "file": f"./abis/{contract.path()}.json"}
                ],
                "eventHandlers": [
                    {"event": event.signature, "handler": event.handler_name}
                    for event in contract_events
                ],
                "file": f"./{target_module}/src_{contract.path() if not contract.fake else 'fake'}.ts",
            },
        }
        if contract.endBlock:
            source_config["source"]["endBlock"] = int(contract.endBlock)

        if len(contract.dependencies) > 0:
            source_config["mapping"]["abis"] += [{"name": dep, "file": f"./abis/{dep}.json"} for dep in
                                                 contract.dependencies]

        contract_indexes[(contract.abi, contract.version)] += 1

        if contract_indexes[(contract.abi, contract.version)] > 1:
            source_config[
                "name"
            ] += f"_{contract_indexes[(contract.abi, contract.version)]}"

        subgraph_config["dataSources"].append(source_config)

    yaml_content = json_to_yaml(subgraph_config)
    with open("./subgraph.yaml", "w") as yaml_file:
        yaml_file.write(yaml_content)


def main():
    parser = argparse.ArgumentParser(description="Module preparation script.")
    parser.add_argument("config_file", type=str, help="Configuration file path")
    parser.add_argument("module_name", type=str, help="Target module name")
    parser.add_argument("version", type=str, nargs='?', help="Deployment version")
    parser.add_argument("--create-src", action="store_true", help="Create the src file")
    parser.add_argument(
        "--create-handlers", action="store_true", help="Create the handler files"
    )
    parser.add_argument(
        "--simple-mapping", action="store_true", help="Generate simple handler mappings"
    )
    parser.add_argument("--deploy", action="store_true", help="Deploy the subgraph")
    parser.add_argument("--delete", action="store_true", help="Delete the subgraph")
    parser.add_argument("--add-latest-tag", action="store_true", help="Add 'latest' tag to the subgraph")
    parser.add_argument("--delete-latest-tag", action="store_true", help="Delete 'latest' tag from the subgraph")

    args = parser.parse_args()
    if not os.path.exists(args.config_file):
        print(f"Configuration file {args.config_file} does not exist!")
        sys.exit(1)

    subprocess.run(["./scripts/clean.sh"], check=True)

    with open(args.config_file, "r") as f:
        config_data = json.load(f)
    config = Config.from_dict(config_data)

    if not args.add_latest_tag and not args.delete_latest_tag and not args.delete:
        prepare_module(config, args.module_name)

    if args.create_src:
        for contract in config.contracts:
            if contract.events:
                generate_src_ts(args.module_name, contract)

    if args.create_handlers:
        for contract in config.contracts:
            generate_handler_files(args.module_name, contract, args.simple_mapping)

    if not args.add_latest_tag and not args.delete_latest_tag and not args.delete:
        subprocess.run(["graph", "codegen"], check=True)
        subprocess.run(["graph", "build"], check=True)

    if args.deploy:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        deploy_url = config.deploy_urls[args.module_name]
        command = ["goldsky", "subgraph", "deploy", f"{deploy_url}/{args.version}", "--path", "build"]
        subprocess.run(command, check=True)

    if args.delete:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        deploy_url = config.deploy_urls[args.module_name]
        command = ["goldsky", "subgraph", "delete", f"{deploy_url}/{args.version}"]
        subprocess.run(command, check=True)

    if args.add_latest_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        deploy_url = config.deploy_urls[args.module_name]
        command = ["goldsky", "subgraph", "tag", "create", f"{deploy_url}/{args.version}", "--tag", "latest"]
        subprocess.run(command, check=True)

    if args.delete_latest_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        deploy_url = config.deploy_urls[args.module_name]
        command = ["goldsky", "subgraph", "tag", "delete", f"{deploy_url}/{args.version}", "--tag", "latest"]
        subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
