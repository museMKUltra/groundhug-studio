const DEFAULT_DURATION_MINUTES = 30;
const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 100;
const STEP_MINUTES = 5;

const TICKBUN_URLS = [
    // "http://localhost:5173/*",
    "https://spring-api-starter-production-0867.up.railway.app/*"
];

const ALLOWED_ORIGINS = [
    // "http://localhost:5173",
    "https://spring-api-starter-production-0867.up.railway.app"
];

console.log("TickBun service worker started");


/**
 * Get the current duration setting.
 */
async function getDurationMinutes() {
    const result = await chrome.storage.local.get("durationMinutes");

    return result.durationMinutes ?? DEFAULT_DURATION_MINUTES;
}


/**
 * Save the duration setting.
 */
async function setDurationMinutes(minutes) {
    const value = Math.min(
        MAX_DURATION_MINUTES,
        Math.max(MIN_DURATION_MINUTES, minutes)
    );

    await chrome.storage.local.set({
        durationMinutes: value
    });

    return value;
}


/**
 * Find and focus a TickBun tab.
 */
async function focusTickBun() {
    const tabs = await chrome.tabs.query({
        url: TICKBUN_URLS
    });

    if (tabs.length === 0) {
        return {
            success: false,
            message: "No TickBun tab found."
        };
    }

    // Prefer localhost during development.
    const localhostTab = tabs.find(
        (tab) => tab.url?.startsWith("http://localhost:5173")
    );

    const tab = localhostTab ?? tabs[0];

    if (tab.id === undefined) {
        return {
            success: false,
            message: "TickBun tab has no valid ID."
        };
    }

    await chrome.tabs.update(tab.id, {
        active: true
    });

    // Also focus the browser window containing the tab.
    if (tab.windowId !== undefined) {
        await chrome.windows.update(tab.windowId, {
            focused: true
        });
    }

    return {
        success: true
    };
}


/**
 * Extension installed / updated.
 */
chrome.runtime.onInstalled.addListener(async () => {
    console.log("TickBun extension installed");

    const result = await chrome.storage.local.get("durationMinutes");

    if (result.durationMinutes === undefined) {
        await chrome.storage.local.set({
            durationMinutes: DEFAULT_DURATION_MINUTES
        });
    }
});


/**
 * Messages from popup.js or other extension pages.
 */
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        handleMessage(message, sender)
            .then(sendResponse)
            .catch((error) => {
                console.error("Message handling failed:", error);

                sendResponse({
                    success: false,
                    message: error.message
                });
            });

        return true;
    }
);


/**
 * Messages from the TickBun website.
 *
 * React:
 *
 * chrome.runtime.sendMessage(
 *     EXTENSION_ID,
 *     { type: "GET_TIME_SETTING" },
 *     ...
 * );
 */
chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        const origin = sender.origin;

        if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
            console.warn("Rejected external message from:", origin);

            sendResponse({
                success: false,
                message: "Unauthorized origin."
            });

            return;
        }

        handleMessage(message, sender)
            .then(sendResponse)
            .catch((error) => {
                console.error(
                    "External message handling failed:",
                    error
                );

                sendResponse({
                    success: false,
                    message: error.message
                });
            });

        return true;
    }
);


/**
 * Handle all extension messages.
 */
async function handleMessage(message, sender) {
    switch (message?.type) {
        case "GET_TIME_SETTING": {
            const durationMinutes = await getDurationMinutes();

            return {
                success: true,
                durationMinutes
            };
        }

        case "SET_TIME_SETTING": {
            const durationMinutes = await setDurationMinutes(
                message.durationMinutes
            );

            return {
                success: true,
                durationMinutes
            };
        }

        case "FOCUS_TICKBUN": {
            return await focusTickBun();
        }

        default:
            return {
                success: false,
                message: `Unknown message type: ${message?.type}`
            };
    }
}