#
# Build the extension for use on other Manifest V3 browsers
#

# Path to the "Chrome Extension" folder in the project root
BUILD_DIR := $(shell dirname "$(realpath $(MAKEFILE_LIST))")

all: TabEnumerator.zip

clean:
	@-rm TabEnumerator.zip > /dev/null 2>&1

TabEnumerator.zip: resources.zip manifest.json
	@zip -qm $^
	@mv $< $@

	@echo "Created Manifest V3 extension as $@"

resources.zip:
	@-rm "$(BUILD_DIR)/$@" 2>&1
	@cd "$(BUILD_DIR)/../Tab Enumerator Extension/Resources" && \
		zip -qr "$@" . && \
		mv "$@" "$(BUILD_DIR)/$@"

	@echo "Created resource archive"

manifest.json:
	@. "$(BUILD_DIR)/make-manifest.sh" \
		"$(BUILD_DIR)/../Tab Enumerator Extension/Resources/manifest.json" \
		"$(BUILD_DIR)/../Tab Enumerator Extension/Resources/_locales/en/messages.json" \
	 > $@

	@echo "Generated manifest.json"
