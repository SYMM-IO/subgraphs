#!/bin/bash -ex
prefix="${1:-symmio}"
for proj in perps/analytics perps/events
do
	python3 scripts/manager.py configs/perps/docker.json $proj
	# cd $proj
	echo "********** processing $proj **********"
	./scripts/manage -cbd $prefix-$proj
	# cd ..
done
