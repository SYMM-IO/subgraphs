#!/bin/bash -ex
prefix="${1:-symmio}"
for proj in analytics events
do
	python3 manager.py configs/docker.json $proj
	cd $proj
	echo "********** processing $proj **********"
	../manage -cbd $prefix-$proj
	cd ..
done
