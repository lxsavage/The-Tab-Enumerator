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

const Helpers = (() => {
    // HOTFIX: prevent pollution of console in the case of the favicon not being
    // accessible
    let fallbackFaviconAccessible = true;
    async function getFallbackTabFaviconUrl() {
        if (!fallbackFaviconAccessible) throw new Error("404");

        const res = await fetch("/favicon.ico");
        if (!res.ok) {
            fallbackFaviconAccessible = false;
            throw new Error(res.status);
        }

        const mimeType = res.headers.get("Content-Type");
        if (!mimeType?.startsWith("image/")) {
            throw new Error(
                `Icon is not an image according to its MIME type of "${mimeType}"`,
            );
        }

        return {
            faviconCandidate: "/favicon.ico",
            mimeType,
        };
    }

    // SHIM: MacOS has the tab jump shortcut as meta+number instead of ctrl+number
    function getModifier(evt) {
        return isMacOS ? evt.key === "Meta" : evt.key === "Control";
    }

    return {
        getFallbackTabFaviconUrl,
        getModifier,
    };
})();

////////////////////////////////////////////////////////////////////////////////
// Set tab state implementations
////////////////////////////////////////////////////////////////////////////////

// namespace
const FaviconManager = (() => {
    let origTitle = "";
    let loadedOriginalTitle = false;

    let feat_faviconnumbers_loadedOriginalFavicons = false;
    const feat_faviconnumbers_origFaviconLinks = [];

    let featexp_refswap_enabled = false;
    const featexp_refswap_modifiedLinks = [];

    function init() {
        try {
            chrome.storage.sync.get("exp-refswap", (res) => {
                featexp_refswap_enabled = !!res["exp-refswap"];
            });
        } catch (e) {
            featexp_refswap_enabled = false;
        }

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== "sync") return;

            // Experimental features
            if ("exp-refswap" in changes) {
                const newVal = !!changes["exp-refswap"].newValue;
                const oldVal = !!changes["exp-refswap"].oldValue;
                featexp_refswap_enabled = newVal;

                if (oldVal && !newVal) {
                    try {
                        restoreTabFavicon();
                    } catch (ex) {
                        console.error(
                            "[Tab Enumerator] restore failed after exp-refswap toggle:",
                            ex,
                        );
                    }
                }
            }
        });
    }

    function setTitlePrefix(tabNum) {
        if (!loadedOriginalTitle) origTitle = document.title;
        loadedOriginalTitle = true;
        document.title = `[${tabNum}] ${origTitle}`;
    }

    function restoreTitlePrefix() {
        if (!loadedOriginalTitle) return;
        document.title = origTitle;
        loadedOriginalTitle = false;
    }

    async function setFavicon(resource) {
        if (featexp_refswap_enabled) {
            const existingNodes = Array.from(
                document.querySelectorAll("head link[rel*='icon']"),
            );
            if (existingNodes.length > 0) {
                if (!feat_faviconnumbers_loadedOriginalFavicons) {
                    for (const f of existingNodes) {
                        feat_faviconnumbers_origFaviconLinks.push(
                            f.cloneNode(true),
                        );
                    }
                    feat_faviconnumbers_loadedOriginalFavicons = true;
                }

                // Replace href/type/rel on all existing favicon link elements,
                // recording their original attributes so we can restore later.
                featexp_refswap_modifiedLinks.length = 0;
                for (const el of existingNodes) {
                    featexp_refswap_modifiedLinks.push({
                        el,
                        href: el.getAttribute("href"),
                        rel: el.getAttribute("rel"),
                        type: el.getAttribute("type"),
                    });

                    try {
                        el.setAttribute("type", "image/png");
                        el.setAttribute("rel", "icon");
                        el.setAttribute("href", resource);
                    } catch (ex) {
                        console.error(
                            "[Tab Enumerator] in-place favicon update failed for an element:",
                            ex,
                        );
                        // Continue with other elements; don't abort.
                    }
                }

                return;
            }
        }

        // Default: remove and append
        for (const favicon of document.querySelectorAll("link[rel*='icon']")) {
            if (!feat_faviconnumbers_loadedOriginalFavicons)
                feat_faviconnumbers_origFaviconLinks.push(
                    favicon.cloneNode(true),
                );
            favicon.remove();
        }

        if (
            !feat_faviconnumbers_loadedOriginalFavicons &&
            feat_faviconnumbers_origFaviconLinks.length === 0
        ) {
            try {
                const { faviconCandidate, mimeType } =
                    await Helpers.getFallbackTabFaviconUrl();
                const faviconShim = document.createElement("link");
                faviconShim.type = mimeType;
                faviconShim.rel = "icon";
                faviconShim.href = faviconCandidate;
                feat_faviconnumbers_origFaviconLinks.push(faviconShim);
            } catch (ex) {
                if (!ex?.message?.includes("404")) console.error(ex);
                return;
            }
        }

        feat_faviconnumbers_loadedOriginalFavicons = true;
        const link = document.createElement("link");
        link.type = "image/png";
        link.rel = "icon";
        link.href = resource;
        document.head.appendChild(link);
    }

    function restoreFavicon() {
        if (
            featexp_refswap_modifiedLinks &&
            featexp_refswap_modifiedLinks.length > 0
        ) {
            for (const m of featexp_refswap_modifiedLinks) {
                try {
                    if (document.contains(m.el)) {
                        if (m.href !== null) m.el.setAttribute("href", m.href);
                        else m.el.removeAttribute("href");

                        if (m.rel !== null) m.el.setAttribute("rel", m.rel);
                        else m.el.removeAttribute("rel");

                        if (m.type !== null) m.el.setAttribute("type", m.type);
                        else m.el.removeAttribute("type");
                    } else {
                        for (const link of feat_faviconnumbers_origFaviconLinks)
                            document.head.appendChild(link.cloneNode(true));
                    }
                } catch (ex) {
                    console.error(
                        "[Tab Enumerator] failed to restore modified link:",
                        ex,
                    );
                }
            }

            featexp_refswap_modifiedLinks.length = 0;
            feat_faviconnumbers_loadedOriginalFavicons = false;
            return;
        }

        if (!feat_faviconnumbers_loadedOriginalFavicons) return;
        for (const link of document.querySelectorAll("link[rel*='icon']"))
            link.remove();
        for (const link of feat_faviconnumbers_origFaviconLinks)
            document.head.appendChild(link);
    }

    return {
        init,
        setTabTitlePrefix: setTitlePrefix,
        restoreTabTitlePrefix: restoreTitlePrefix,
        setTabFavicon: setFavicon,
        restoreTabFavicon: restoreFavicon,
    };
})();

////////////////////////////////////////////////////////////////////////////////
// Event handlers
////////////////////////////////////////////////////////////////////////////////

document.addEventListener("keydown", (evt) => {
    if (!Helpers.getModifier(evt)) return;

    chrome.runtime.sendMessage({ command: "set-favicon" });
});

document.addEventListener("keyup", (evt) => {
    if (!Helpers.getModifier(evt)) return;

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
                FaviconManager.setTabTitlePrefix(request.number);
            } else {
                await FaviconManager.setTabFavicon(request.resource);
            }
            break;
        case "restore-favicon":
            if (isSafari || request.forceTitleMode) {
                FaviconManager.restoreTabTitlePrefix();
            } else {
                FaviconManager.restoreTabFavicon();
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

// HOTFIX: opening a new tab causes the tab numbers to lock "on" until CMD/CTRL
// is pressed again
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ command: "restore-favicon" });
});

////////////////////////////////////////////////////////////////////////////////
// Direct invocations (fire-and-forget calls that should run at script load)
////////////////////////////////////////////////////////////////////////////////

// Initialize modules that need to observe storage or set up state
try {
    FaviconManager.init();
} catch (ex) {
    console.error("[Tab Enumerator] failed to init FaviconManager:", ex);
}
