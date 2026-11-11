import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";

import {useClock} from "@/features/clock/useClockContext.ts";

/**
 * Break reminder, owned by the web app (replaces the TickBun extension).
 *
 * Semantics (same as the former extension):
 *   deadline = clockIn + durationMinutes.
 *   Time-up fires once per session. Dismissing records the moment of
 *   acknowledgement; changing the duration re-arms the reminder only when
 *   the new deadline lies after that moment.
 *
 * Settings live in localStorage and are synced across tabs via the
 * `storage` event, so dismissing in one tab clears the others as well.
 */

export const DEFAULT_DURATION_MINUTES = 30;
export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 100;
export const STEP_MINUTES = 5;

const STORAGE_KEY = "tickbun.breakReminder";
const TICK_MS = 1000;
/** Fire slightly after the deadline so `now >= deadline` holds. */
const DEADLINE_SLACK_MS = 50;

interface Acknowledgement {
    sessionId: number;
    /** App-clock ms when the reminder was dismissed. */
    at: number;
}

interface ReminderSettings {
    durationMinutes: number;
    enabled: boolean;
    acknowledged: Acknowledgement | null;
}

const DEFAULT_SETTINGS: ReminderSettings = {
    durationMinutes: DEFAULT_DURATION_MINUTES,
    enabled: true,
    acknowledged: null,
};

export function clampDuration(minutes: number) {
    return Math.min(
        MAX_DURATION_MINUTES,
        Math.max(MIN_DURATION_MINUTES, Math.round(minutes))
    );
}

function readSettings(): ReminderSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
        const ack = parsed.acknowledged;

        return {
            durationMinutes: typeof parsed.durationMinutes === "number"
                ? clampDuration(parsed.durationMinutes)
                : DEFAULT_DURATION_MINUTES,
            enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
            acknowledged:
                ack && typeof ack.sessionId === "number" && typeof ack.at === "number"
                    ? ack
                    : null,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function writeSettings(settings: ReminderSettings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn("Failed to save break reminder settings:", error);
    }
}

export function useBreakReminder(
    session: { id: number; clockIn: string } | null
) {
    const clock = useClock();

    const [settings, setSettings] = useState<ReminderSettings>(readSettings);
    const [now, setNow] = useState(() => clock.now());

    const update = useCallback((patch: Partial<ReminderSettings>) => {
        setSettings((current) => {
            const next = {...current, ...patch};
            writeSettings(next);
            return next;
        });
    }, []);

    // Cross-tab sync.
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) {
                setSettings(readSettings());
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const sessionId = session?.id ?? null;
    const startedAt = session ? dayjs(session.clockIn).valueOf() : null;
    const deadline = startedAt !== null
        ? startedAt + settings.durationMinutes * 60_000
        : null;

    /**
     * Tick while a session is running (drives the PiP countdown and picks
     * up DemoClock jumps). In a hidden tab Chrome may throttle this
     * interval to once per minute, so it is not relied on for time-up.
     */
    useEffect(() => {
        if (sessionId === null) return;

        const tick = () => setNow(clock.now());
        const initial = setTimeout(tick, 0);
        const timer = setInterval(tick, TICK_MS);

        // Catch up immediately when the page comes back
        // (tab shown, window focused, unfrozen or restored from bfcache).
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") tick();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("resume", tick);
        window.addEventListener("focus", tick);
        window.addEventListener("pageshow", tick);

        return () => {
            clearTimeout(initial);
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("resume", tick);
            window.removeEventListener("focus", tick);
            window.removeEventListener("pageshow", tick);
        };
    }, [sessionId, clock]);

    /**
     * One-shot timer at the deadline. Unlike the chained interval above,
     * a single setTimeout is not subject to Chrome's intensive throttling,
     * so time-up fires within about a second even in a long-hidden tab.
     * Re-armed whenever the deadline or reminder setting changes.
     */
    useEffect(() => {
        if (sessionId === null || deadline === null || !settings.enabled) return;

        const delay = deadline - clock.now();
        if (delay <= 0) return; // Already due; the tick handles it.

        const timer = setTimeout(
            () => setNow(clock.now()),
            delay + DEADLINE_SLACK_MS
        );

        return () => clearTimeout(timer);
    }, [sessionId, deadline, settings.enabled, clock]);

    const ack = settings.acknowledged;
    const isAcknowledged =
        ack !== null &&
        ack.sessionId === sessionId &&
        deadline !== null &&
        ack.at >= deadline;

    const isTimeUp =
        settings.enabled &&
        deadline !== null &&
        now >= deadline &&
        !isAcknowledged;

    const dismissTimeUp = useCallback(() => {
        if (sessionId === null) return;
        update({acknowledged: {sessionId, at: clock.now()}});
    }, [sessionId, clock, update]);

    const setWithReminder = useCallback((enabled: boolean) => {
        update({enabled});
    }, [update]);

    const setTimeSetting = useCallback((minutes: number) => {
        update({durationMinutes: clampDuration(minutes)});
    }, [update]);

    return {
        isTimeUp,
        dismissTimeUp,
        withReminder: settings.enabled,
        setWithReminder,
        timeSettingMinutes: settings.durationMinutes,
        setTimeSetting,
        startedAt,
        deadline,
        now,
    };
}
