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

function getNumberIconPath(number) {
    if (number === undefined) return tabFavicon(tab);
    if (isSafari) return '';

    return chrome.runtime.getURL(`/images/nums/n${number}.png`);
}

async function handleSetFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (isRestrictedUrl(tab.url)) continue;
        if (tab.index >= 8 && tab.index !== tabs.length - 1) continue;

        // Last tab will always display 9
        const number = (tab.index === tabs.length - 1)
            ? 9
            : tab.index + 1;

        try {
            await chrome.tabs.sendMessage(tab.id, {
                command: 'set-favicon',
                path: getNumberIconPath(number),
                number
            });
        } catch (e) {
            console.debug(`Tab ${tab.id} not ready:`, e.message);
        }
    }
}

async function handleRestoreFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (tab.index >= 8 && tab.index !== tabs.length - 1) continue;

        try {
            await chrome.tabs.sendMessage(tab.id, { command: 'restore-favicon' });
        } catch (e) {
            console.debug(`Tab ${tab.id} not ready:`, e.message);
        }
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('[SW] recv', msg);
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
