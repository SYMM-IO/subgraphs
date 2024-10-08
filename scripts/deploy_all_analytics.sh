#!/bin/bash

VERSION=0.0.10

python scripts/manager.py ./configs/fantom_just_8_0.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/base_just_8_0.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/bnb_just_8_0.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/bnb.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/base.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/blast.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/mantle.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/mode.json analytics ${VERSION} --deploy
python scripts/manager.py ./configs/arbitrum.json analytics ${VERSION} --deploy