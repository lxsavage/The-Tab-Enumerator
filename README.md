![App Icon](/Tab%20Enumerator%20Extension/Resources/images/icon-128.png)

# The Tab Enumerator

Number your tabs for quick keyboard navigation.

[![GitHub Release](https://img.shields.io/github/v/release/lxsavage/The-Tab-Enumerator)](https://github.com/lxsavage/The-Tab-Enumerator/releases/latest)

## Background

Most modern web browsers provide a keyboard shortcut for `CTRL/CMD + #`, where
`#` is a number from 1 through 9, which will change the tab to the specified tab
index, except for 9, which will point to the last tab. This shortcut is very
useful for speeding up tab switching, but runs into one significant issue: no
numbers are displayed, so to determine which number to press is either a
guessing game, memorization, or one would have to count out the tabs from the
left/right.

## What does this extension do?

This extension adds a binding where whenever the `CTRL/CMD` key is held down,
it will display numbers in place of the favicons (or before the titles) of the
tabs in the current window to denote which tab `CTRL/CMD + #` will switch to.

## Installation

This extension is not currently published on any extension marketplaces, so it
needs to be manually built and installed into your browser of choice.

## Build

### Manifest V3 browsers (Chrome, Firefox, &c.)

1. Run the makefile in the `Chrome Extension/` folder to generate a zipped
   extension
2. Navigate to extensions page
3. Drag and drop the zipped extension into the extensions list (may need to
   enable unsigned extensions)
4. Enable the extension and ensure it has all of its permissions approved (if
   any)

### Safari

1. Open the XCode project
2. Create a product archive (Product>Archive)
3. Select the newly-created archive and select "Distribute App" on the right
   navigation pane
4. Select the "Custom" distribution method
5. Select "Copy App" and save the app in an easily-accessible folder
6. Access the exported folder, then move "The Tab Enumerator.app" to your
   Applications folder
7. Run the app and select "Quit and open safari settings..."
8. Enable "The Tab Enumerator" and ensure it has all of its permissions
   approved (if any)

## Additional Information

[Number icons created by Hight Quality Icons - Flaticon](https://www.flaticon.com/free-icon/number-one_3840581)
