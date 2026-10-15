import {useEffect, useRef} from "react";

const NOTIFICATION_TAG = "tickbun-time-up";
/** PNG, since Windows notifications do not reliably render SVG. */
const NOTIFICATION_ICON = "/notification-icon.png";

function isNotificationSupported() {
    return typeof Notification !== "undefined";
}

/**
 * Ask for notification permission once. Call it from a user gesture
 * (e.g. a click), otherwise the browser may silently block the prompt.
 */
export function requestNotificationPermission() {
    if (!isNotificationSupported() || Notification.permission !== "default") {
        return;
    }

    Notification.requestPermission().catch((error) => {
        console.warn("Failed to request notification permission:", error);
    });
}

/**
 * Show a system notification while `isTimeUp` is true, and close it
 * once time-up is cleared (dismissed, finished or acknowledged elsewhere).
 */
export function useTimeUpNotification(
    isTimeUp: boolean,
    durationMinutes: number | null
) {
    // Read on time-up only, so a duration change does not re-notify.
    const durationRef = useRef(durationMinutes);
    useEffect(() => {
        durationRef.current = durationMinutes;
    }, [durationMinutes]);

    useEffect(() => {
        if (
            !isTimeUp ||
            !isNotificationSupported() ||
            Notification.permission !== "granted"
        ) {
            return;
        }

        const notification = new Notification("Time's up! 🎉", {
            body: `You've been focusing for ${durationRef.current ?? "--"} minutes. It's time to take a break.`,
            icon: NOTIFICATION_ICON,
            tag: NOTIFICATION_TAG,
            requireInteraction: true,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return () => {
            notification.close();
        };
    }, [isTimeUp]);
}
