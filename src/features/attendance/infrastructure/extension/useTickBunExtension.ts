import {useCallback, useEffect, useRef, useState} from "react";
import dayjs from "dayjs";

import {useClock} from "@/features/clock/useClockContext.ts";
import {
    type CommandResponse,
    isTickBunState,
    parseTickBunEvent,
    type TickBunCommand,
    type TickBunState,
} from "./tickBunMessages.ts";

const EXTENSION_ID = import.meta.env.VITE_TICKBUN_EXTENSION_ID;

const RECONNECT_MIN_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30_000;

/** Tolerated difference when comparing start times (ms). */
const START_TIME_TOLERANCE_MS = 2000;

function isExtensionAvailable() {
    return Boolean(EXTENSION_ID) &&
        typeof chrome !== "undefined" &&
        Boolean(chrome.runtime?.sendMessage);
}

/**
 * Send a command to the extension and wait for its acknowledgement.
 */
function sendCommand(command: TickBunCommand) {
    return new Promise<CommandResponse & { success: true }>((resolve, reject) => {
        if (!EXTENSION_ID) {
            reject(new Error("TickBun extension ID is not configured."));
            return;
        }

        if (!isExtensionAvailable()) {
            reject(new Error("TickBun extension is not available."));
            return;
        }

        chrome.runtime.sendMessage(
            EXTENSION_ID,
            command,
            (response: CommandResponse | undefined) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response?.success) {
                    reject(new Error(
                        response?.message ?? `TickBun command ${command.type} failed.`
                    ));
                    return;
                }

                resolve(response);
            }
        );
    });
}

/**
 * Bridge to the TickBun Chrome extension.
 *
 * The extension owns reminder scheduling (chrome.alarms). This hook
 * reports the active session to it, mirrors its state, and opens the
 * time-up dialog when the extension sends TIME_UP (or when a reconnecting
 * page learns that an unacknowledged reminder is pending).
 */
export function useTickBunExtension(
    session: { id: number; clockIn: string } | null
) {
    const clock = useClock();

    const [extensionState, setExtensionState] = useState<TickBunState | null>(null);
    const [withReminder, setWithReminderState] = useState(true);
    const [timeSettingMinutes, setTimeSettingMinutes] = useState<number | null>(null);
    /** Session whose time-up dialog is open, or null when closed. */
    const [timeUpSessionId, setTimeUpSessionId] = useState<string | null>(null);

    const sessionId = session ? String(session.id) : null;
    const clockInMs = session ? dayjs(session.clockIn).valueOf() : null;

    const sessionIdRef = useRef(sessionId);
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    const openDialog = useCallback((id: string | null) => {
        if (id === null) {
            return;
        }

        // Ignore reminders for a session this page is not showing.
        if (sessionIdRef.current !== null && sessionIdRef.current !== id) {
            return;
        }

        setTimeUpSessionId(id);
    }, []);

    /**
     * Mirror the authoritative extension state.
     * The dialog is only closed by a lifecycle transition of its session
     * (finished, acknowledged, replaced or re-armed), never by a
     * settings refresh alone.
     */
    const applyState = useCallback((state: TickBunState, showDialog = false) => {
        setExtensionState(state);
        setTimeSettingMinutes(state.durationMinutes);
        setWithReminderState(state.reminderEnabled);

        setTimeUpSessionId((current) => {
            if (current === null) {
                return current;
            }

            const stillPending =
                state.sessionId === current &&
                state.status === "RUNNING" &&
                state.reminderTriggered &&
                !state.reminderAcknowledged;

            return stillPending ? current : null;
        });

        if (showDialog) {
            openDialog(state.sessionId);
        }
    }, [openDialog]);

    const applyResponse = useCallback((response: CommandResponse & { success: true }) => {
        if (isTickBunState(response.state)) {
            applyState(response.state, response.showDialog === true);
        }

        return response;
    }, [applyState]);

    /**
     * Long-lived connection for extension events.
     * Re-requests the state on every (re)connect and when the page
     * becomes visible, so missed events are recovered.
     */
    useEffect(() => {
        if (!EXTENSION_ID) {
            console.warn("TickBun extension ID is not configured.");
            return;
        }

        if (typeof chrome === "undefined" || !chrome.runtime?.connect) {
            console.warn("TickBun extension is not available.");
            return;
        }

        let port: chrome.runtime.Port | null = null;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let retryDelay = RECONNECT_MIN_DELAY_MS;
        let disposed = false;

        const requestState = () => {
            try {
                port?.postMessage({type: "GET_STATE"} satisfies TickBunCommand);
            } catch (error) {
                console.warn("Failed to request TickBun state:", error);
            }
        };

        const scheduleReconnect = () => {
            if (disposed) {
                return;
            }

            clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, RECONNECT_MAX_DELAY_MS);
        };

        const handleMessage = (raw: unknown) => {
            const event = parseTickBunEvent(raw);

            if (!event) {
                console.warn("Ignored invalid TickBun message:", raw);
                return;
            }

            switch (event.type) {
                case "STATE_SYNC":
                    retryDelay = RECONNECT_MIN_DELAY_MS;
                    applyState(event.state, event.showDialog);
                    break;

                case "TIMER_STATE_CHANGED":
                case "TIME_SETTING_UPDATED":
                    applyState(event.state);
                    break;

                case "TIME_UP":
                    applyState(event.state);
                    openDialog(event.sessionId);
                    break;

                case "ERROR":
                    console.error("TickBun extension error:", event.message);
                    break;
            }
        };

        function connect() {
            if (disposed) {
                return;
            }

            try {
                port = chrome.runtime.connect(EXTENSION_ID);
            } catch (error) {
                console.warn("Failed to connect to TickBun extension:", error);
                port = null;
                scheduleReconnect();
                return;
            }

            port.onMessage.addListener(handleMessage);

            // Fires when the extension is missing / reloaded or the
            // service worker is suspended.
            port.onDisconnect.addListener(() => {
                const reason = chrome.runtime.lastError?.message;

                if (reason) {
                    console.debug("TickBun extension disconnected:", reason);
                }

                port = null;
                scheduleReconnect();
            });

            requestState();
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            if (port) {
                requestState();
            } else {
                retryDelay = RECONNECT_MIN_DELAY_MS;
                clearTimeout(retryTimer);
                connect();
            }
        };

        connect();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            disposed = true;
            clearTimeout(retryTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            port?.disconnect();
            port = null;
        };
    }, [applyState, openDialog]);

    /**
     * Report the active session to the extension.
     * Idempotent: also repairs the extension state after a reload,
     * and does nothing if the extension already tracks this session.
     */
    useEffect(() => {
        if (sessionId === null || clockInMs === null || extensionState === null) {
            return;
        }

        // Convert to wall-clock time (the app clock may be offset in demo mode).
        const startedAt = Date.now() - (clock.now() - clockInMs);

        if (extensionState.sessionId === sessionId) {
            if (extensionState.status === "FINISHED") {
                return;
            }

            if (
                extensionState.status === "RUNNING" &&
                extensionState.startedAt !== null &&
                Math.abs(extensionState.startedAt - startedAt) < START_TIME_TOLERANCE_MS
            ) {
                return;
            }
        }

        sendCommand({type: "START_TIMER", sessionId, startedAt})
            .then(applyResponse)
            .catch((error) => {
                console.error("Failed to start TickBun timer:", error);
            });
    }, [sessionId, clockInMs, clock, extensionState, applyResponse]);

    /**
     * Tell the extension the session has finished (after clock-out).
     */
    const finishTimer = useCallback((id: number) => {
        setTimeUpSessionId(null);

        return sendCommand({type: "FINISH_TIMER", sessionId: String(id)})
            .then(applyResponse)
            .then(() => undefined);
    }, [applyResponse]);

    /**
     * Close the time-up dialog and acknowledge it, so it is not restored
     * after a reload and closes in other tabs as well.
     */
    const dismissTimeUp = useCallback(() => {
        const id = timeUpSessionId;
        setTimeUpSessionId(null);

        if (id === null) {
            return;
        }

        sendCommand({type: "ACKNOWLEDGE_TIME_UP", sessionId: id})
            .then(applyResponse)
            .catch((error) => {
                console.error("Failed to acknowledge TickBun reminder:", error);
            });
    }, [timeUpSessionId, applyResponse]);

    const setWithReminder = useCallback((enabled: boolean) => {
        setWithReminderState(enabled);

        sendCommand({type: "SET_REMINDER_ENABLED", enabled})
            .then(applyResponse)
            .catch((error) => {
                console.error("Failed to update TickBun reminder:", error);
            });
    }, [applyResponse]);

    /**
     * Fetch the current state (including the time setting) on demand.
     */
    const refreshTimeSetting = useCallback(async () => {
        const response = applyResponse(await sendCommand({type: "GET_STATE"}));

        if (!isTickBunState(response.state)) {
            throw new Error("Extension returned an invalid state.");
        }

        return response.state.durationMinutes;
    }, [applyResponse]);

    const setTimeSetting = useCallback(async (durationMinutes: number) => {
        const response = await sendCommand({type: "SET_TIME_SETTING", durationMinutes});

        if (response.durationMinutes !== undefined) {
            setTimeSettingMinutes(response.durationMinutes);
        }
    }, []);

    return {
        isTimeUp: timeUpSessionId !== null,
        dismissTimeUp,
        withReminder,
        setWithReminder,
        timeSettingMinutes,
        refreshTimeSetting,
        setTimeSetting,
        finishTimer,
    };
}
