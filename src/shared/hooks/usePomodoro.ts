import { useCallback, useEffect, useRef, useState } from "react";

type UsePomodoroOptions = {
    durationMs: number;
    onComplete?: () => void;
};

export function usePomodoro({
                                durationMs,
                                onComplete,
                            }: UsePomodoroOptions) {
    const [remainingMs, setRemainingMs] = useState(durationMs);
    const [isRunning, setIsRunning] = useState(false);

    const intervalRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const notify = useCallback(() => {
        // flash title
        document.title = "⏰ Time's up!";

        // browser notification
        if (Notification.permission === "granted") {
            const notification = new Notification(
                "Pomodoro Finished 🍅",
                {
                    body: "Click to return",
                }
            );

            notification.onclick = () => {
                window.focus();
            };
        }

        // vibration
        navigator.vibrate?.([300, 100, 300]);

        onComplete?.();
    }, [onComplete]);

    const start = useCallback(() => {
        if (isRunning) return;

        setIsRunning(true);

        endTimeRef.current = Date.now() + remainingMs;

        intervalRef.current = window.setInterval(() => {
            if (!endTimeRef.current) return;

            const nextRemaining = Math.max(
                0,
                endTimeRef.current - Date.now()
            );

            setRemainingMs(nextRemaining);

            if (nextRemaining <= 0) {
                clearTimer();

                setIsRunning(false);

                notify();
            }
        }, 1000);
    }, [isRunning, remainingMs, notify]);

    const pause = useCallback(() => {
        if (!isRunning || !endTimeRef.current) return;

        clearTimer();

        setRemainingMs(
            Math.max(0, endTimeRef.current - Date.now())
        );

        setIsRunning(false);
    }, [isRunning]);

    const reset = useCallback(() => {
        clearTimer();

        setRemainingMs(durationMs);
        setIsRunning(false);

        endTimeRef.current = null;

        document.title = "Pomodoro";
    }, [durationMs]);

    useEffect(() => {
        Notification.requestPermission();

        return clearTimer;
    }, []);

    const totalSeconds = Math.ceil(remainingMs / 1000);

    return {
        minutes: Math.floor(totalSeconds / 60),
        seconds: totalSeconds % 60,

        isRunning,

        start,
        pause,
        reset,
    };
}