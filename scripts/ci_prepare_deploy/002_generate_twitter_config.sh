#!/bin/bash -e
mkdir -p ./toodle/lib/config/social/

if [ ! -n "$1" ]; then
	echo "Missing twitter key"
	exit 1
elif [ ! -n "$2" ]; then
	echo "Missing twitter secret"
	exit 1
elif [ ! -n "$3" ]; then
	echo "Missing twitter callback"	
	exit 1
else
	TWITTER_KEY=$1;
	TWITTER_SECRET=$2;
	TWITTER_CALLBACK=$3;
	echo "'use strict';

	module.exports = {
    	consumerKey:'${TWITTER_KEY}',
    	consumerSecret:'${TWITTER_SECRET}',
    	callbackURL:'${TWITTER_CALLBACK}'
	};" >./toodle/lib/config/social/twitterConfig.js 
fi
