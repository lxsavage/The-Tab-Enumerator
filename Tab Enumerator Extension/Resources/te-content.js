// Safari mode: set each tab title "[#] <title>" instead of favicon for numbered
//              tabs due to its favicon caching preventing dynamic updates
const isSafari = navigator.vendor &&
                 navigator.vendor.indexOf('Apple') > -1 &&
                 navigator.userAgent &&
                 navigator.userAgent.indexOf('CriOS') == -1 &&
                 navigator.userAgent.indexOf('FxiOS') == -1;

let loadedOriginalState = false;

////////////////////////////////////////////////////////////////////////////////
// Set tab state implementations
////////////////////////////////////////////////////////////////////////////////
let origTitle = '';

function setTabTitlePrefix(_, tabNum) {
    const shouldFetchOriginalState = !loadedOriginalState;
    loadedOriginalState = true;

    if (shouldFetchOriginalState) origTitle = document.title;

    document.title = `[${tabNum}] ${origTitle}`;
}

function setTabFavicon(resource, tabNum) {
    const shouldFetchOriginalState = !loadedOriginalState;
    loadedOriginalState = true;

    for (const favicon of document.querySelectorAll("link[rel*='icon']")) {
        if (shouldFetchOriginalState)
            origFaviconLinks.push(favicon.cloneNode(true));

        favicon.remove();
    }

    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = resource;
    document.head.appendChild(link);
}

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

const restoreTab = isSafari ? restoreTabTitlePrefix : restoreTabFavicon;

////////////////////////////////////////////////////////////////////////////////
// Event handlers
////////////////////////////////////////////////////////////////////////////////
const isMacOS = window.navigator.userAgentData
    ? window.navigator.userAgentData.platform === 'macOS'
    : /Mac/i.test(window.navigator.userAgent);

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
