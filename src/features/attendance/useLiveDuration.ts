import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import dayjs from "dayjs";
import {formatDuration} from "@/shared/utils/duration";
import {useClock} from "@/features/clock/useClockContext.ts";

const THIRTY_MINUTES_SECONDS = 30 * 60;

export function useLiveDuration(
    session: { clockIn: string } | null
) {
    const clock = useClock();
    const [localStartTime, setLocalStartTime] = useState<number | null>(null);

    const startTime = useMemo(() => {
        if (localStartTime !== null) return localStartTime;
        if (session) return dayjs(session.clockIn).valueOf();
        return null;
    }, [session, localStartTime]);

    const getSeconds = () => {
        if (startTime === null) return 0;
        return Math.floor((clock.now() - startTime) / 1000);
    }

    const getLiveDuration = useCallback(() => {
        return formatDuration(getSeconds(), true);
    }, [startTime, clock]);

    const [durationText, setDurationText] = useState("");
    const [showThirtyMinAlert, setShowThirtyMinAlert] = useState(false);
    const thirtyMinNotified = useRef(false);

    useEffect(() => {
        thirtyMinNotified.current = false;
        setShowThirtyMinAlert(false);
    }, [startTime]);

    useEffect(() => {
        setDurationText(getLiveDuration());
    }, [getLiveDuration]);

    useEffect(() => {
        const timer = setInterval(() => {
            setDurationText(getLiveDuration());

            if (!thirtyMinNotified.current && getSeconds() >= THIRTY_MINUTES_SECONDS) {
                thirtyMinNotified.current = true;
                setShowThirtyMinAlert(true);

                if (Notification.permission === "granted") {
                    new Notification("30 minutes elapsed", {
                        body: "You have been clocked in for 30 minutes.",
                    });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("30 minutes elapsed", {
                                body: "You have been clocked in for 30 minutes.",
                            });
                        }
                    });
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [getLiveDuration]);

    const startLocalTime = () => setLocalStartTime(clock.now());
    const resetLocalTime = () => setLocalStartTime(null);
    const dismissThirtyMinAlert = () => setShowThirtyMinAlert(false);

    return {
        durationText,
        startLocalTime,
        resetLocalTime,
        showThirtyMinAlert,
        dismissThirtyMinAlert,
    };
}