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
from typing import Any, Dict, Iterable, List, Optional, Set

import yaml


COMMON_TOOL_DIRS = [
    "/usr/local/bin",
    "/opt/homebrew/bin",
]
GOLDSKY_BIN_ENV = "GOLDSKY_BIN"


def resolve_tool(name: str, configured_env: str | None = None) -> str | None:
    """Resolve a CLI from an explicit propagated path, PATH, or macOS defaults."""
    if configured_env:
        configured = os.environ.get(configured_env)
        if configured and os.path.isfile(configured) and os.access(configured, os.X_OK):
            return configured

    found = shutil.which(name)
    if found:
        return found
    for tool_dir in COMMON_TOOL_DIRS:
        candidate = os.path.join(tool_dir, name)
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    return None


def goldsky_command(*args: str) -> list[str]:
    goldsky = resolve_tool("goldsky", GOLDSKY_BIN_ENV)
    if not goldsky:
        checked = ", ".join(COMMON_TOOL_DIRS)
        raise FileNotFoundError(f"goldsky CLI not found via {GOLDSKY_BIN_ENV}, PATH, or {checked}")
    return [goldsky, *args]


def load_env_file():
    """Load variables from .env file (does not override existing env vars)."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip("'\"")
                if key not in os.environ:
                    os.environ[key] = value


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


def step(current, total, msg):
    print(f"{Style.BLUE}{Style.BOLD}[{current}/{total}]{Style.RESET} {msg}")


def success(msg):
    print(f"  {Style.GREEN}✓{Style.RESET} {msg}")


def warn(msg):
    print(f"  {Style.YELLOW}⚠{Style.RESET} {msg}")


def error(msg):
    print(f"  {Style.RED}✗{Style.RESET} {msg}")


def header(msg):
    print(f"\n{Style.CYAN}{Style.BOLD}{'─' * 50}")
    print(f"  {msg}")
    print(f"{'─' * 50}{Style.RESET}\n")


def update_pipelines_after_deploy(subgraph: str, version: str) -> bool:
    """Apply related Goldsky pipeline updates without failing deployment."""
    updater_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pipeline_updater.py")
    print(f"\n{Style.BLUE}{Style.BOLD}Updating related Goldsky pipelines...{Style.RESET}")
    try:
        result = subprocess.run(
            [
                sys.executable,
                updater_path,
                "--subgraph",
                subgraph,
                "--version",
                version,
                "--apply",
            ],
            check=False,
        )
    except OSError as exc:
        warn(f"Subgraph deployment succeeded, but the pipeline updater could not start: {exc}")
        return False

    if result.returncode != 0:
        warn("Subgraph deployment succeeded, but one or more related pipeline updates failed. See the errors above.")
        return False

    success("Related pipeline update check complete")
    return True


@dataclass
class Event:
    source: str
    signature: str
    name: str
    numbered_name: str
    handler_name: str
    overload_index: int = 0


@dataclass
class Contract:
    address: str
    abi: str
    version: str
    startBlock: str
    fake: bool = False
    endBlock: Optional[str] = None
    name: Optional[str] = None
    events: List[Event] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    excludedEvents: List[str] = field(default_factory=list)

    def path(self) -> str:
        return f"{self.abi}_{self.version}"


@dataclass
class Config:
    network: str
    contracts: List[Contract]
    deploy_urls: Dict[str, Any]
    latestAccountBalanceSweepActivationBlock: str = "0"
    deployment_id: str = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any], deployment_id: str = "") -> "Config":
        contracts = [Contract(**c) for c in data["contracts"]]
        raw_activation_block = data.get("latestAccountBalanceSweepActivationBlock", "0")
        if isinstance(raw_activation_block, bool):
            raise ValueError("latestAccountBalanceSweepActivationBlock must be a non-negative integer")
        if isinstance(raw_activation_block, int):
            activation_block = raw_activation_block
        elif isinstance(raw_activation_block, str) and raw_activation_block.isdigit():
            activation_block = int(raw_activation_block)
        else:
            raise ValueError("latestAccountBalanceSweepActivationBlock must be a non-negative integer")
        if activation_block < 0:
            raise ValueError("latestAccountBalanceSweepActivationBlock must be a non-negative integer")
        return cls(
            data["network"],
            contracts,
            data["deploy_urls"],
            latestAccountBalanceSweepActivationBlock=str(activation_block),
            deployment_id=deployment_id,
        )

    def get_deploy_url(self, module_name: str, provider: str = "goldsky") -> str:
        url = self.deploy_urls.get(module_name)
        if url is None:
            raise KeyError(f"No deploy URL for module '{module_name}'")
        if isinstance(url, dict):
            if provider not in url:
                raise KeyError(f"No deploy URL for provider '{provider}' in module '{module_name}'")
            return url[provider]
        # Plain string: use for any provider (same name across providers)
        return url


def build_data_source_context(config: Config, contract: Contract, target_module: str) -> Dict[str, Dict[str, str]]:
    """Build deployment topology once from config instead of hardcoding it in mappings."""
    if not target_module.startswith("perps/") or contract.fake:
        return {}

    context: Dict[str, Dict[str, str]] = {}
    if config.deployment_id:
        context["deploymentId"] = {"type": "String", "data": config.deployment_id}

    account_layers = {item.address.lower(): item.address for item in config.contracts if item.abi == "accountLayer" and not item.fake}
    if len(account_layers) > 1:
        addresses = ", ".join(sorted(account_layers.values()))
        raise ValueError(f"Config declares multiple AccountLayer addresses; cannot infer one data-source context: {addresses}")
    if account_layers:
        context["accountLayerSource"] = {"type": "Bytes", "data": next(iter(account_layers.values()))}

    if target_module == "perps/analytics" and contract.abi == "symmio":
        context["latestAccountBalanceSweepActivationBlock"] = {
            "type": "BigInt",
            "data": config.latestAccountBalanceSweepActivationBlock,
        }

    return context


abi_versions = {
    "symmio": ["0_8_0", "0_8_1", "0_8_2", "0_8_3", "0_8_4", "0_8_5", "0_8_6"],
    "symmioLegacyOpen": ["0_8_5"],
    "symmioMultiAccount": ["1", "2", "3"],
    "options": ["1"],
    "optionsMultiAccount": ["1"],
    "feeCollector": ["1"],
    "accountLayer": ["1", "2", "3"],
    "expressProvider": ["1"],
    "buybackGateway": ["1"],
}

# Maps ABI name → version enum name used in BaseHandler.ts
abi_version_enums: Dict[str, str] = {
    "symmio": "Version",
    "symmioMultiAccount": "MultiAccountVersion",
    "feeCollector": "FeeCollectorVersion",
    "accountLayer": "AccountLayerVersion",
    "expressProvider": "ExpressProviderVersion",
    "buybackGateway": "BuybackGatewayVersion",
    "options": "Version",
    "optionsMultiAccount": "MultiAccountVersion",
}

# Shared handlers may deliberately call a prior ABI binding when a newer
# contract preserves the exact selector and return layout. Graph requires that
# binding name to be declared on the event data source even though codegen and
# compilation succeed without it.
HANDLER_ABI_DEPENDENCIES: Dict[tuple[str, str], List[str]] = {
    ("accountLayer", "2"): ["accountLayer_1"],
    ("accountLayer", "3"): ["accountLayer_1", "accountLayer_2"],
    ("symmio", "0_8_6"): ["symmio_0_8_5"],
}


def get_handler_abi_dependencies(contract: Contract) -> List[str]:
    return HANDLER_ABI_DEPENDENCIES.get((contract.abi, contract.version), [])


SYNC_META_SCHEMA = """
\"\"\"Singleton schema-version metadata maintained by the subgraph.\"\"\"
type SyncMeta @entity(immutable: false) {
    \"\"\"Constant `meta` singleton identifier.\"\"\"
    id: ID!
    \"\"\"Module-wide version from the module's `sync_versions.json`.\"\"\"
    globalVersion: String!
    \"\"\"Pipe-delimited hash input formed from sorted `entity:version` pairs.\"\"\"
    versionsHash: String!
    \"\"\"Block timestamp when this metadata record was created or last changed.\"\"\"
    deployedAt: BigInt!
    \"\"\"Entity-specific version rows linked to this singleton.\"\"\"
    versions: [EntityVersion!]! @derivedFrom(field: "meta")
}

\"\"\"Current indexed schema version for one named entity.\"\"\"
type EntityVersion @entity(immutable: false) {
    \"\"\"Entity name used as the version-row identifier.\"\"\"
    id: ID!
    \"\"\"Reference to the SyncMeta singleton.\"\"\"
    meta: SyncMeta!
    \"\"\"Configured version string for this entity.\"\"\"
    version: String!
    \"\"\"Block timestamp when this row was created or its version last changed.\"\"\"
    updatedAt: BigInt!
}
"""


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
    common, *_ = target_module.split("/")
    common_models_dir = os.path.join(f"./{common}", "common", "models")

    with open(os.path.join(target_module, "schema.graphql"), "r") as src_file, open("./schema.graphql", "w") as dest_file:
        dest_file.write("# Imported Models\n")
        common_models = []
        if os.path.exists(common_models_dir):
            common_models = sorted(os.listdir(common_models_dir))
        for model in common_models:
            model_name = model.split(".")[0]
            if model_name in target_config["importModels"]:
                with open(os.path.join(common_models_dir, model), "r") as model_file:
                    dest_file.write("\n" + model_file.read())
        dest_file.write("\n" + SYNC_META_SCHEMA)
        dest_file.write("#=======================\n\n")
        dest_file.write(src_file.read())


def load_sync_versions(target_module: str) -> Dict[str, Any]:
    path = os.path.join(target_module, "sync_versions.json")
    if not os.path.exists(path):
        return {"global": "0", "entities": {}}
    with open(path, "r") as f:
        data = json.load(f)
    if "global" not in data or "entities" not in data:
        raise ValueError(f"{path} must contain 'global' and 'entities' keys")
    return data


def generate_sync_meta_ts(target_module: str):
    versions = load_sync_versions(target_module)
    global_version = versions["global"]
    entity_versions = versions.get("entities", {})
    entity_version_items = sorted(entity_versions.items())
    versions_hash = "|".join([f"{entity}:{version}" for entity, version in entity_version_items])

    depth = target_module.count("/") + 1
    generated_prefix = "../" * depth

    lines = [
        'import { BigInt, ethereum } from "@graphprotocol/graph-ts"',
        f'import {{ EntityVersion, SyncMeta }} from "{generated_prefix}generated/schema"',
        "",
        f"const GLOBAL_VERSION = {json.dumps(global_version)}",
        f"const VERSIONS_HASH = {json.dumps(versions_hash)}",
        "",
        "function ensureEntityVersion(id: string, versionValue: string, timestamp: BigInt): void {",
        "    let entityVersion = EntityVersion.load(id)",
        "    let isNew = entityVersion == null",
        "    if (entityVersion == null) {",
        "        entityVersion = new EntityVersion(id)",
        '        entityVersion.meta = "meta"',
        "    }",
        "    if (isNew || entityVersion.version != versionValue) {",
        '        entityVersion.meta = "meta"',
        "        entityVersion.version = versionValue",
        "        entityVersion.updatedAt = timestamp",
        "        entityVersion.save()",
        "    }",
        "}",
        "",
        "export function ensureSyncMeta(block: ethereum.Block): void {",
        '    let meta = SyncMeta.load("meta")',
        "    if (meta != null) {",
        "        if (meta.globalVersion == GLOBAL_VERSION && meta.versionsHash == VERSIONS_HASH) {",
        "            return",
        "        }",
        "    }",
        "    if (meta == null) {",
        '        meta = new SyncMeta("meta")',
        "    }",
        "    meta.globalVersion = GLOBAL_VERSION",
        "    meta.versionsHash = VERSIONS_HASH",
        "    meta.deployedAt = block.timestamp",
        "    meta.save()",
    ]

    for entity, version in entity_version_items:
        lines.append(f'    ensureEntityVersion("{entity}", "{version}", block.timestamp)')

    lines += [
        "}",
        "",
    ]

    with open(os.path.join(target_module, "src_sync_meta.ts"), "w") as src_file:
        src_file.write("\n".join(lines))


def generate_src_ts(target_module: str, contract: Contract):
    imports = set()
    handlers_code = []

    # Determine import depth: multi-module (perps/events) = 2, single = 1
    depth = target_module.count("/") + 1
    generated_prefix = "../" * depth

    # Determine correct version enum for this ABI type
    version_enum = abi_version_enums.get(contract.abi, "Version")

    # Determine BaseHandler import path
    if "/" in target_module:
        base_handler_path = "../common/BaseHandler"
    else:
        base_handler_path = "./BaseHandler"

    # Sort events by name
    sorted_events = sorted(contract.events, key=lambda e: (e.name, e.numbered_name))

    for event in sorted_events:
        imports.add(f"import {{{event.name}Handler}} from './handlers/{contract.abi}/{event.name}Handler'")
        imports.add(f"import {{{event.numbered_name}}} from '{generated_prefix}generated/{event.source}/{event.source}'")
        imports.add("import {ensureSyncMeta} from './src_sync_meta'")
        handlers_code.append(
            textwrap.dedent(
                f"""
                export function {event.handler_name}(event: {event.numbered_name}): void {{
                    ensureSyncMeta(event.block)
                    let handler = new {event.name}Handler<{event.numbered_name}>()
                    handler.handle(event, {version_enum}.v_{contract.version})
                }}
                """
            )
        )

    imports.add(f"import {{{version_enum}}} from '{base_handler_path}'")

    if target_module == "perps/analytics" and contract.abi == "symmio":
        imports.add("import {ethereum} from '@graphprotocol/graph-ts'")
        imports.add(
            "import {handleLatestAccountBalanceBlock as handleLatestAccountBalanceBlockImpl} from './src_latest_account_balance_block'"
        )
        handlers_code.append(
            textwrap.dedent(
                f"""
                export function handleLatestAccountBalanceBlock(block: ethereum.Block): void {{
                    handleLatestAccountBalanceBlockImpl(block, {version_enum}.v_{contract.version})
                }}
                """
            )
        )

    with open(os.path.join(target_module, f"src_{contract.path()}.ts"), "w") as src_file:
        src_file.write("\n".join(sorted(imports)))
        src_file.write("\n\n")
        src_file.write("\n".join(handlers_code))


def generate_template_src_ts(target_module: str, contract: Contract, template_name: str):
    imports = set()
    handlers_code = []

    depth = target_module.count("/") + 1
    generated_prefix = "../" * depth
    version_enum = abi_version_enums.get(contract.abi, "Version")

    if "/" in target_module:
        base_handler_path = "../common/BaseHandler"
    else:
        base_handler_path = "./BaseHandler"

    sorted_events = sorted(contract.events, key=lambda e: (e.name, e.numbered_name))

    for event in sorted_events:
        imports.add(f"import {{{event.name}Handler}} from './handlers/{contract.abi}/{event.name}Handler'")
        imports.add(f"import {{{event.numbered_name}}} from '{generated_prefix}generated/templates/{template_name}/{event.source}'")
        imports.add("import {ensureSyncMeta} from './src_sync_meta'")
        handlers_code.append(
            textwrap.dedent(
                f"""
                export function {event.handler_name}(event: {event.numbered_name}): void {{
                    ensureSyncMeta(event.block)
                    let handler = new {event.name}Handler<{event.numbered_name}>()
                    handler.handle(event, {version_enum}.v_{contract.version})
                }}
                """
            )
        )

    imports.add(f"import {{{version_enum}}} from '{base_handler_path}'")

    with open(os.path.join(target_module, f"src_{contract.path()}.ts"), "w") as src_file:
        src_file.write("\n".join(sorted(imports)))
        src_file.write("\n\n")
        src_file.write("\n".join(handlers_code))


def generate_module_src_files(target_module: str, contracts: Iterable[Contract]):
    generated_paths: Set[str] = set()
    for contract in contracts:
        if not contract.events or contract.path() in generated_paths:
            continue
        if contract.fake and contract.abi != "expressProvider":
            continue

        if contract.abi == "expressProvider":
            generate_template_src_ts(target_module, contract, "ExpressProvider")
        else:
            generate_src_ts(target_module, contract)
        generated_paths.add(contract.path())


def get_event_inputs(event_name: str, abi_file_path: str) -> List[Dict[str, Any]]:
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            return entry["inputs"]
    return []


def generate_handler_files(target_module: str, contract: Contract, simple_mapping: bool = False):
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
    pattern = re.compile(r"\btype\s+(\w+)((?:\s+@\w+(?:\([^)]*\))?)*)\s*{", re.MULTILINE)
    return [match[0] for match in pattern.findall(schema_content)]


DEPENDENCY_EXTENDS_KEY = "__extends"


def load_dependencies(file_path: str, resolution_stack: Optional[List[str]] = None) -> Dict[str, List[str]]:
    """Load dependency files with cycle-safe, child-replaces-parent inheritance."""
    resolved_path = os.path.realpath(file_path)
    stack = [] if resolution_stack is None else resolution_stack
    if resolved_path in stack:
        cycle = " -> ".join([*stack, resolved_path])
        raise ValueError(f"Dependency inheritance cycle detected: {cycle}")

    try:
        with open(resolved_path, "r") as deps_file:
            dependency_data = json.load(deps_file)
    except FileNotFoundError:
        warn(f"Dependencies file not found: {file_path}")
        return {}

    if not isinstance(dependency_data, dict):
        raise ValueError(f"Dependencies file must contain a JSON object: {file_path}")

    extends = dependency_data.get(DEPENDENCY_EXTENDS_KEY, [])
    if isinstance(extends, str):
        parent_refs = [extends]
    elif isinstance(extends, list) and all(isinstance(parent_ref, str) for parent_ref in extends):
        parent_refs = extends
    else:
        raise ValueError(f"{DEPENDENCY_EXTENDS_KEY} must be a path or list of paths in {file_path}")

    dependencies: Dict[str, List[str]] = {}
    next_stack = [*stack, resolved_path]
    for parent_ref in parent_refs:
        parent_path = parent_ref if os.path.isabs(parent_ref) else os.path.join(os.path.dirname(resolved_path), parent_ref)
        if not os.path.exists(parent_path):
            raise FileNotFoundError(f"Inherited dependencies file not found: {parent_path} (from {file_path})")
        dependencies.update(load_dependencies(parent_path, next_stack))

    for model, events in dependency_data.items():
        if model == DEPENDENCY_EXTENDS_KEY:
            continue
        if not isinstance(events, list) or not all(isinstance(event_ref, str) for event_ref in events):
            raise ValueError(f"Dependency list for model '{model}' must contain only strings in {file_path}")
        dependencies[model] = events
    return dependencies


def get_needed_events_for(models: List[str], target_module: str, contract: Contract) -> List[str]:
    common, *_ = target_module.split("/")
    common_dependencies = load_dependencies(os.path.join(f"./{common}", "common", f"deps_{contract.path()}.json"))
    target_dependencies = load_dependencies(os.path.join(target_module, f"deps_{contract.path()}.json"))

    events = []
    for model in models:
        events.extend(common_dependencies.get(model, []))
        events.extend(target_dependencies.get(model, []))
    return ordered_unique(events)


def ordered_unique(values: Iterable[str]) -> List[str]:
    return list(dict.fromkeys(values))


def express_provider_template_entities(target_module: str) -> List[str]:
    if target_module == "perps/analytics":
        return [
            "AffiliateExpressWithdrawComponents",
            "ExpressProviderSource",
            "ExpressProviderSourceByCore",
            "ExpressProviderWithdrawLifecycleHint",
            "WithdrawRequest",
        ]
    if target_module == "perps/events":
        return list(load_dependencies(os.path.join(target_module, "deps_expressProvider_1.json")))
    raise ValueError(f"Unsupported ExpressProvider template module: {target_module}")


def contract_requires_event_source(contract: Contract, target_module: str) -> bool:
    """Return whether omitting this real contract from the manifest is unsafe."""
    product = target_module.split("/", 1)[0]
    primary_abi = {"perps": "symmio", "options": "options"}.get(product)
    if contract.abi == primary_abi:
        return True

    dependency_file = os.path.join(target_module, f"deps_{contract.path()}.json")
    source_file = os.path.join(target_module, f"src_{contract.path()}.ts")
    return os.path.exists(dependency_file) or os.path.exists(source_file)


def validate_contract_event_source(contract: Contract, target_module: str) -> None:
    if not contract.fake and not contract.events and contract_requires_event_source(contract, target_module):
        raise ValueError(
            f"Configured contract {contract.path()} at {contract.address} resolved zero events for {target_module}; "
            "refusing to omit a real data source"
        )


def get_event_signature(event_name: str, abi_file_path: str) -> List[str]:
    return [entry["signature"] for entry in get_event_signature_entries(event_name, abi_file_path)]


def get_event_signature_entries(event_ref: str, abi_file_path: str) -> List[Dict[str, Any]]:
    with open(abi_file_path, "r") as file:
        abi = json.load(file)

    exact_signature = None
    exact_match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\((.*)\)$", event_ref)
    if exact_match:
        event_name = exact_match.group(1)
        exact_signature = event_ref
    else:
        event_name = event_ref

    def parse_type(input_item):
        type_str = input_item["type"]
        if "tuple" in type_str:
            # Check for array suffix
            array_suffix = "[]" if type_str.endswith("[]") else ""
            # Recursively parse components
            components = input_item.get("components", [])
            component_types = [parse_type(comp) for comp in components]
            tuple_str = f"({','.join(component_types)})"
            return tuple_str + array_suffix
        else:
            return input_item["type"]

    def build_signature(entry: Dict[str, Any], include_indexed: bool) -> str:
        inputs = [
            ("indexed " if include_indexed and inp["indexed"] else "") + parse_type(inp)
            for inp in entry["inputs"]
        ]
        return f"{entry['name']}({','.join(inputs)})"

    signatures = []
    overload_index = 0
    for entry in abi:
        if entry["type"] == "event" and entry["name"] == event_name:
            signature = build_signature(entry, True)
            comparable_signature = build_signature(entry, False)
            if exact_signature is None or exact_signature in (signature, comparable_signature):
                signatures.append(
                    {
                        "name": entry["name"],
                        "signature": signature,
                        "overload_index": overload_index,
                    }
                )
            overload_index += 1
    return signatures


def get_events_with_signatures(needed_events: Iterable[str], contract: Contract) -> List[Event]:
    events = []
    source = contract.path()
    abi_file = f"./configs/abis/{source}.json"
    seen: Set[str] = set()
    excluded_events = set(contract.excludedEvents)
    for event_ref in needed_events:
        entries = get_event_signature_entries(event_ref, abi_file)
        for entry in entries:
            if event_ref in excluded_events or entry["name"] in excluded_events or entry["signature"] in excluded_events:
                continue
            if entry["signature"] in seen:
                continue
            seen.add(entry["signature"])
            event_name = entry["name"]
            overload_index = entry["overload_index"]
            numbered_name = event_name if overload_index == 0 else f"{event_name}{overload_index}"
            # Auto-detected dynamic templates use a placeholder address and are
            # marked fake, but their runtime-created instances must still call
            # the real exported handlers.
            uses_real_handler = not contract.fake or contract.abi == "expressProvider"
            handler_name = f"handle{numbered_name}" if uses_real_handler else "handleIgnoredEvent"
            events.append(
                Event(
                    source=source,
                    name=event_name,
                    signature=entry["signature"],
                    handler_name=handler_name,
                    numbered_name=numbered_name,
                    overload_index=overload_index,
                )
            )
    return events


def prepare_module(config: Config, target_module: str) -> List[Contract]:
    target_config = {}
    if os.path.exists(os.path.join(target_module, "subgraph_config.json")):
        with open(os.path.join(target_module, "subgraph_config.json"), "r") as target_config_file:
            target_config = json.load(target_config_file)

    create_schema_file(target_module, target_config)
    models = get_scheme_models()

    # Preserve config and registry order so generated manifests are reproducible.
    unique_abis = ordered_unique(contract.abi for contract in config.contracts)
    config_abis = set(unique_abis)  # snapshot before auto-detection

    # Also detect ABIs needed by the module (deps/src files exist) but not in config
    common_prefix, *_ = target_module.split("/")
    common_dir = os.path.join(common_prefix, "common")
    for abi, versions in abi_versions.items():
        if abi in unique_abis:
            continue
        for version in versions:
            if (
                os.path.exists(os.path.join(target_module, f"deps_{abi}_{version}.json"))
                or os.path.exists(os.path.join(common_dir, f"deps_{abi}_{version}.json"))
                or os.path.exists(os.path.join(target_module, f"src_{abi}_{version}.ts"))
            ):
                unique_abis.append(abi)
                break

    # Create a list to store all contracts, including the new versions
    all_contracts = []
    global_max_start_block = max(int(c.startBlock) for c in config.contracts)

    # Process events for each contract and add missing versions
    for abi in unique_abis:
        versions = abi_versions[abi]
        contracts_for_abi = [c for c in config.contracts if c.abi == abi]

        if contracts_for_abi:
            max_start_block = max(int(c.startBlock) for c in contracts_for_abi)
            base_address = next(c.address for c in contracts_for_abi)
            base_name = next((c.name for c in contracts_for_abi if c.name), None)
        else:
            # ABI needed by module but not in config - use global max block and a real address
            # (zero address is rejected by Graph nodes during deployment)
            max_start_block = global_max_start_block
            base_address = config.contracts[0].address
            base_name = None

        for version in versions:
            existing_contracts = [c for c in config.contracts if c.abi == abi and c.version == version]
            if existing_contracts:
                all_contracts.extend(existing_contracts)
            else:
                new_contract = Contract(
                    fake=True,
                    address=base_address,
                    abi=abi,
                    version=version,
                    startBlock=str(max_start_block),
                    endBlock=str(max_start_block),
                    name=base_name,
                )
                all_contracts.append(new_contract)

    # Collect all needed events across all contracts
    all_needed_events = {}
    for contract in all_contracts:
        if contract.path() not in all_needed_events:
            all_needed_events[contract.path()] = []
        all_needed_events[contract.path()].extend(get_needed_events_for(models, target_module, contract))

    # Process events for all contracts
    for contract in all_contracts:
        needed_events = ordered_unique(all_needed_events.get(contract.path(), []))
        contract.events = get_events_with_signatures(needed_events, contract)
        validate_contract_event_source(contract, target_module)

    subgraph_config = {
        "specVersion": "1.2.0",
        "description": f"{target_module} Subgraph of SYMMIO",
        "schema": {"file": "./schema.graphql"},
        "indexerHints": {"prune": "never"},
        "dataSources": [],
        "templates": [],
    }
    contract_indexes = defaultdict(int)
    for contract in all_contracts:
        if not contract.events:
            continue
        copy_abi_files(f"{contract.path()}.json")

        if contract.abi == "expressProvider":
            template_name = "ExpressProvider"
            subgraph_config["templates"].append(
                {
                    "kind": "ethereum/contract",
                    "name": template_name,
                    "network": config.network,
                    "source": {
                        "abi": contract.path(),
                    },
                    "mapping": {
                        "kind": "ethereum/events",
                        "apiVersion": "0.0.6",
                        "language": "wasm/assemblyscript",
                        "entities": express_provider_template_entities(target_module),
                        "abis": [{"name": contract.path(), "file": f"./abis/{contract.path()}.json"}],
                        "eventHandlers": [{"event": event.signature, "handler": event.handler_name} for event in contract.events],
                        "file": f"./{target_module}/src_{contract.path()}.ts",
                    },
                }
            )
            continue

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
                "abis": [{"name": contract.path(), "file": f"./abis/{contract.path()}.json"}],
                "eventHandlers": [{"event": event.signature, "handler": event.handler_name} for event in contract_events],
                "file": f"./{target_module}/src_{contract.path() if not contract.fake else 'fake'}.ts",
            },
        }
        if contract.endBlock:
            source_config["source"]["endBlock"] = int(contract.endBlock)

        source_context = build_data_source_context(config, contract, target_module)
        if source_context:
            source_config["context"] = source_context

        if target_module == "perps/analytics" and contract.abi == "symmio" and not contract.fake:
            source_config["mapping"]["blockHandlers"] = [{"handler": "handleLatestAccountBalanceBlock", "filter": {"kind": "polling", "every": 1000}}]

        if len(contract.dependencies) > 0:
            source_config["mapping"]["abis"] += [{"name": dep, "file": f"./abis/{dep}.json"} for dep in contract.dependencies]

        for dependency in get_handler_abi_dependencies(contract):
            if not any(abi_ref["name"] == dependency for abi_ref in source_config["mapping"]["abis"]):
                source_config["mapping"]["abis"].append({"name": dependency, "file": f"./abis/{dependency}.json"})

        # symmio handlers (Allocate/Deposit/Withdraw) call accountLayer_1.bind() via the resolver
        # to fix the activeUsers ordering bug. Every symmio data source on chains using accountLayer
        # must declare accountLayer_1 in its abis so the binding can be resolved at runtime.
        if contract.abi == "symmio" and "accountLayer" in unique_abis:
            if not any(a["name"] == "accountLayer_1" for a in source_config["mapping"]["abis"]):
                source_config["mapping"]["abis"].append({"name": "accountLayer_1", "file": "./abis/accountLayer_1.json"})

        # accountLayer margin handlers refresh LatestAccountBalance by binding the
        # paired symmio core. Graph requires every bound contract ABI to be
        # declared on the calling data source, not just on that contract's own
        # event data source.
        if contract.abi == "accountLayer" and "symmio" in unique_abis:
            for c in all_contracts:
                if c.abi == "symmio":
                    if not any(a["name"] == c.path() for a in source_config["mapping"]["abis"]):
                        source_config["mapping"]["abis"].append({"name": c.path(), "file": f"./abis/{c.path()}.json"})

        # Auto-include ABIs that were detected from deps/src files but not in config
        existing_abi_names = set(a["name"] for a in source_config["mapping"]["abis"])
        for c in all_contracts:
            if c.abi not in config_abis and c.path() not in existing_abi_names and c.events:
                source_config["mapping"]["abis"].append({"name": c.path(), "file": f"./abis/{c.path()}.json"})
                existing_abi_names.add(c.path())

        for abi_ref in source_config["mapping"]["abis"]:
            copy_abi_files(os.path.basename(abi_ref["file"]))

        contract_indexes[(contract.abi, contract.version)] += 1

        if contract_indexes[(contract.abi, contract.version)] > 1:
            source_config["name"] += f"_{contract_indexes[(contract.abi, contract.version)]}"

        subgraph_config["dataSources"].append(source_config)

    if not subgraph_config["templates"]:
        del subgraph_config["templates"]

    yaml_content = json_to_yaml(subgraph_config)
    with open("./subgraph.yaml", "w") as yaml_file:
        yaml_file.write(yaml_content)
    return all_contracts


# New function to convert Solidity types to GraphQL types
def solidity_type_to_graphql(sol_type):
    # Handle arrays
    if sol_type.endswith("[]"):
        base_type = solidity_type_to_graphql(sol_type[:-2])
        return f"[{base_type[:-1]}]!"
    elif "[" in sol_type and "]" in sol_type:
        # Fixed-size arrays
        base_type = sol_type[: sol_type.find("[")]
        base_graphql_type = solidity_type_to_graphql(base_type)
        return f"[{base_graphql_type[:-1]}]!"
    elif sol_type.startswith("uint") or sol_type.startswith("int"):
        bits = "".join(filter(str.isdigit, sol_type))
        if bits == "":
            bits = 256  # default
        else:
            bits = int(bits)
        if bits <= 32:
            return "Int!"
        else:
            return "BigInt!"
    elif sol_type == "address":
        return "Bytes!"
    elif sol_type.startswith("bytes"):
        return "Bytes!"
    elif sol_type == "bool":
        return "Boolean!"
    elif sol_type == "string":
        return "String!"
    else:
        return "String!"  # default to String


# New function to generate and print entities
def generate_and_print_entities(config: Config):
    all_events = {}

    # Collect all events from all ABIs
    for contract in config.contracts:
        abi_file_path = os.path.join("./configs/abis", f"{contract.path()}.json")
        if not os.path.exists(abi_file_path):
            continue
        with open(abi_file_path, "r") as f:
            abi = json.load(f)
        for item in abi:
            if item.get("type") == "event":
                event_name = item["name"]
                # Avoid duplicate events
                if event_name not in all_events:
                    all_events[event_name] = item

    # Get the events as a list and sort by name
    events_list = list(all_events.values())
    events_list.sort(key=lambda x: x["name"])

    for event in events_list:
        event_name = event["name"]
        inputs = event["inputs"]
        # Collect parameter names and types
        params = []
        for param in inputs:
            param_name = param["name"] or "param"  # Ensure param name exists
            param_type = param["type"]
            graphql_type = solidity_type_to_graphql(param_type)
            params.append({"name": param_name, "type": graphql_type})
        # Sort parameters by name
        params.sort(key=lambda x: x["name"])
        # Output the entity definition
        print(f"type {event_name} @entity(immutable: true) {{")
        print("    id: ID!")
        print("    globalId: BigInt!")
        for param in params:
            print(f"    {param['name']}: {param['type']}")
        print("    blockNumber: BigInt!")
        print("    blockTimestamp: BigInt!")
        print("    transactionHash: Bytes!")
        print("}\n")


def _abi_has_function(abi_file_path: str, function_name: str) -> bool:
    """Check if an ABI file contains a specific function."""
    try:
        with open(abi_file_path, "r") as f:
            abi = json.load(f)
        return any(entry.get("type") == "function" and entry.get("name") == function_name for entry in abi)
    except (FileNotFoundError, json.JSONDecodeError):
        return False


def generate_contract_utils(common_dir: str, version: str):
    """Generate a contract_utils_{version}.ts file for a symmio version."""
    v = version  # short alias
    abi_file = f"./configs/abis/symmio_{v}.json"
    has_liquidation = _abi_has_function(abi_file, "getLiquidatedStateOfPartyA")
    has_party_a_reimbursement = _abi_has_function(abi_file, "partyAReimbursement")
    has_party_a_deferred_balance = _abi_has_function(abi_file, "getPartyADeferredBalance")
    has_liquidation_escrow = _abi_has_function(abi_file, "getLiquidationEscrow")

    lines = []
    lines.append('import {Address, BigInt, Bytes, log} from "@graphprotocol/graph-ts"')

    # Build import list from generated types
    imports = [
        f"symmio_{v}",
        f"symmio_{v}__balanceInfoOfPartyAResult",
        f"symmio_{v}__balanceInfoOfPartyBResult",
        f"symmio_{v}__getQuoteResultValue0Struct",
    ]
    if has_liquidation:
        imports.append(f"symmio_{v}__getLiquidatedStateOfPartyAResultValue0Struct")

    lines.append("import {")
    lines.append("\t" + ",\n\t".join(imports) + ",")
    lines.append(f'}} from "../../generated/symmio_{v}/symmio_{v}"')
    lines.append("")

    # getQuote
    lines.append(f"export function getQuote(address: Address, id: BigInt): symmio_{v}__getQuoteResultValue0Struct | null {{")
    lines.append(f"\tconst contract = symmio_{v}.bind(address)")
    lines.append("\tlet result = contract.try_getQuote(id)")
    lines.append("\treturn result.reverted ? null : result.value")
    lines.append("}")
    lines.append("")

    # getCollateral
    lines.append("export function getCollateral(address: Address,): Bytes | null {")
    lines.append(f"\tconst contract = symmio_{v}.bind(address)")
    lines.append("\tlet result = contract.try_getCollateral()")
    lines.append("\treturn result.reverted ? null : result.value")
    lines.append("}")
    lines.append("")

    # getLiquidatedStateOfPartyA (only v0.8.1+)
    if has_liquidation:
        lines.append(
            f"export function getLiquidatedStateOfPartyA(address: Address, partyA: Address): "
            f"symmio_{v}__getLiquidatedStateOfPartyAResultValue0Struct | null {{"
        )
        lines.append(f"\tconst contract = symmio_{v}.bind(address)")
        lines.append("\tlet result = contract.try_getLiquidatedStateOfPartyA(partyA)")
        lines.append("\treturn result.reverted ? null : result.value")
        lines.append("}")
        lines.append("")

    # getBalanceInfoOfPartyA
    lines.append(
        f"export function getBalanceInfoOfPartyA(address: Address, partyA: Address): "
        f"symmio_{v}__balanceInfoOfPartyAResult | null {{"
    )
    lines.append(f"\tconst contract = symmio_{v}.bind(address)")
    lines.append("\tlet result = contract.try_balanceInfoOfPartyA(partyA)")
    lines.append("\treturn result.reverted ? null : result.value")
    lines.append("}")
    lines.append("")

    if has_party_a_reimbursement:
        lines.append("export function partyAReimbursement(address: Address, partyA: Address): BigInt | null {")
        lines.append(f"\tconst contract = symmio_{v}.bind(address)")
        lines.append("\tlet result = contract.try_partyAReimbursement(partyA)")
        lines.append("\treturn result.reverted ? null : result.value")
        lines.append("}")
        lines.append("")

    if has_party_a_deferred_balance:
        lines.append("export function getPartyADeferredBalance(address: Address, partyA: Address): BigInt | null {")
        lines.append(f"\tconst contract = symmio_{v}.bind(address)")
        lines.append("\tlet result = contract.try_getPartyADeferredBalance(partyA)")
        lines.append("\treturn result.reverted ? null : result.value")
        lines.append("}")
        lines.append("")

    if has_liquidation_escrow:
        lines.append("export function getLiquidationEscrow(address: Address, partyA: Address): BigInt | null {")
        lines.append(f"\tconst contract = symmio_{v}.bind(address)")
        lines.append("\tlet result = contract.try_getLiquidationEscrow(partyA)")
        lines.append("\treturn result.reverted ? null : result.value")
        lines.append("}")
        lines.append("")

    # getBalanceInfoOfPartyB
    lines.append(
        f"export function getBalanceInfoOfPartyB(address: Address, partyA: Address, partyB: Address): "
        f"symmio_{v}__balanceInfoOfPartyBResult | null {{"
    )
    lines.append(f"\tconst contract = symmio_{v}.bind(address)")
    lines.append("\tlet result = contract.try_balanceInfoOfPartyB(partyB, partyA)")
    lines.append("\treturn result.reverted ? null : result.value")
    lines.append("}")
    lines.append("")

    # symbolIdToSymbolName
    lines.append("export function symbolIdToSymbolName(symbolId: BigInt, contractAddress: Address): string {")
    lines.append(f"\tlet symmioContract = symmio_{v}.bind(contractAddress)")
    lines.append("\tlet callResult = symmioContract.try_symbolNameById([symbolId])")
    lines.append("\tif (callResult.reverted) {")
    lines.append('\t\tlog.error("error in symbol bind", [])')
    lines.append('\t\treturn ""')
    lines.append("\t} else {")
    lines.append("\t\treturn callResult.value[0]")
    lines.append("\t}")
    lines.append("}")

    out_path = os.path.join(common_dir, f"contract_utils_{v}.ts")
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    success(f"Generated {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Module preparation script.")
    parser.add_argument("config_file", type=str, help="Configuration file path")
    parser.add_argument("module_name", type=str, help="Target module name")
    parser.add_argument("version", type=str, nargs="?", help="Deployment version")
    parser.add_argument("--create-src", action="store_true", help="Create the src file")
    parser.add_argument("--create-handlers", action="store_true", help="Create the handler files")
    parser.add_argument("--simple-mapping", action="store_true", help="Generate simple handler mappings")
    parser.add_argument("--deploy", action="store_true", help="Deploy the subgraph")
    parser.add_argument("--delete", action="store_true", help="Delete the subgraph")
    parser.add_argument("--add-latest-tag", action="store_true", help="Add 'latest' tag to the subgraph")
    parser.add_argument(
        "--delete-latest-tag",
        action="store_true",
        help="Delete 'latest' tag from the subgraph",
    )
    parser.add_argument("--add-stage-tag", action="store_true", help="Add 'stage' tag to the subgraph")
    parser.add_argument(
        "--delete-stage-tag",
        action="store_true",
        help="Delete 'stage' tag from the subgraph",
    )
    parser.add_argument("--generate-entities", action="store_true", help="Generate and print entities")  # New option
    parser.add_argument("--create-utils", action="store_true", help="Generate contract_utils files for symmio versions")
    parser.add_argument("--provider", choices=["goldsky", "0xgraph"], default="goldsky", help="Deployment provider (default: goldsky)")
    parser.add_argument(
        "--skip-pipeline-update",
        action="store_true",
        help="Do not apply related Goldsky pipeline updates after a successful subgraph deployment",
    )

    args = parser.parse_args()
    if not os.path.exists(args.config_file):
        error(f"Configuration file {args.config_file} does not exist!")
        sys.exit(1)

    is_tag_or_delete = args.add_latest_tag or args.delete_latest_tag or args.add_stage_tag or args.delete_stage_tag or args.delete
    is_build = not is_tag_or_delete
    config_name = os.path.splitext(os.path.basename(args.config_file))[0]

    # Determine action label for header
    if args.deploy:
        action_label = f"Build & Deploy {args.version}"
    elif args.delete:
        action_label = f"Delete {args.version}"
    elif args.add_latest_tag:
        action_label = f"Tag {args.version} → latest"
    elif args.delete_latest_tag:
        action_label = f"Untag latest from {args.version}"
    elif args.add_stage_tag:
        action_label = f"Tag {args.version} → stage"
    elif args.delete_stage_tag:
        action_label = f"Untag stage from {args.version}"
    else:
        action_label = "Build"
    header(f"{action_label}  ·  {config_name}  ·  {args.module_name}")

    subprocess.run(["./scripts/clean.sh"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    with open(args.config_file, "r") as f:
        config_data = json.load(f)
    config = Config.from_dict(config_data, deployment_id=config_name.replace("_", "-"))

    # New block to handle the generate_entities option
    if args.generate_entities:
        generate_and_print_entities(config)
        sys.exit(0)

    if is_build:
        # Count total build steps
        build_steps = 4  # clean, prepare, codegen, build
        if args.create_utils:
            build_steps += 1
        if args.create_src:
            build_steps += 1
        if args.create_handlers:
            build_steps += 1
        current_step = 0

        current_step += 1
        step(current_step, build_steps, "Cleaning old artifacts...")
        success("Clean")

        current_step += 1
        step(current_step, build_steps, "Preparing module...")
        prepared_contracts = prepare_module(config, args.module_name)
        generate_sync_meta_ts(args.module_name)
        success("Module prepared")

        if args.create_utils:
            current_step += 1
            step(current_step, build_steps, "Generating contract utils...")
            common_prefix, *_ = args.module_name.split("/")
            common_dir = os.path.join(common_prefix, "common")
            for version in abi_versions.get("symmio", []):
                generate_contract_utils(common_dir, version)

        if args.create_src:
            current_step += 1
            step(current_step, build_steps, "Generating src entry files...")
            generate_module_src_files(args.module_name, prepared_contracts)
            success("Src files generated")

        if args.create_handlers:
            current_step += 1
            step(current_step, build_steps, "Generating handler files...")
            for contract in config.contracts:
                generate_handler_files(args.module_name, contract, args.simple_mapping)
            success("Handler files generated")

        current_step += 1
        step(current_step, build_steps, "Running codegen...")
        subprocess.run(["graph", "codegen"], check=True)
        success("Codegen complete")

        current_step += 1
        step(current_step, build_steps, "Building subgraph...")
        subprocess.run(["graph", "build"], check=True)
        success("Build complete")

    if args.deploy:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        deploy_url = config.get_deploy_url(args.module_name, args.provider)

        if args.provider == "goldsky":
            step(1, 1, f"Deploying to Goldsky as {Style.BOLD}{deploy_url}/{args.version}{Style.RESET}...")
            command = goldsky_command(
                "subgraph",
                "deploy",
                f"{deploy_url}/{args.version}",
                "--path",
                "build",
            )
            subprocess.run(command, check=True)
            success(f"Deployed {args.version} to Goldsky")
            if not args.skip_pipeline_update:
                update_pipelines_after_deploy(deploy_url, args.version)

        elif args.provider == "0xgraph":
            load_env_file()
            deploy_key = os.environ.get("OXGRAPH_DEPLOY_KEY")
            if not deploy_key:
                error("OXGRAPH_DEPLOY_KEY not set. Add it to .env or export it as an environment variable.")
                sys.exit(1)
            step(1, 1, f"Deploying to 0xGraph as {Style.BOLD}{deploy_url}{Style.RESET} ({args.version})...")
            command = [
                "graph",
                "deploy",
                deploy_url,
                "--version-label",
                args.version,
                "--node",
                "https://api.subgraph.ormilabs.com/deploy",
                "--ipfs",
                "https://api.subgraph.ormilabs.com/ipfs",
                "--deploy-key",
                deploy_key,
            ]
            subprocess.run(command, check=True)
            success(f"Deployed {args.version} to 0xGraph")

    if args.delete:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        if args.provider != "goldsky":
            error("--delete is only supported for goldsky provider")
            sys.exit(1)
        deploy_url = config.get_deploy_url(args.module_name, "goldsky")
        step(1, 1, f"Deleting {Style.BOLD}{deploy_url}/{args.version}{Style.RESET}...")
        command = goldsky_command(
            "subgraph",
            "delete",
            "-f",
            f"{deploy_url}/{args.version}",
        )
        subprocess.run(command, check=True)
        success(f"Deleted {args.version}")

    if args.add_latest_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        if args.provider != "goldsky":
            error("--add-latest-tag is only supported for goldsky provider")
            sys.exit(1)
        deploy_url = config.get_deploy_url(args.module_name, "goldsky")
        step(1, 1, f"Adding {Style.BOLD}latest{Style.RESET} tag to {deploy_url}/{args.version}...")
        command = goldsky_command(
            "subgraph",
            "tag",
            "create",
            f"{deploy_url}/{args.version}",
            "--tag",
            "latest",
        )
        subprocess.run(command, check=True)
        success("Tagged as latest")

    if args.add_stage_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        if args.provider != "goldsky":
            error("--add-stage-tag is only supported for goldsky provider")
            sys.exit(1)
        deploy_url = config.get_deploy_url(args.module_name, "goldsky")
        step(1, 1, f"Adding {Style.BOLD}stage{Style.RESET} tag to {deploy_url}/{args.version}...")
        command = goldsky_command(
            "subgraph",
            "tag",
            "create",
            f"{deploy_url}/{args.version}",
            "--tag",
            "stage",
        )
        subprocess.run(command, check=True)
        success("Tagged as stage")

    if args.delete_latest_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        if args.provider != "goldsky":
            error("--delete-latest-tag is only supported for goldsky provider")
            sys.exit(1)
        deploy_url = config.get_deploy_url(args.module_name, "goldsky")
        step(1, 1, f"Deleting {Style.BOLD}latest{Style.RESET} tag from {deploy_url}/{args.version}...")
        command = goldsky_command(
            "subgraph",
            "tag",
            "delete",
            f"{deploy_url}/{args.version}",
            "-f",
            "--tag",
            "latest",
        )
        subprocess.run(command, check=True)
        success("Deleted latest tag")

    if args.delete_stage_tag:
        if args.version is None:
            raise Exception("Version should be provided with --version")
        if args.provider != "goldsky":
            error("--delete-stage-tag is only supported for goldsky provider")
            sys.exit(1)
        deploy_url = config.get_deploy_url(args.module_name, "goldsky")
        step(1, 1, f"Deleting {Style.BOLD}stage{Style.RESET} tag from {deploy_url}/{args.version}...")
        command = goldsky_command(
            "subgraph",
            "tag",
            "delete",
            f"{deploy_url}/{args.version}",
            "-f",
            "--tag",
            "stage",
        )
        subprocess.run(command, check=True)
        success("Deleted stage tag")

    print(f"\n{Style.GREEN}{Style.BOLD}✓ Done{Style.RESET}\n")


if __name__ == "__main__":
    main()
