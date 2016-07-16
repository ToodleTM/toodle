#!/bin/bash -e
mkdir -p ./toodle/lib/config/social/

if [ ! -n "$1" ]; then
	echo "Missing bnet key"
	exit 1
elif [ ! -n "$2" ]; then
	echo "Missing bnet secret"
	exit 1
elif [ ! -n "$3" ]; then
	echo "Missing bnet callback"	
	exit 1
else
	BNET_KEY=$1;
	BNET_SECRET=$2;
	BNET_CALLBACK=$3;
	echo "'use strict';

	module.exports = {
    	consumerKey:'${BNET_KEY}',
    	consumerSecret:'${BNET_SECRET}',
    	callbackURL:'${BNET_CALLBACK}'
	};" >./toodle/lib/config/social/bnetConfig.js 
fi
