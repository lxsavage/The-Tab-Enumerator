"use strict";
const isMacOS = window.navigator.userAgentData
    ? window.navigator.userAgentData.platform === "macOS"
    : /Mac/i.test(window.navigator.userAgent);

const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf("Apple") > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf("CriOS") == -1 &&
    navigator.userAgent.indexOf("FxiOS") == -1;

// SHIM: Allow support for browsers that don't use the chrome namespace
if (!chrome && browser) chrome = browser;

////////////////////////////////////////////////////////////////////////////////
// Helper utilities
////////////////////////////////////////////////////////////////////////////////

async function getFallbackTabFaviconUrl() {
    const res = await fetch("/favicon.ico");
    if (res.status !== 200) {
        throw new Error(
            "Icon not accessible: returned status code " + res.status,
        );
    }

    const mimeType = res.headers.get("Content-Type");
    if (!mimeType.startsWith("image/")) {
        throw new Error(
            `Icon is not an image according to its MIME type of "${mimeType}"`,
        );
    }

    return {
        faviconCandidate: "/favicon.ico",
        mimeType,
    };
}

////////////////////////////////////////////////////////////////////////////////
// Set tab state implementations
////////////////////////////////////////////////////////////////////////////////

// Keep track of if the original state of the title/favicons on the page are
// stored in origTitle/origFaviconLinks for restoring in the future
let loadedOriginalTitle = false;
let loadedOriginalFavicons = false;

let origTitle = "";
const origFaviconLinks = [];

function setTabTitlePrefix(tabNum) {
    if (!loadedOriginalTitle) origTitle = document.title;

    loadedOriginalTitle = true;
    document.title = `[${tabNum}] ${origTitle}`;
}

async function setTabFavicon(resource) {
    for (const favicon of document.querySelectorAll("link[rel*='icon']")) {
        if (!loadedOriginalFavicons)
            origFaviconLinks.push(favicon.cloneNode(true));

        favicon.remove();
    }

    // HOTFIX: tabs that have favicons set in a nonstandard way will cause the
    // number favicon to stay on
    if (!loadedOriginalFavicons && origFaviconLinks.length === 0) {
        try {
            const { faviconCandidate, mimeType } =
                await getFallbackTabFaviconUrl();

            const faviconShim = document.createElement("link");
            faviconShim.type = mimeType;
            faviconShim.rel = "icon";
            faviconShim.href = faviconCandidate;
            origFaviconLinks.push(faviconShim);
        } catch (ex) {
            console.error(ex);
            return;
        }
    }

    loadedOriginalFavicons = true;

    const link = document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href = resource;
    document.head.appendChild(link);
}

////////////////////////////////////////////////////////////////////////////////
// Restore tab state implementations
////////////////////////////////////////////////////////////////////////////////

function restoreTabTitlePrefix() {
    if (!loadedOriginalTitle) return;

    document.title = origTitle;
    loadedOriginalTitle = false;
}

function restoreTabFavicon() {
    if (!loadedOriginalFavicons) return;

    for (const link of document.querySelectorAll("link[rel*='icon']")) {
        link.remove();
    }

    for (const link of origFaviconLinks) {
        document.head.appendChild(link);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers
////////////////////////////////////////////////////////////////////////////////

// SHIM: MacOS has the tab jump shortcut as meta+number instead of ctrl+number
const getModifier = isMacOS
    ? (event) => event.key === "Meta"
    : (event) => event.key === "Control";

document.addEventListener("keydown", (evt) => {
    if (!getModifier(evt)) return;

    chrome.runtime.sendMessage({ command: "set-favicon" });
});

document.addEventListener("keyup", (evt) => {
    if (!getModifier(evt)) return;

    chrome.runtime.sendMessage({ command: "restore-favicon" });
});

// HOTFIX: Changing tabs will cause numbers to get stuck on
document.addEventListener("visibilitychange", () => {
    chrome.runtime.sendMessage({ command: "restore-favicon" });
});

chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    switch (request.command) {
        case "set-favicon":
            if (isSafari || request.forceTitleMode) {
                setTabTitlePrefix(request.number);
            } else {
                await setTabFavicon(request.resource);
            }
            break;
        case "restore-favicon":
            if (isSafari || request.forceTitleMode) {
                restoreTabTitlePrefix();
            } else {
                restoreTabFavicon();
            }
            break;
        default:
            console.error(
                "[Tab Enumerator] unhandled event: ",
                request.command,
            );
            sendResponse(false);
            break;
    }

    sendResponse(true);
});
