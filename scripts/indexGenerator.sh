#!/bin/bash
APP_DIR=$1
OUTPUT_DIR=$2

sed "s/app.js/app.min.js/" ${APP_DIR}/views/index.html > ${OUTPUT_DIR}/index.html.1
sed "s/<script src=\"scripts\/controllers\/main.js\"><\/script>//" ${OUTPUT_DIR}/index.html.1 > ${OUTPUT_DIR}/index.html.2
sed "s/<script src=\"scripts\/utils\/packed.js\"><\/script>//" ${OUTPUT_DIR}/index.html.2 > ${OUTPUT_DIR}/index.html.3


CONTROLLERS=`ls ${APP_DIR}/scripts/controllers | grep -v main.js`
count=3
for controller in ${CONTROLLERS};do
    countplus=$(( $count + 1 ))
    sed "s/<script src=\"scripts\/controllers\/${controller}\"><\/script>//" ${OUTPUT_DIR}/index.html.${count} > ${OUTPUT_DIR}/index.html.${countplus}
    count=$countplus
done

cp ${OUTPUT_DIR}/index.html.${countplus} ${APP_DIR}/views/index.packed.html
for tmpFile in ${OUTPUT_DIR}/index.html.* ; do
    rm ${tmpFile}
done