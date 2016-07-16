#!/bin/bash -e

if [ ! -n "$1" ]; then
	echo "No destination set for package"
	exit 1
fi

./scripts/appPackager.sh $1
