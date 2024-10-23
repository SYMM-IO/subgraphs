import json


def abi_event_to_graphql(abi_event):
    # GraphQL type name is the event name
    graphql_type_name = abi_event["name"]

    # Start the GraphQL type definition
    graphql_model = f"type {graphql_type_name} @entity(immutable: true) {{\n"

    graphql_model += f"  id: ID!\n"

    # Loop over the event's inputs to generate fields
    for input_param in abi_event["inputs"]:
        field_name = input_param["name"]
        field_type = input_param["type"]

        # Map ABI types to GraphQL types
        if field_type == "address":
            graphql_type = "Bytes!"
        elif field_type == "uint256":
            graphql_type = "BigInt!"
        elif field_type == "uint8" or field_type == "int8":
            graphql_type = "Int!"
        elif field_type == "bytes" or field_type == "bytes32":
            graphql_type = "Bytes!"
        else:
            graphql_type = "String!"  # Default for unknown types

        graphql_model += f"  {field_name}: {graphql_type}\n"

    # Adding metadata fields common to all events
    graphql_model += "  blockNumber: BigInt!\n"
    graphql_model += "  blockTimestamp: BigInt!\n"
    graphql_model += "  transactionHash: Bytes!\n"
    graphql_model += "  logIndex: BigInt!\n"
    graphql_model += "  blockHash: Bytes!\n"

    # End of type definition
    graphql_model += "}\n"

    return graphql_model


with open("../configs/abis/symmio_0_8_2.json", "r") as f:
    ABI = json.load(f)

for item in ABI:
    if item["type"] == "event":
        graphql_model = abi_event_to_graphql(item)
        print(graphql_model)


# for item in ABI:
#     if item["type"] == "event":
#         print(f"\"{item["name"]}\" : [\"{item["name"]}\"],")
