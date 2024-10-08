#!/bin/bash

VERSION=0.0.1

python scripts/manager.py ./configs/bnb.json events ${VERSION} --deploy
python scripts/manager.py ./configs/base.json events ${VERSION} --deploy
python scripts/manager.py ./configs/blast.json events ${VERSION} --deploy
python scripts/manager.py ./configs/mantle.json events ${VERSION} --deploy
python scripts/manager.py ./configs/mode.json events ${VERSION} --deploy
python scripts/manager.py ./configs/arbitrum.json events ${VERSION} --deploy