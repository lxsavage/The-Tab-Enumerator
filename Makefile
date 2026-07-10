#
# Build Manifest V3 and Safari versions of The Tab Enumerator
#
ROOT_DIR := $(shell dirname "$(realpath $(MAKEFILE_LIST))")

all: clean mv3 safari

clean:
	rm -rf dist/
	rm -rf build/

mv3: check-requirements $(ROOT_DIR)/dist/TabEnumerator-0.0.0-chrome.zip

safari: check-requirements $(ROOT_DIR)/dist/TabEnumerator-0.0.0-safari.dmg

check-requirements:
	. "$(ROOT_DIR)/scripts/check-requirements.sh"

$(ROOT_DIR)/dist/TabEnumerator-0.0.0-safari.dmg: $(ROOT_DIR)/build/safariext.xcarchive
	@mkdir -p $(ROOT_DIR)/build/safariimg/
	cp -r "$(ROOT_DIR)/build/safariext.xcarchive/Products/Applications/The Tab Enumerator.app" $(ROOT_DIR)/build/safariimg/
	ln -s /Applications "$(ROOT_DIR)/build/safariimg/Applications"

	@mkdir -p $(ROOT_DIR)/dist/
	hdiutil create -volname "The Tab Enumerator" -srcfolder $(ROOT_DIR)/build/safariimg/ $@
	@rmdir -p $(ROOT_DIR)/build/safariimg/

$(ROOT_DIR)/dist/TabEnumerator-0.0.0-chrome.zip: $(ROOT_DIR)/build/resources.zip
	@mkdir -p $(ROOT_DIR)/dist/
	mv $< $@
	@echo "Created Manifest V3 extension as $@"

$(ROOT_DIR)/build/safariext.xcarchive:
	xcodebuild -project "Tab Enumerator.xcodeproj" -scheme "Tab Enumerator" clean archive -configuration release -archivePath $@

$(ROOT_DIR)/build/resources.zip: $(ROOT_DIR)/build/manifest.json
	@mkdir -p $(ROOT_DIR)/build/
	cd "$(ROOT_DIR)/Tab Enumerator Extension/Resources" && zip -qr "$@" .
	zip -qjm $@ $^
	@echo "Created resource archive"

$(ROOT_DIR)/build/manifest.json:
	@mkdir -p $(ROOT_DIR)/build/
	. "$(ROOT_DIR)/scripts/make-manifest.sh" \
		"$(ROOT_DIR)/Tab Enumerator Extension/Resources/manifest.json" \
		"$(ROOT_DIR)/Tab Enumerator Extension/Resources/_locales/en/messages.json" \
	 > $@
	@echo "Generated manifest.json"
