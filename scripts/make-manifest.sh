#!/usr/bin/env sh

#
# Creates a manifest JSON based on the manifest.json template and the
# messages.json passed in.
# - Note: requires `jq` to be installed and on path
#
# Args:
# - 1: manifest.json path
# - 2: messages.json path (for name/description subs)
#

LOCALE_MESSAGES=$(cat "$2")
MSG_TITLE=$(echo "$LOCALE_MESSAGES" | jq -r '.extension_name.message')
MSG_DESC=$(echo "$LOCALE_MESSAGES" | jq -r '.extension_description.message')

cat "$1" \
| jq "(..|strings) |= (                                         \
        gsub(\"__MSG_extension_name__\";\"${MSG_TITLE}\") |     \
        gsub(\"__MSG_extension_description__\";\"${MSG_DESC}\") \
      )"
