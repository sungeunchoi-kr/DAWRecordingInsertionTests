#!/bin/bash
VERSION=`npm run env | grep npm_package_version | cut -d '=' -f 2`
echo "Detected version $VERSION from package.json."

INSTALLER_BUILDER_DIR="../muse-mac-installer-builder/macOS-x64"

if [ ! -d "$INSTALLER_BUILDER_DIR" ]; then
    echo "This script requires the 'muse-mac-installer-builder' project to exist on the parent directory." 
    echo "The script will now exit." 
    exit 1
fi

rm -rf $INSTALLER_BUILDER_DIR/installroot/Applications/*.app || { echo 'pack failed.'; exit 1; }
\cp -Rfa ./dist/mac/Muse.app $INSTALLER_BUILDER_DIR/installroot/Applications/Muse.app || { echo 'copy failed.'; exit 1; }

cd "$INSTALLER_BUILDER_DIR"
./build-macos-x64.sh Muse $VERSION

INSTALLER_BUILDER_DIR=`pwd`

echo "Package at $INSTALLER_BUILDER_DIR/target/pkg"
open $INSTALLER_BUILDER_DIR/target/pkg

UPLOAD_PATH='root@chkd.sflx.info:~/muse-download/mac'
read -p "Upload pkg to $UPLOAD_PATH? (y/n) " -n 1 -r

if [[ $REPLY =~ ^[Yy]$ ]]; then
    scp "$INSTALLER_BUILDER_DIR/target/pkg/Muse-macos-installer-x64-${VERSION}.pkg" "$UPLOAD_PATH"
fi
echo ''

