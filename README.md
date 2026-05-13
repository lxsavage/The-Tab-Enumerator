![App Icon](/Tab%20Enumerator%20Extension/Resources/images/icon-128.png)

# The Tab Enumerator

## Background

Most modern web browsers provide a keyboard shortcut for `CTRL/CMD + #`, where
`#` is a number from 1 through 9, which will change the tab to the specified tab
index, except for 9, which will point to the last tab. This shortcut is very
useful for speeding up tab switching, but runs into one significant issue: no
numbers are displayed, so to determine which number to press is either a guessing
game, or one would have to count out the tabs from the left, negating any benefit
the shortcut had.

## What does this extension do?

This extension adds a binding where whenever the `CTRL/CMD` key is held down,
it will display numbers in place of the favicons (or before the titles) of the
tabs in the current window to denote which tab `CTRL/CMD + #` will switch to.

## Installation

TBD; use the Makefile in "Chrome Extension/" to generate the standard Manifest
V3 version of the extension (as a .zip), or build and run the main extension
app to load into Safari, after turning on Developer Mode and enabling unsigned
extensions.
