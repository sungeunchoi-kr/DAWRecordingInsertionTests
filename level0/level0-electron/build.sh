#!/bin/bash
# hotfix naudiodon
# ref: <https://github.com/Streampunk/naudiodon/issues/31>
cp ./assets/binding.gyp ./node_modules/naudiodon/binding.gyp

# build
react-scripts build
