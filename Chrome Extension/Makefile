#
# Build the extension for use on other Manifest V3 browsers
#

# Path to the "Chrome Extension" folder in the project root
BUILD_DIR := $(shell dirname "$(realpath $(MAKEFILE_LIST))")

all: TabEnumerator.zip

clean:
	-rm TabEnumerator.zip

TabEnumerator.zip: resources.zip manifest.json
	zip -m $^
	mv $< $@

resources.zip:
	cd "$(BUILD_DIR)/../Tab Enumerator Extension/Resources" && \
	zip -r "$@" . && \
	mv "$@" "$(BUILD_DIR)/$@"

manifest.json:
	@. "$(BUILD_DIR)/make-manifest.sh" \
		"$(BUILD_DIR)/../Tab Enumerator Extension/Resources/manifest.json" \
		"$(BUILD_DIR)/../Tab Enumerator Extension/Resources/_locales/en/messages.json" \
	 > $@
