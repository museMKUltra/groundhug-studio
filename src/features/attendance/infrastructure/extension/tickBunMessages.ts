/**
 * Message protocol between the TickBun web app and the TickBun
 * Chrome extension (google_extension/background.js).
 *
 * Commands (web app → extension) go through chrome.runtime.sendMessage
 * and receive a CommandResponse. Events (extension → web app) arrive
 * over a long-lived chrome.runtime.Port.
 */

export type TimerStatus = "IDLE" | "RUNNING" | "FINISHED";

export interface TickBunState {
    sessionId: string | null;
    status: TimerStatus;
    durationMinutes: number;
    /** Wall-clock ms of clock-in; the reminder counts from here. */
    startedAt: number | null;
    deadline: number | null;
    reminderEnabled: boolean;
    reminderTriggered: boolean;
    reminderAcknowledged: boolean;
}

/* Web app → extension */

export type TickBunCommand =
    | { type: "GET_STATE" }
    | { type: "START_TIMER"; sessionId: string; startedAt: number }
    | { type: "FINISH_TIMER"; sessionId: string }
    | { type: "SET_TIME_SETTING"; durationMinutes: number }
    | { type: "SET_REMINDER_ENABLED"; enabled: boolean }
    | { type: "ACKNOWLEDGE_TIME_UP"; sessionId: string };

/* Extension → web app */

export type TickBunEvent =
    | { type: "STATE_SYNC"; state: TickBunState; showDialog: boolean }
    | { type: "TIMER_STATE_CHANGED"; state: TickBunState }
    | { type: "TIME_SETTING_UPDATED"; state: TickBunState }
    | { type: "TIME_UP"; sessionId: string; state: TickBunState }
    | { type: "ERROR"; message: string };

export type CommandResponse =
    | { success: true; state?: TickBunState; showDialog?: boolean; durationMinutes?: number }
    | { success: false; type?: "ERROR"; message?: string };

/* Validation */

type UnknownRecord = Record<string, unknown>;

const TIMER_STATUSES: readonly string[] = ["IDLE", "RUNNING", "FINISHED"];

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

function isNullableNumber(value: unknown): value is number | null {
    return value === null || typeof value === "number";
}

export function isTickBunState(value: unknown): value is TickBunState {
    return (
        isRecord(value) &&
        (value.sessionId === null || typeof value.sessionId === "string") &&
        typeof value.status === "string" &&
        TIMER_STATUSES.includes(value.status) &&
        typeof value.durationMinutes === "number" &&
        isNullableNumber(value.startedAt) &&
        isNullableNumber(value.deadline) &&
        typeof value.reminderEnabled === "boolean" &&
        typeof value.reminderTriggered === "boolean" &&
        typeof value.reminderAcknowledged === "boolean"
    );
}

export function parseTickBunEvent(value: unknown): TickBunEvent | null {
    if (!isRecord(value)) {
        return null;
    }

    switch (value.type) {
        case "STATE_SYNC":
            return isTickBunState(value.state)
                ? {type: "STATE_SYNC", state: value.state, showDialog: value.showDialog === true}
                : null;

        case "TIMER_STATE_CHANGED":
        case "TIME_SETTING_UPDATED":
            return isTickBunState(value.state)
                ? {type: value.type, state: value.state}
                : null;

        case "TIME_UP":
            return typeof value.sessionId === "string" && isTickBunState(value.state)
                ? {type: "TIME_UP", sessionId: value.sessionId, state: value.state}
                : null;

        case "ERROR":
            return {
                type: "ERROR",
                message: typeof value.message === "string" ? value.message : "Unknown extension error."
            };

        default:
            return null;
    }
}
