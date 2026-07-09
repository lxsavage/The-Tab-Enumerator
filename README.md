
<div align="center">
    <img src="Tab Enumerator Extension/Resources/images/icon-128.png" width="128" height="128" />
</div>
<div align="center">
    <h1>The Tab Enumerator</h1>
    <a href="https://github.com/lxsavage/The-Tab-Enumerator/releases/latest"><img src="https://img.shields.io/github/v/release/lxsavage/The-Tab-Enumerator" alt="Github Release" /></a>
    <a href="https://github.com/lxsavage/The-Tab-Enumerator/issues"><img src="https://img.shields.io/github/issues/lxsavage/The-Tab-Enumerator" alt="Github Issues or Pull Requests" /></a>
    <a href="https://github.com/lxsavage/The-Tab-Enumerator/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-red" alt="License" /></a>
</div>
<br />
<div align="center">
    <a href="https://chromewebstore.google.com/detail/the-tab-enumerator/mjcflllcdepcejfgmgmllholammlbbhj"><img src="docs/assets/available-chrome-webstore-small-border.png" alt="Chrome Webstore link" /></a>
</div>

---

Number your tabs for quick keyboard navigation.


Most modern web browsers provide a keyboard shortcut for `CTRL/CMD + #`, where
`#` is a number from 1 through 9, which will change the tab to the specified tab
index, except for 9, which will point to the last tab. This shortcut is very
useful for speeding up tab switching, but runs into one significant issue: no
numbers are displayed, so to determine which number to press is either a
guessing game, memorization, or one would have to count out the tabs from the
left/right.

This extension adds a binding where whenever the `CTRL/CMD` key is held down,
it will display numbers in place of the favicons (or before the titles) of the
tabs in the current window to denote which tab `CTRL/CMD + #` will switch to.

## Manual Installation

> [!IMPORTANT]
> There are currently no official Safari/Firefox extensions store extensions
> published; these will need to be manually installed from either Releases or a
> manual build following the instructions below. Firefox should mostly be able
> to follow the same instructions for Chrome, since it's also supports loading
> unpacked Manifest V3 extensions.

If using the Chrome release archive (for Chromium/Firefox-based browsers), you
can follow the
[Manifest V3 browser build instructions](#manifest-v3-browsers-chrome-firefox-c)
below, skipping the first step.

If using the Safari release bundle, note that it is not signed and the following
will need to be done to get it to run:

1. Attempt to run it once and see a message stating that it's refusing to open
   due to being unsigned
2. Go into `System Settings>Privacy & Security` and look for a warning about the
   application at the bottom
3. Allow it to run, it will need an admin password for this to be done
4. Rerun the app bundle and proceed as normal from step 7 of the
   [Safari build instructions](#safari).

## Build

### Manifest V3 browsers (Chrome, Firefox, &c.)

1. Run the `mv3` make command (`make mv3`) and find the built extension in
   `dist/TabEnumerator-0.0.0-chrome.zip`
2. Navigate to extensions page
3. Drag and drop the zipped extension into the extensions list (may need to
   enable unsigned extensions)
4. Enable the extension and ensure it has all of its permissions approved (if
   any)

### Safari

1. Run the `safari` make command (`make safari`) and find the built disk image in `dist/TabEnumerator-0.0.0-safari.dmg`
2. Access the exported disk image, then move "The Tab Enumerator.app" to your
   Applications folder
3. Run the app and select "Quit and open safari settings..."
4. Enable "The Tab Enumerator" and ensure it has all of its permissions
   approved for every page

## Additional Information

[Number icons created by Hight Quality Icons - Flaticon](https://www.flaticon.com/free-icon/number-one_3840581)
