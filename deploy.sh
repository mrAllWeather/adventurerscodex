#! /bin/bash

# Deploy AdventurersCodex/charactersheet
# author: Brian Schrader
# since: 2015-12-23

ARCHIVE="project.tar.gz"

set -e;

# Do setup.
npm install;
npm test;

# Archive and remove the project files.
shopt -s extglob
tar --remove-files -zcvf $ARCHIVE !(charactersheet);
shopt -u extglob
rm $ARCHIVE

# Extract the project.
mv ./charactersheet ./deploy

# Delete the temp files.
cp -R ./deploy/* .;
rm -rf deploy*

# Remove Travis file to stop failing master builds.
rm .travis.yml
