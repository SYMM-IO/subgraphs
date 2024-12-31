# Symmio Subgraphs

This repository provides a robust and flexible structure for deploying subgraphs associated with multiple versions of
smart contracts across various blockchain networks. The script and configuration files facilitate dynamic generation of
event handlers, manage multiple contract versions, and support seamless deployment to different networks.

## Why This Structure?

The complexity of managing multiple contract versions and networks necessitates a scalable and maintainable solution.
This structure addresses the following challenges:

- **Version Management**: Automates the handling of multiple versions of contracts, ensuring consistent event processing
  across different deployments.
- **Cross-Network Deployments**: Simplifies deploying subgraphs to multiple blockchain networks by centralizing
  configurations and automating repetitive tasks.
- **Event Handling**: Dynamically generates event handlers based on schema dependencies, reducing the need for manual
  intervention and minimizing errors.
- **Modular Configurations**: Allows for module-specific customizations via `subgraph_config.json`, making the system
  adaptable to various use cases.

## Key Components

- **Event Handling**: Dynamically generates event handlers based on the schema and dependencies specified in the
  configuration files.
- **Version Management**: Handles multiple versions of contracts and ABIs, creating "fake" contracts where necessary to
  ensure all versions are covered.
- **Flexible Deployment**: Supports deployment to different networks, including specialized configurations for networks
  like Mantle.
- **Dependency Resolution**: Utilizes dependency files to map entity models to the required events, ensuring that all
  necessary event handlers are generated.
- **Module Configuration**: Incorporates `subgraph_config.json` for module-specific settings, allowing for flexible and
  targeted subgraph configurations.

## Deployment Steps

1. **Prepare Configuration File**: Create a JSON configuration file that defines your contracts, ABIs, and deployment
   URLs.
2. **Prepare `subgraph_config.json`**: This file should reside in your target module's directory and define the models
   to be imported from the common directory.
3. **Prepare Dependency Files**: Place dependency files in the appropriate directories to map entity models to events.
4. **Run the Script**:

   ```bash
   python scripts/manager.py config_file.json module_name [--create-src] [--deploy]
   ```

   - `config_file.json`: Path to your configuration file.
   - `module_name`: Name of the target module.
   - `--create-src`: (Optional) Generates the source TypeScript files for event handling.
   - `--deploy`: (Optional) Deploys the subgraph after preparation.
5. **Review Output**: The script will generate necessary files and output the deployment status. It's important to
   review the generated files, especially `subgraph.yaml` and `schema.graphql`, to ensure they are correctly configured.

## How It Works (Overview)

1. **Configuration Loading**:

   - The script loads the configuration from a specified JSON file and initializes the deployment process.
2. **Module Preparation**:

   - Combines common models and target module schema into a unified `schema.graphql`.
   - Identifies the events required by the models in the schema based on the dependency files.
   - Copies necessary ABI files to the appropriate locations.
3. **Contract Processing**:

   - Processes each contract, including generating "fake" contracts for missing versions to ensure all versions are
     accounted for.
4. **Subgraph Configuration**:

   - Generates a `subgraph.yaml` file, configuring data sources, event handlers, and mappings for each contract.
5. **Code Generation**:

   - If the `--create-src` flag is used, generates TypeScript source files to handle the events specified in the
     configuration.
6. **Build and Deploy**:

   - Executes `graph codegen` to generate AssemblyScript types and `graph build` to compile the subgraph.
   - If the `--deploy` flag is used, deploys the subgraph to the specified network, with additional options for Mantle
     deployment.
7. **Network-Specific Handling**:

   - The `--mantle` flag enables specialized deployment configurations for the Mantle network, including custom node
     and IPFS endpoints.

## Dependency Files

The script uses dependency files to map entity models to the events they depend on. These files are crucial for ensuring
that all necessary events are captured and processed.

- **Common Dependencies**: Located at `./common/deps_{abi}_{version}.json`.
- **Target Module Dependencies**: Located at `./{target_module}/deps_{abi}_{version}.json`.

### Example of Dependency File:

```json
{
  "Account": [
    "AccountCreated",
    "Deposited"
  ],
  "Position": [
    "PositionOpened",
    "PositionClosed"
  ]
}
```

### How Dependency Files Are Used:

1. The script loads both common and module-specific dependency files.
2. It iterates through all models defined in the schema.
3. For each model, the script determines the events it depends on, based on the dependency files.
4. These events are then used to generate event handlers and configure the subgraph.

## `subgraph_config.json`

This file is central to module-specific configurations and should be placed in the directory of the target module.

### Structure of `subgraph_config.json`:

```json
{
  "importModels": [
    "ModelName1",
    "ModelName2"
  ]
}
```

### How `subgraph_config.json` Is Used:

1. **Model Imports**:

   - The `importModels` array specifies which models should be imported from the common directory into the module's
     schema.
   - These models are included in the final `schema.graphql` file.
2. **Schema Generation**:

   - The script first incorporates the imported models into the `schema.graphql`.
   - Then, it appends the module-specific schema.
3. **Custom Configurations**:

   - The file can be extended to include other settings that customize the subgraph preparation process.

## Detailed Script Workflow

1. **Clean Up**:

   - The script begins by running a cleanup process to remove any old generated files.
2. **Load Configuration**:

   - The JSON configuration file is parsed, and a `Config` object is created to manage the deployment.
3. **Prepare Module**:

   - The `schema.graphql` is generated by combining common models and the target module’s schema.
   - The script identifies all models in the schema and determines the necessary events using the dependency files.
4. **Process Contracts**:

   - Each contract is processed to handle multiple versions, creating "fake" contracts as needed.
   - Event signatures and handler names are generated for each event.
5. **Generate Subgraph Configuration**:

   - A `subgraph.yaml` file is created, detailing the data sources, event handlers, ABIs, and file paths for each
     contract.
6. **Generate Source Files** (if `--create-src` flag is used):

   - TypeScript files (`src_{abi}_{version}.ts`) are generated for each contract version.
   - Import statements and handler functions for each event are created.
7. **Build Subgraph**:

   - `graph codegen` is executed to generate AssemblyScript types.
   - `graph build` compiles the subgraph.
8. **Deploy Subgraph** (if `--deploy` flag is used):

   - The script constructs the deployment command based on the network (including Mantle if specified) and executes the
     `graph deploy` command.

## Troubleshooting

- **Missing Events**: If certain events are not indexed, ensure the dependency files correctly map the events to the
  relevant entities.
- **Schema Errors**: Verify that all models specified in `subgraph_config.json` exist in the common models directory.
- **Deployment Failures**: Double-check network configurations and ensure that the necessary permissions are in place
  for deployment.
- **Version Mismatches**: Confirm that all required contract versions are included in the configuration file.
