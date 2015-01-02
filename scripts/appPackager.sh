#!/bin/bash

TARGET=../dist
compass compile
duo app/scripts/utils/pack.js > app/scripts/utils/packed.js

function minifyAppAndGenerateIndex {
    mkdir .minifyTmp
    echo "Minifying the app"
    ./scripts/appMinifier.sh ./app ./.minifyTmp ./scripts
    echo "Generating index to use the minified app"
    ./scripts/indexGenerator.sh ./app ./.minifyTmp
    rm -rf .minifyTmp
}

function copyAppSource {
    cd app/
    rm -rf "$TARGET"
    for dirToCreate in config i18n images styles views/resources views/maintenance scripts; do
        mkdir -p $TARGET/app/$dirToCreate
    done
    echo "Copying app source files ..."
    for pattern in *.{ico,txt} .htaccess i18n/*.json images/*.png scripts/app.min.js views/index.html views/404.html views/partials views/resources/factions.json views/maintenance/index.html config/piwik.config.js ; do
        echo "copying $pattern to $TARGET/app/$pattern"
        cp -r $pattern $TARGET/app/$pattern
    done
    cp ../.sass-tmp/main.css $TARGET/app/styles/
    echo "...done"
}

function copyServerSource {
    echo "Copying server source files ..."
    mkdir -p $TARGET/lib/gameRules
    for pattern in {package,bower}.json .bowerrc server.js lib/config lib/controllers lib/gameRules/singleElim.js lib/models lib/service lib/utils lib/{middleware,routes}.js; do
        echo "copying ../$pattern to $TARGET/$pattern"
        cp -r ../$pattern $TARGET/$pattern
    done
    echo "...done"
}

function cleanup {
    echo "Cleaning up"
    rm -f $TARGET/app/scripts/utils/pack.js
    find $TARGET -name .gitignore -exec rm {} \;
}

function copySource {
    minifyAppAndGenerateIndex
    copyAppSource
    copyServerSource
    cleanup
}

copySource