#!/bin/bash

sed "s/app.js/app.min.js/" $1/views/index.html > $2/index.html.1
sed "s/<script src=\"scripts\/controllers\/main.js\"><\/script>//" $2/index.html.1 > $2/index.html.2
sed "s/<script src=\"scripts\/utils\/packed.js\"><\/script>//" $2/index.html.2 > $2/index.html.3


CONTROLLERS=`ls $1/scripts/controllers | grep -v main.js`
count=3
for controller in ${CONTROLLERS};do
    countplus=$(( $count + 1 ))
    sed "s/<script src=\"scripts\/controllers\/${controller}\"><\/script>//" $2/index.html.${count} > $2/index.html.${countplus}
    count=$countplus
done

cp $2/index.html.${countplus} $1/views/index.packed.html
for tmpFile in $2/index.html.* ; do
    rm ${tmpFile}
done