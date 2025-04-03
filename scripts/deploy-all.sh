#!/bin/bash -ex
prefix="${1:-symmio}"
for proj in analytics events; do
	python3 scripts/manager.py configs/perps/docker.json perps/$proj
	# cd $proj
	echo "********** processing perps/$proj **********"
	./scripts/manage -cbd $prefix-perps/$proj
	# cd ..
done
