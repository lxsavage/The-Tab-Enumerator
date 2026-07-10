#!/usr/bin/env sh

#
# Checks to see if all required build tools are available to make
#

ERROR=0

# this is just kept here for explicit script execution purposes, this will
# always pass in normal use, since this script is invoked by make so it would
# have to be installed
if ! command -v make >/dev/null 2>&1; then
    echo "make not installed! install with \`xcode-select --install\`"
    ERROR=1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "xcode command line tools not installed! install with \`xcode-select --install\`"
    ERROR=1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "jq not installed! install with \`brew install jq\`"
    ERROR=1
fi

exit $ERROR
