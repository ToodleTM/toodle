#!/bin/bash
cp $1/views/index.html $2/index.html
echo " ==> CSS concat"
cat $1/bower_components/bootstrap/dist/css/bootstrap.min.css $3/main.css $1/bower_components/jquery-ui/themes/flick/jquery-ui.min.css > $2/style.css.1
sed "s/\.\.\/fonts/..\/bower_components\/bootstrap\/dist\/fonts/g" $2/style.css.1 > $2/style.css
cp $2/style.css $1/styles/

echo " ==> Regrouping CSS file in a single one"
sed "s/^.*<link rel=\"stylesheet\" href=\"bower_components\/bootstrap\/dist\/css\/bootstrap.min.css\" \/>.*$//g" $2/index.html > $2/index.html.1
sed "s/styles\/main.css/styles\/style.css/g" $2/index.html.1 > $2/index.html.2
sed "s/^.*<link rel=\"stylesheet\" href=\"bower_components\/jquery-ui\/themes\/flick\/jquery-ui.min.css\">.*$//g" $2/index.html.2 > $2/index.html.3

echo " ==> index.html cleanup (non-IE compatibilyty coments and empty lines deleted)"
sed "s/<!-- .*//g" $2/index.html.3 > $2/index.html.4
sed "/^ *$/d" $2/index.html.4 > $2/index.html


cp $2/index.html $1/views/index.html

rm -rf $2/index.html.{1,2,3,4}

