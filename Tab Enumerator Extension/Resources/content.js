const isMacOS = window.navigator.userAgentData
    ? window.navigator.userAgentData.platform === 'macOS'
    : /Mac/i.test(window.navigator.userAgent);

const isSafari = navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1;

// Keep track of if the original state of the title/favicons on the page are
// stored in origTitle/origFaviconLinks for restoring in the future
let loadedOriginalState = false;

////////////////////////////////////////////////////////////////////////////////
// Set tab state implementations
////////////////////////////////////////////////////////////////////////////////
let origTitle = '';

function setTabTitlePrefix(_, tabNum) {
    if (!loadedOriginalState)
        origTitle = document.title;

    loadedOriginalState = true;
    document.title = `[${tabNum}] ${origTitle}`;
}

function setTabFavicon(resource, tabNum) {
    for (const favicon of document.querySelectorAll("link[rel*='icon']")) {
        if (!loadedOriginalState)
            origFaviconLinks.push(favicon.cloneNode(true));

        favicon.remove();
    }

    loadedOriginalState = true;

    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = resource;
    document.head.appendChild(link);
}

// SHIM: prefix title instead of change favicon for Safari to work around its aggressive favicon caching
const setTab = isSafari ? setTabTitlePrefix : setTabFavicon;

////////////////////////////////////////////////////////////////////////////////
// Restore tab state implementations
////////////////////////////////////////////////////////////////////////////////
const origFaviconLinks = [];

function restoreTabTitlePrefix() {
    if (!loadedOriginalState) return;

    document.title = origTitle;
}

function restoreTabFavicon() {
    if (!loadedOriginalState) return;

    for (const link of document.querySelectorAll("link[rel*='icon']")) {
        link.remove();
    }

    for (const link of origFaviconLinks) {
        document.head.appendChild(link);
    }
}

// SHIM: prefix title instead of change favicon for Safari to work around its aggressive favicon caching
const restoreTab = isSafari ? restoreTabTitlePrefix : restoreTabFavicon;

////////////////////////////////////////////////////////////////////////////////
// Event handlers
////////////////////////////////////////////////////////////////////////////////

// SHIM: MacOS has the tab jump shortcut as meta+number instead of ctrl+number
const getModifier = isMacOS
    ? (event => event.key === 'Meta')
    : (event => event.key === 'Control');

document.addEventListener('keydown', evt => {
    if (!getModifier(evt)) return;

    chrome.runtime.sendMessage({command: 'set-favicon' });
});

document.addEventListener('keyup', evt => {
    if (!getModifier(evt)) return;

    chrome.runtime.sendMessage({command: 'restore-favicon'});
});

// HOTFIX: Changing tabs will cause numbers to get stuck on
document.addEventListener('visibilitychange', () => {
    chrome.runtime.sendMessage({command: 'restore-favicon'});
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.command) {
        case 'set-favicon':
            setTab(request.path, request.number);
            break;
        case 'restore-favicon':
            restoreTab();
            break;
        default:
            console.error('[Tab Enumerator] unhandled event: ', request.command);
            break;
    }

    sendResponse(true);
});
