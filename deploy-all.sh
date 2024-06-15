#!/bin/bash -ex
python3 confgen.py configs/docker.json
prefix="${1:-symmio}"
for proj in main parties fundingrate events analytics
do
	(
		cd $proj
		echo "********** processing $proj **********"
		../manage -cbd $prefix-$proj
	)
done
