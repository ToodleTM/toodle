#!/bin/bash -e

echo "TAR-ing modules"
tar -czf ./node_modules.tar.gz toodle/node_modules/
echo "TAR-ing bower stuff"
tar -czf ./bower_components.tar.gz toodle/app/bower_components/
