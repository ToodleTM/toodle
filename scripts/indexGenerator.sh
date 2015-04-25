#!/bin/bash

sed "s/app.js/app.min.js/" $1/views/index.html > $2/index.html.1
sed "s/<script src=\"scripts\/controllers\/main.js\"><\/script>//" $2/index.html.1 > $2/index.html.2
sed "s/<script src=\"scripts\/utils\/packed.js\"><\/script>//" $2/index.html.2 > $2/index.html.3
sed "s/<script src=\"scripts\/controllers\/navbar.js\"><\/script>//" $2/index.html.3 > $2/index.html.4
sed "s/<script src=\"scripts\/controllers\/admin.js\"><\/script>//" $2/index.html.4 > $2/index.html.5
sed "s/<script src=\"scripts\/controllers\/play.js\"><\/script>//" $2/index.html.5 > $2/index.html.6
sed "s/<script src=\"scripts\/controllers\/bracket.js\"><\/script>//" $2/index.html.6 > $2/index.html.7
sed "s/<script src=\"scripts\/controllers\/myTournaments.js\"><\/script>//" $2/index.html.7 > $2/index.html.8

cp $2/index.html.8 $1/views/index.html
rm $2/index.html.{1,2,3,4,5,6,7,8}
