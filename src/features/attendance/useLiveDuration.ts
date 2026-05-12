import {useCallback, useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import {formatDuration} from "@/shared/utils/duration";
import {useClock} from "@/features/clock/useClockContext.ts";

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

    const getLiveDuration = useCallback(() => {
        if (startTime === null) return "";
        const seconds = Math.floor((clock.now() - startTime) / 1000);
        return formatDuration(seconds, true);
    }, [startTime, clock]);

    const [durationText, setDurationText] = useState("");

    useEffect(() => {
        setDurationText(getLiveDuration());
    }, [getLiveDuration]);

    useEffect(() => {
        const timer = setInterval(() => {
            setDurationText(getLiveDuration());
        }, 1000);

        return () => clearInterval(timer);
    }, [getLiveDuration]);

    const startLocalTime = () => setLocalStartTime(clock.now());
    const resetLocalTime = () => setLocalStartTime(null);

    return {
        durationText,
        startLocalTime,
        resetLocalTime,
    };
}