#!/bin/bash

TARGET=../dist
compass compile
./node_modules/duo/bin/duo app/scripts/utils/pack.js -S > app/scripts/utils/packed.js

function minifyAppAndGenerateIndex {
    mkdir .minifyTmp
    echo "Minifying the app"
    ./scripts/appMinifier.sh ./app ./.minifyTmp $1 || exit 1
    echo "Generating index to use the minified app"
    ./scripts/indexGenerator.sh ./app ./.minifyTmp || exit 1
    echo "CSS minification + regrouping"
    ./scripts/cssConcat.sh ./app ./.minifyTmp ./.sass-tmp || exit 1
    echo "Generate spritesheet + associated SCSS config"
    ./scripts/spriteGen.sh ./.minifyTmp ./app || exit 1
    rm -rf .minifyTmp
}

function copyAppSource {
    cd app/
    rm -rf "$TARGET"
    for dirToCreate in config i18n images styles views/resources views/maintenance scripts; do
        mkdir -p ${TARGET}/app/${dirToCreate}
    done
    echo "Copying app source files ..."
    for pattern in *.{ico,txt} .htaccess i18n/* images/*.png images/whatsnew images/toodle.png images/toodle_simple.png images/flags images/people images/social scripts/app.min.js views/index.packed.html views/404.html views/partials views/resources/factions.json views/maintenance/index.html config/stat.config.js ; do
        echo "copying $pattern to $TARGET/app/$pattern"
        cp -r $pattern ${TARGET}/app/${pattern}
    done
    mv ${TARGET}/app/views/index.{packed.,}html
    cp styles/style.css ${TARGET}/app/styles/
    echo "...done"
}

function copyServerSource {
    echo "Copying server source files ..."
    mkdir -p $TARGET/lib/engines
    for pattern in {package,bower}.json .bowerrc server.js lib/{config,controllers,routes,models,service,utils} lib/engines/{singleElim,simpleGSLGroups}.js lib/middleware.js; do
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
    minifyAppAndGenerateIndex $1
    copyAppSource
    copyServerSource
    cleanup
}

copySource $1
