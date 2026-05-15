'use strict';
const isSafari = navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1;

function log(msg) {
    console.log('[Tab Enumerator; worker] ', msg);
}

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
    if (number === undefined || isSafari) return '';

    return chrome.runtime.getURL(`/images/nums/n${number}.png`);
}

async function handleSetFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (isRestrictedUrl(tab.url)) continue;
        if (tab.index >= 8 && tab.index !== tabs.length - 1) continue;

        // Safari does not use the number favicons, so retrieving them is unnecessary
        const path = isSafari ? '' : getNumberIconPath(number);

        // Last tab will always display 9
        const number = (tab.index === tabs.length - 1) ? 9 : tab.index + 1;

        try {
            await chrome.tabs.sendMessage(tab.id, {
                command: 'set-favicon',
                path,
                number
            });
        } catch (ex) {
            log(`tab ${tab.id} not ready: ` + ex.message.toString());
        }
    }
}

async function handleRestoreFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    for (const tab of tabs) {
        if (tab.index >= 8 && tab.index !== tabs.length - 1) continue;

        try {
            await chrome.tabs.sendMessage(tab.id, { command: 'restore-favicon' });
        } catch (ex) {
            log(`tab ${tab.id} not ready:` + ex.message.toString());
        }
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    log('recv: ' + msg);
    (async () => {
        switch (msg.command) {
            case 'set-favicon':
                await handleSetFavicon();
                break;
            case 'restore-favicon':
                await handleRestoreFavicon();
                break;
            default:
                log('unhandled command:', msg.command);
        }
        sendResponse(true);
    })();

    return true;
});

chrome.runtime.onInstalled.addListener(() => log('installed'));
