# Symmio Subgraphs

## Deployment

To deploy Symmio Subgraphs seamlessly, utilize the provided Python script alongside the desired config file.

```bash
python deployer.py configs/bnb_8.json
```

## Preparing for Deployment (Without Actual Deployment)

In situations where you wish to have everything set up for deployment but prefer not to deploy it immediately on the
hosted service, use the `--prepare-only` flag:

```bash
python deployer.py configs/bnb_8.json --prepare-only
```