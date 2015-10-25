#!/bin/bash

TMP_DIR=$1
OUT_ROOT=$2

rm -rf ${OUT_ROOT}/images/sprites.png
SPRITE_TMP=${TMP_DIR} SPRITE_ROOT=${OUT_ROOT} gulp --gulpfile=./scripts/gulpfile.js sprite

sed "s/, )/)/" ${TMP_DIR}/sprites.scss > ${TMP_DIR}/sprites_corrected
sed "s/sprites\.png',/\/images\/sprites.png',/" ${TMP_DIR}/sprites_corrected > ${OUT_ROOT}/styles/_sprites.scss

mv ${TMP_DIR}/sprites.png ${OUT_ROOT}/images/sprites.png
rm -rf ${TMP_DIR}/sprites.scss ${TMP_DIR}/sprites_corrected
