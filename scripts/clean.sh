#! /bin/bash

echo "Cleaning old build files..."
rm -rf ./build
rm -rf ./generated
rm ./schema.graphql
rm ./subgraph.yaml
rm -rf abis/