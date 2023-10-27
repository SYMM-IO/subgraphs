# Symmio Subgraphs

## Deployment

To deploy Symmio Subgraphs seamlessly, utilize the provided Python script alongside the desired config file.

### Deploying Specific Subgraphs

You can specify which subgraphs to deploy. For example, to deploy only the `main` subgraph:

```bash
python deployer.py configs/bnb_8.json main
```

To deploy both `main` and `parties` subgraphs:

```bash
python deployer.py configs/bnb_8.json main parties
```

### Deploying All Subgraphs

If you want to deploy all subgraphs (`analytics`, `main`, and `parties`):

```bash
python deployer.py configs/bnb_8.json --all
```

**Note**: You must specify at least one subgraph or use the `--all` flag, else the script will not proceed.

## Preparing for Deployment (Without Actual Deployment)

In situations where you wish to have everything set up for deployment but prefer not to deploy it immediately on the hosted service, use the `--prepare-only` flag:

```bash
python deployer.py configs/bnb_8.json --all --prepare-only
```

Or, for specific subgraphs:

```bash
python deployer.py configs/bnb_8.json main parties --prepare-only
```

---