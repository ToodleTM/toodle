#!/bin/bash -e

echo "[] Cloning"
./000_clone_master.sh

echo "[] Oauth config generation"
./001_generate_gplus_config.sh foo bar baz
./002_generate_twitter_config.sh gabu zo meu
./003_generate_bnet_config.sh ceci est bnet

echo "[] Uservoice insertion"
./004_insert_uservoice_into_index.sh ./toodle

cd toodle
echo "[] Packaging"
../005_package_for_deploy.sh ./
cd -
echo "[] PM2 config generation"
./006_generate_pm2_config.sh

echo "[] Resources TAR-ing"
./007_tar_resources.sh
