#!/bin/bash -e
mkdir -p ./toodle/lib/config/social/

if [ ! -n "$1" ]; then
	echo "Missing gplus key"
	exit 1
elif [ ! -n "$2" ]; then
	echo "Missing gplus secret"
	exit 1
elif [ ! -n "$3" ]; then
	echo "Missing gplus callback"	
	exit 1
else
	GPLUS_KEY=$1;
	GPLUS_SECRET=$2;
	GPLUS_CALLBACK=$3;
	echo "'use strict';

	module.exports = {
    	consumerKey:'${GPLUS_KEY}',
    	consumerSecret:'${GPLUS_SECRET}',
    	callbackURL:'${GPLUS_CALLBACK}'
	};"  >./toodle/lib/config/social/gplusConfig.js 
fi
