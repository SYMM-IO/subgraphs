#!/bin/bash -ex
prefix="${1:-symmio}"
for proj in analytics events
do
	python3 scripts/manager.py configs/docker.json $proj
	cd $proj
	echo "********** processing $proj **********"
	../scripts/manage -cbd $prefix-$proj
	cd ..
done
