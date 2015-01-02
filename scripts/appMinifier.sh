#!/bin/bash

echo " ==> Concatenating controllers and removing 'use strict' refs"
cat $1/scripts/controllers/*.js $1/scripts/utils/packed.js > $2/controllers.js
sed "s/^'use strict';//g" $2/controllers.js > $2/controllers-clean.js

echo " ==> Concat the main app on top of concatenated controllers"
cat $1/scripts/app.js $2/controllers-clean.js > $2/app.js

echo " ==> Annotate before minification"
ng-annotate -a $2/app.js > $2/app-annotated.js

echo " ==> Minify JS"
java -jar $3/compiler.jar --js $2/app-annotated.js --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file $1/scripts/app.min.js
