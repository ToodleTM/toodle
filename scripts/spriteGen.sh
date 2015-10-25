#!/bin/bash

rm -rf ../app/images/sprites.png
gulp sprite

sed "s/, )/)/" sprites.scss > sprites_corrected
sed "s/sprites\.png',/\/images\/sprites.png',/" sprites_corrected > ../app/styles/_sprites.scss

mv sprites.png ../app/images/sprites.png
rm -rf sprites.scss sprites_corrected
