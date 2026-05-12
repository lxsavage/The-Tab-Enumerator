function getTabImg(tab) {
    if (tab.index === undefined) return tabFavicon(tab);
    return chrome.runtime.getURL(`/images/nums/n${tab.index + 1}.png`);
}

function tabFavicon(tab) {
    if (tab.favIconUrl) return tab.favIconUrl;

    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set("pageUrl", encodeURIComponent(tab.url)); // Fixed: tab.url
    return url.href; // Return string, not URL object
}

async function handleSetFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    for (const tab of tabs) {
        if (tab.index >= 8 || tab.index === tabs.length - 1) break;
        if (tab.url?.startsWith('chrome://')) continue; // Skip chrome pages

        try {
            await chrome.tabs.sendMessage(tab.id, {
                command: 'set-favicon',
                path: getTabImg(tab),
                number: tab.index + 1
            });
        } catch (err) {
            console.debug(`Tab ${tab.id} not ready:`, err.message);
        }
    }

    const lastTab = tabs[tabs.length - 1];
    if (lastTab && !lastTab.url?.startsWith('chrome://')) {
        try {
            await chrome.tabs.sendMessage(lastTab.id, {
                command: 'set-favicon',
                path: getTabImg({ index: 8 }),
                number: 9
            });
        } catch (err) {
            console.debug('Last tab not ready:', err.message);
        }
    }
}

async function handleRestoreFavicon() {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    for (const tab of tabs) {
        if (tab.index >= 8 || tab.index === tabs.length - 1) break;
        if (tab.url?.startsWith('chrome://')) continue;

        try {
            await chrome.tabs.sendMessage(tab.id, { command: 'restore-favicon' });
        } catch (err) {
            console.debug(`Tab ${tab.id} not ready:`, err.message);
        }
    }

    const lastTab = tabs[tabs.length - 1];
    if (lastTab && !lastTab.url?.startsWith('chrome://')) {
        try {
            await chrome.tabs.sendMessage(lastTab.id, { command: 'restore-favicon' });
        } catch (err) {
            console.debug('Last tab not ready:', err.message);
        }
    }
}

async function injectContentScript(tab) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['te-content.js']
        });
    } catch (err) {
        console.debug(`Could not inject into tab ${tab.id}:`, err.message);
    }
}

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Installed: ', details.reason);

    if (details.reason === 'install' || details.reason === 'update') {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.url?.startsWith("chrome")) continue;

            await injectContentScript(tab);
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
    sendResponse({ status: 'Received' });

    (async () => {
        try {
            switch (request.command) {
                case 'set-favicon':
                    await handleSetFavicon();
                    break;
                case 'restore-favicon':
                    await handleRestoreFavicon();
                    break;
                default:
                    console.debug('unhandled background command: ', request.command);
            }
        } catch (error) {
            console.debug('[Background] Error:', error);
        }
    })();

    return true;
});

chrome.runtime.onSuspend.addListener(async () => {
    await handleRestoreFavicon();
})
