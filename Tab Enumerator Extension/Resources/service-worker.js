"use strict";
const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf("Apple") > -1 &&
    navigator.userAgent.indexOf("CriOS") === -1 &&
    navigator.userAgent.indexOf("FxiOS") === -1;

////////////////////////////////////////////////////////////////////////////////
// Helper utilities
////////////////////////////////////////////////////////////////////////////////

function isRestrictedUrl(url) {
    return (
        !url ||
        url.startsWith("chrome://") ||
        url.startsWith("edge://") ||
        url.startsWith("about:") ||
        url.startsWith("safari-web-extension://") ||
        url.startsWith("safari-extension://") ||
        url.startsWith("applewebdata://")
    );
}

function getNumberIconPath(number) {
    if (number === undefined || isSafari) return "";

    return chrome.runtime.getURL(`/images/nums/n${number}.png`);
}

////////////////////////////////////////////////////////////////////////////////
// Message senders
////////////////////////////////////////////////////////////////////////////////

async function handleSetFavicon() {
    const settings = await chrome.storage.sync.get([
        "lasttab-9",
        "favicon-numbers",
        "numbers-timeout",
    ]);
    const forceLastAs9 = settings["lasttab-9"];
    const forceTitleMode = !settings["favicon-numbers"];
    const numbersTimeoutEnabled = settings["numbers-timeout"];
    const tabs = await chrome.tabs.query({ currentWindow: true });

    const tabSignals = [];
    for (const tab of tabs) {
        if (isRestrictedUrl(tab.url)) continue;
        if (tab.index >= 8 && tab.index !== tabs.length - 1) continue;

        let number = tab.index + 1;
        if (forceLastAs9 && tab.index === tabs.length - 1) {
            // lasttab-9: ensure that the last tab is always denoted with 9
            // instead of what it would normally be if less than 9 tabs are open
            number = 9;
        }

        const resource =
            isSafari || forceTitleMode ? "" : getNumberIconPath(number);

        const p = chrome.tabs
            .sendMessage(tab.id, {
                command: "set-favicon",
                resource,
                number,
                forceTitleMode,
            })
            .catch((ex) =>
                console.log(`tab ${tab.id} not ready: ${ex.message}`),
            );

        tabSignals.push(p);
    }

    if (tabSignals.length > 0) {
        await Promise.allSettled(tabSignals);
    }

    if (numbersTimeoutEnabled) {
        // numbers-timeout: ensure that the favicon numbers are restored after 2 seconds
        setTimeout(handleRestoreFavicon, 2000);
    }
}

async function handleRestoreFavicon() {
    const forceTitleMode = !(await chrome.storage.sync.get("favicon-numbers"))[
        "favicon-numbers"
    ];
    const tabs = await chrome.tabs.query({ currentWindow: true });

    const tabSignals = [];
    for (const tab of tabs) {
        const p = chrome.tabs
            .sendMessage(tab.id, {
                command: "restore-favicon",
                forceTitleMode,
            })
            .catch((ex) => console.log(`tab ${tab.id} not ready: ${ex}`));
        tabSignals.push(p);
    }

    if (tabSignals.length > 0) {
        await Promise.allSettled(tabSignals);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Event listeners
////////////////////////////////////////////////////////////////////////////////

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    console.debug("recv: " + JSON.stringify(msg));
    (async () => {
        switch (msg.command) {
            case "set-favicon":
                await handleSetFavicon();
                break;
            case "restore-favicon":
                await handleRestoreFavicon();
                break;
            default:
                console.error("unhandled command:", msg.command);
        }
        sendResponse(true);
    })();

    return true;
});

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        // Set default settings for first install
        await chrome.storage.sync.set({
            "lasttab-9": true,
            "numbers-timeout": false,
            "favicon-numbers": !isSafari,
        });
    }

    console.log("installed");
});
