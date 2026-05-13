const isSafari = navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1;

function isRestrictedUrl(url) {
    return !url ||
        url.startsWith('chrome://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.startsWith('safari-web-extension://') ||
        url.startsWith('safari-extension://') ||
        url.startsWith('applewebdata://');
}

function getTabImg(tab) {
    if (tab.index === undefined) return tabFavicon(tab);
    if (isSafari) return '';

    return chrome.runtime.getURL(`/images/nums/n${tab.index + 1}.png`);
}

function tabFavicon(tab) {
    if (tab.favIconUrl) return tab.favIconUrl;
    if (!tab.url || isSafari) return '';

    const raw = chrome.runtime.getURL('/_favicon/');
    if (!raw) return '';

    const url = new URL(raw);
    url.searchParams.set('pageUrl', encodeURIComponent(tab.url));
    return url.href;
}

async function handleSetFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (tab.index >= 8 || tab.index === tabs.length - 1) break;
        if (isRestrictedUrl(tab.url)) continue;

        try {
            await chrome.tabs.sendMessage(tab.id, {
                command: 'set-favicon',
                path: getTabImg(tab),
                number: tab.index + 1
            });
        } catch (e) {
            console.debug(`Tab ${tab.id} not ready:`, e.message);
        }
    }

    const lastTab = tabs[tabs.length - 1];
    if (lastTab && !isRestrictedUrl(lastTab.url)) {
        try {
            await chrome.tabs.sendMessage(lastTab.id, {
                command: 'set-favicon',
                path: getTabImg({ index: 8 }),
                number: 9
            });
        } catch (e) {
            console.debug('Last tab not ready:', e.message);
        }
    }
}

async function handleRestoreFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (tab.index >= 8 || tab.index === tabs.length - 1) break;
        if (isRestrictedUrl(tab.url)) continue;
        
        try {
            await chrome.tabs.sendMessage(tab.id, { command: 'restore-favicon' });
        } catch (e) {
            console.debug(`Tab ${tab.id} not ready:`, e.message);
        }
    }

    const lastTab = tabs[tabs.length - 1];
    if (lastTab && !isRestrictedUrl(lastTab.url)) {
        try {
            await chrome.tabs.sendMessage(lastTab.id, { command: 'restore-favicon' });
        } catch (e) {
            console.debug('Last tab not ready:', e.message);
        }
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('[SW] recv', msg);
    sendResponse({ status: 'Received' });

    (async () => {
        switch (msg.command) {
            case 'set-favicon':
                await handleSetFavicon();
                break;
            case 'restore-favicon':
                await handleRestoreFavicon();
                break;
            default:
                console.debug('Unhandled command:', msg.command);
        }
    })();

    return true; // keep channel open for async
});

chrome.runtime.onInstalled.addListener(() => console.log('[SW] installed'));
