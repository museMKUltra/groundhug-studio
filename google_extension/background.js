/**
 * TickBun service worker.
 *
 * The extension owns reminder scheduling. The web app reports timer
 * lifecycle (start / finish), and this worker persists the state in
 * chrome.storage.local, schedules a chrome.alarms alarm for the deadline,
 * focuses a TickBun tab and sends TIME_UP when the deadline is reached.
 *
 * Reminder semantics:
 *   The duration is measured as total elapsed time since clock-in
 *   (`startedAt`), matching the "Duration" shown by the web app.
 *   deadline = startedAt + durationMinutes.
 *
 * Duration changes (popup or web app):
 *   - The deadline is recalculated from the original clock-in time.
 *   - If the new deadline has already passed and the reminder has not
 *     triggered yet, the reminder triggers immediately.
 *   - If the reminder already triggered and the new deadline is in the
 *     future, the reminder is re-armed (the user extended the duration).
 *   - If the reminder already triggered and the new deadline is also in
 *     the past, nothing happens (no duplicate reminder).
 */

import {clampDuration, DEFAULT_DURATION_MINUTES} from "./duration.js";

/**
 * Trusted TickBun web origins.
 * Keep in sync with "externally_connectable" in manifest.json.
 */
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    // "https://<production-web-app-origin>"
];

const TICKBUN_URLS = ALLOWED_ORIGINS.map((origin) => `${origin}/*`);

const STATE_KEY = "reminderState";
const DURATION_KEY = "durationMinutes";
const ALARM_PREFIX = "tickbun-reminder:";
const NOTIFICATION_ID = "tickbun-time-up";

/** An alarm may fire slightly before the deadline; tolerate this much. */
const EARLY_FIRE_TOLERANCE_MS = 1000;

const INITIAL_STATE = {
    sessionId: null,
    status: "IDLE", // "IDLE" | "RUNNING" | "FINISHED"
    startedAt: null,
    deadline: null,
    reminderEnabled: true,
    reminderTriggered: false,
    reminderAcknowledged: false,
    targetTabId: null
};

console.log("TickBun service worker started");


/* ------------------------------------------------------------------ */
/* Serialization                                                       */
/* ------------------------------------------------------------------ */

let queue = Promise.resolve();

/**
 * Run state mutations one at a time so that concurrent events
 * (alarm, storage change, messages) cannot interleave read-modify-write.
 */
function runExclusive(task) {
    const result = queue.then(task);
    queue = result.catch(() => undefined);
    return result;
}


/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

async function getDurationMinutes() {
    const result = await chrome.storage.local.get(DURATION_KEY);

    return result[DURATION_KEY] ?? DEFAULT_DURATION_MINUTES;
}

async function setDurationMinutes(minutes) {
    const value = clampDuration(minutes);

    await chrome.storage.local.set({[DURATION_KEY]: value});

    return value;
}

async function loadState() {
    const result = await chrome.storage.local.get(STATE_KEY);

    return {...INITIAL_STATE, ...result[STATE_KEY]};
}

async function saveState(state) {
    await chrome.storage.local.set({[STATE_KEY]: state});
}

/**
 * State exposed to the web app.
 */
async function toPublicState(state) {
    return {
        sessionId: state.sessionId,
        status: state.status,
        durationMinutes: await getDurationMinutes(),
        startedAt: state.startedAt,
        deadline: state.deadline,
        reminderEnabled: state.reminderEnabled,
        reminderTriggered: state.reminderTriggered,
        reminderAcknowledged: state.reminderAcknowledged
    };
}


/* ------------------------------------------------------------------ */
/* Connected pages                                                     */
/* ------------------------------------------------------------------ */

/** @type {Set<chrome.runtime.Port>} */
const ports = new Set();

function postToPort(port, message) {
    try {
        port.postMessage(message);
    } catch (error) {
        console.warn("Failed to post to port, removing it:", error);
        ports.delete(port);
    }
}

function broadcast(message) {
    for (const port of ports) {
        postToPort(port, message);
    }
}

async function broadcastState(type, state) {
    broadcast({type, state: await toPublicState(state)});
}


/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

async function getTickBunTabs() {
    return chrome.tabs.query({url: TICKBUN_URLS});
}

async function tabExists(tabId) {
    if (tabId === null || tabId === undefined) {
        return false;
    }

    const tabs = await getTickBunTabs();

    return tabs.some((tab) => tab.id === tabId);
}

/**
 * Pick the tab that should show the reminder.
 *
 * 1. The session's target tab (the tab that started it), if still open.
 * 2. Otherwise the most recently accessed TickBun tab (lowest id on ties).
 */
async function resolveTargetTab(state) {
    const tabs = (await getTickBunTabs())
        .filter((tab) => tab.id !== undefined);

    const target = tabs.find((tab) => tab.id === state.targetTabId);

    if (target) {
        return target;
    }

    tabs.sort((a, b) =>
        (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0) || a.id - b.id
    );

    return tabs[0] ?? null;
}

async function focusTab(tab) {
    await chrome.tabs.update(tab.id, {active: true});

    if (tab.windowId !== undefined) {
        await chrome.windows.update(tab.windowId, {focused: true});
    }
}

async function showNotification(durationMinutes) {
    await chrome.notifications.create(NOTIFICATION_ID, {
        type: "basic",
        iconUrl: "icon.png",
        title: "Time's up!",
        message: `You've been focusing for ${durationMinutes} minutes. It's time to take a break.`,
        priority: 2
    });
}


/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

async function clearReminderAlarms() {
    const alarms = await chrome.alarms.getAll();

    await Promise.all(
        alarms
            .filter((alarm) => alarm.name.startsWith(ALARM_PREFIX))
            .map((alarm) => chrome.alarms.clear(alarm.name))
    );
}

/**
 * Recompute the deadline and (re)create the alarm.
 * Triggers the reminder immediately when the deadline has already passed.
 * Must be called inside runExclusive.
 */
async function reschedule(state) {
    await clearReminderAlarms();

    if (state.status !== "RUNNING" || state.startedAt === null) {
        state.deadline = null;
        await saveState(state);
        return state;
    }

    const durationMinutes = await getDurationMinutes();
    state.deadline = state.startedAt + durationMinutes * 60_000;

    const isDue = state.deadline <= Date.now();

    // The user extended the duration after the reminder fired: re-arm it.
    if (state.reminderTriggered && !isDue) {
        state.reminderTriggered = false;
        state.reminderAcknowledged = false;
    }

    await saveState(state);

    if (!state.reminderEnabled || state.reminderTriggered) {
        return state;
    }

    if (isDue) {
        return triggerReminder(state);
    }

    await chrome.alarms.create(`${ALARM_PREFIX}${state.sessionId}`, {
        when: state.deadline
    });

    return state;
}

/**
 * Mark the reminder as triggered, focus the target tab and send TIME_UP.
 * Must be called inside runExclusive.
 */
async function triggerReminder(state) {
    if (state.reminderTriggered) {
        return state;
    }

    // Persist first so duplicate alarms / restarts cannot fire twice.
    state.reminderTriggered = true;
    state.reminderAcknowledged = false;

    const tab = await resolveTargetTab(state);
    state.targetTabId = tab?.id ?? null;

    await saveState(state);

    const publicState = await toPublicState(state);

    if (!tab) {
        await showNotification(publicState.durationMinutes).catch((error) =>
            console.error("Failed to show notification:", error)
        );
    } else {
        await focusTab(tab).catch((error) =>
            console.error("Failed to focus TickBun tab:", error)
        );
    }

    // Only the target tab opens the dialog; others just update state.
    for (const port of ports) {
        const isTarget = port.sender?.tab?.id === state.targetTabId;

        postToPort(port, isTarget
            ? {type: "TIME_UP", sessionId: state.sessionId, state: publicState}
            : {type: "TIMER_STATE_CHANGED", state: publicState}
        );
    }

    return state;
}

/**
 * Reconcile persisted state with registered alarms.
 * Runs whenever the service worker starts (incl. browser startup).
 */
function reconcile() {
    return runExclusive(async () => {
        const state = await loadState();

        if (
            state.status !== "RUNNING" ||
            !state.reminderEnabled ||
            state.reminderTriggered
        ) {
            return;
        }

        const alarm = await chrome.alarms.get(
            `${ALARM_PREFIX}${state.sessionId}`
        );

        if (!alarm || state.deadline === null || state.deadline <= Date.now()) {
            await reschedule(state);
        }
    });
}


/* ------------------------------------------------------------------ */
/* Commands                                                            */
/* ------------------------------------------------------------------ */

class CommandError extends Error {
}

function isSessionId(value) {
    return typeof value === "string" && value.length > 0 && value.length <= 64;
}

function requireSessionId(message) {
    if (!isSessionId(message.sessionId)) {
        throw new CommandError("Invalid sessionId.");
    }
}

/**
 * Whether the requesting tab should (re)open the time-up dialog.
 * Reassigns the target tab when the original one was closed.
 */
async function shouldShowDialog(state, senderTabId) {
    if (
        state.status !== "RUNNING" ||
        !state.reminderTriggered ||
        state.reminderAcknowledged ||
        senderTabId === undefined
    ) {
        return false;
    }

    if (state.targetTabId === senderTabId) {
        return true;
    }

    if (await tabExists(state.targetTabId)) {
        return false;
    }

    state.targetTabId = senderTabId;
    await saveState(state);

    return true;
}

async function handleGetState(senderTabId) {
    return runExclusive(async () => {
        const state = await loadState();

        return {
            state: await toPublicState(state),
            showDialog: await shouldShowDialog(state, senderTabId)
        };
    });
}

async function handleCommand(message, sender) {
    const senderTabId = sender.tab?.id;

    switch (message?.type) {
        case "GET_STATE":
            return {success: true, ...(await handleGetState(senderTabId))};

        // Deprecated: kept for older web app builds. Use GET_STATE.
        case "GET_TIME_SETTING":
            return {success: true, durationMinutes: await getDurationMinutes()};

        case "SET_TIME_SETTING": {
            if (!Number.isFinite(message.durationMinutes)) {
                throw new CommandError("Invalid durationMinutes.");
            }

            // Rescheduling and broadcasting happen in storage.onChanged,
            // the single handler for popup and web app changes.
            const durationMinutes = await setDurationMinutes(
                message.durationMinutes
            );

            return {success: true, durationMinutes};
        }

        case "START_TIMER": {
            requireSessionId(message);

            if (!Number.isFinite(message.startedAt)) {
                throw new CommandError("Invalid startedAt.");
            }

            return runExclusive(async () => {
                let state = await loadState();

                if (state.sessionId === message.sessionId) {
                    if (state.status === "FINISHED") {
                        throw new CommandError(
                            "Session has already finished."
                        );
                    }

                    // Same running session (page reload / other tab):
                    // keep the reminder progress, only fix the start time.
                    if (state.startedAt === message.startedAt) {
                        return {success: true, state: await toPublicState(state)};
                    }
                } else {
                    state = {
                        ...INITIAL_STATE,
                        reminderEnabled: state.reminderEnabled,
                        sessionId: message.sessionId,
                        targetTabId: senderTabId ?? null
                    };
                }

                state.status = "RUNNING";
                state.startedAt = message.startedAt;

                state = await reschedule(state);
                await broadcastState("TIMER_STATE_CHANGED", state);

                return {success: true, state: await toPublicState(state)};
            });
        }

        case "FINISH_TIMER": {
            requireSessionId(message);

            return runExclusive(async () => {
                const state = await loadState();

                if (state.sessionId !== message.sessionId) {
                    throw new CommandError("Stale session.");
                }

                if (state.status !== "FINISHED") {
                    state.status = "FINISHED";
                    await reschedule(state);
                    await chrome.notifications.clear(NOTIFICATION_ID);
                    await broadcastState("TIMER_STATE_CHANGED", state);
                }

                return {success: true, state: await toPublicState(state)};
            });
        }

        case "ACKNOWLEDGE_TIME_UP": {
            requireSessionId(message);

            return runExclusive(async () => {
                const state = await loadState();

                if (state.sessionId !== message.sessionId) {
                    throw new CommandError("Stale session.");
                }

                if (state.reminderTriggered && !state.reminderAcknowledged) {
                    state.reminderAcknowledged = true;
                    await saveState(state);
                    await chrome.notifications.clear(NOTIFICATION_ID);
                    await broadcastState("TIMER_STATE_CHANGED", state);
                }

                return {success: true, state: await toPublicState(state)};
            });
        }

        case "SET_REMINDER_ENABLED": {
            if (typeof message.enabled !== "boolean") {
                throw new CommandError("Invalid enabled flag.");
            }

            return runExclusive(async () => {
                let state = await loadState();

                if (state.reminderEnabled !== message.enabled) {
                    state.reminderEnabled = message.enabled;
                    state = await reschedule(state);
                    await broadcastState("TIMER_STATE_CHANGED", state);
                }

                return {success: true, state: await toPublicState(state)};
            });
        }

        default:
            throw new CommandError(`Unknown message type: ${message?.type}`);
    }
}

function isAllowedSender(sender) {
    return Boolean(sender.origin) && ALLOWED_ORIGINS.includes(sender.origin);
}

function respondWithError(sendResponse, error) {
    if (!(error instanceof CommandError)) {
        console.error("Command failed:", error);
    }

    sendResponse({
        success: false,
        type: "ERROR",
        message: error?.message ?? "Unknown error."
    });
}


/* ------------------------------------------------------------------ */
/* Listeners (registered synchronously at top level)                   */
/* ------------------------------------------------------------------ */

chrome.runtime.onInstalled.addListener(async () => {
    console.log("TickBun extension installed");

    const result = await chrome.storage.local.get(DURATION_KEY);

    if (result[DURATION_KEY] === undefined) {
        await chrome.storage.local.set({
            [DURATION_KEY]: DEFAULT_DURATION_MINUTES
        });
    }
});

chrome.runtime.onStartup.addListener(() => {
    reconcile().catch((error) => console.error("Reconcile failed:", error));
});

/**
 * Commands from extension pages (popup).
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleCommand(message, sender)
        .then(sendResponse)
        .catch((error) => respondWithError(sendResponse, error));

    return true;
});

/**
 * Commands from the TickBun web app (request / response).
 */
chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        if (!isAllowedSender(sender)) {
            console.warn("Rejected external message from:", sender.origin);
            respondWithError(sendResponse, new CommandError("Unauthorized origin."));
            return;
        }

        handleCommand(message, sender)
            .then(sendResponse)
            .catch((error) => respondWithError(sendResponse, error));

        return true;
    }
);

/**
 * Event channel to the TickBun web app.
 * Pages send GET_STATE over the port and receive STATE_SYNC plus
 * TIMER_STATE_CHANGED / TIME_SETTING_UPDATED / TIME_UP events.
 */
chrome.runtime.onConnectExternal.addListener((port) => {
    if (!isAllowedSender(port.sender ?? {})) {
        console.warn("Rejected external port from:", port.sender?.origin);
        port.disconnect();
        return;
    }

    ports.add(port);

    port.onDisconnect.addListener(() => {
        ports.delete(port);
    });

    port.onMessage.addListener((message) => {
        if (message?.type !== "GET_STATE") {
            postToPort(port, {
                type: "ERROR",
                message: `Unsupported port message: ${message?.type}`
            });
            return;
        }

        handleGetState(port.sender?.tab?.id)
            .then((result) => postToPort(port, {type: "STATE_SYNC", ...result}))
            .catch((error) => postToPort(port, {
                type: "ERROR",
                message: error?.message ?? "Failed to get state."
            }));
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (!alarm.name.startsWith(ALARM_PREFIX)) {
        return;
    }

    const sessionId = alarm.name.slice(ALARM_PREFIX.length);

    runExclusive(async () => {
        const state = await loadState();

        if (
            state.sessionId !== sessionId ||
            state.status !== "RUNNING" ||
            !state.reminderEnabled ||
            state.reminderTriggered ||
            state.deadline === null
        ) {
            return;
        }

        if (Date.now() < state.deadline - EARLY_FIRE_TOLERANCE_MS) {
            await chrome.alarms.create(alarm.name, {when: state.deadline});
            return;
        }

        await triggerReminder(state);
    }).catch((error) => console.error("Alarm handling failed:", error));
});

/**
 * Single place that reacts to duration changes from the popup
 * or from SET_TIME_SETTING.
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[DURATION_KEY]) {
        return;
    }

    runExclusive(async () => {
        const state = await reschedule(await loadState());
        await broadcastState("TIME_SETTING_UPDATED", state);
    }).catch((error) => console.error("Duration update failed:", error));
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
    if (notificationId !== NOTIFICATION_ID) {
        return;
    }

    await chrome.notifications.clear(NOTIFICATION_ID);

    const tab = await resolveTargetTab(await loadState());

    if (tab) {
        await focusTab(tab);
    } else {
        await chrome.tabs.create({url: `${ALLOWED_ORIGINS[0]}/`});
    }
});

reconcile().catch((error) => console.error("Reconcile failed:", error));
