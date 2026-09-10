import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import dayjs from "dayjs";
import {formatDuration} from "@/shared/utils/duration";
import {useClock} from "@/features/clock/useClockContext.ts";

const BREAK_TIME_MINUTES = 30;

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
    const [showBreakTimeAlert, setShowBreakTimeAlert] = useState(false);
    const breakTimeNotified = useRef(false);

    useEffect(() => {
        breakTimeNotified.current = false;
        setShowBreakTimeAlert(false);
    }, [startTime]);

    useEffect(() => {
        setDurationText(getLiveDuration());
    }, [getLiveDuration]);

    const notifyBreakingTime = () => {
        const notification = () => new Notification(BREAK_TIME_MINUTES + " minutes elapsed", {
            body: "You have been clocked in for " + BREAK_TIME_MINUTES + " minutes.",
        });

        if (Notification.permission === "granted") {
            notification();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") notification();
            });
        }
    };

    const isTimeToBreak = () => getSeconds() >= BREAK_TIME_MINUTES * 60;

    useEffect(() => {
        const timer = setInterval(() => {
            setDurationText(getLiveDuration());

            if (!breakTimeNotified.current && isTimeToBreak()) {
                breakTimeNotified.current = true;
                setShowBreakTimeAlert(true);
                notifyBreakingTime();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [getLiveDuration]);

    const startLocalTime = () => setLocalStartTime(clock.now());
    const resetLocalTime = () => setLocalStartTime(null);
    const dismissBreakTimeAlert = () => setShowBreakTimeAlert(false);

    return {
        durationText,
        startLocalTime,
        resetLocalTime,
        showBreakTimeAlert,
        dismissBreakTimeAlert,
        BREAK_TIME_MINUTES,
    };
}