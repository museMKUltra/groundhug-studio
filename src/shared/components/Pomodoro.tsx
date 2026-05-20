import {useEffect} from "react";
import {usePomodoro} from "@/shared/hooks/usePomodoro.ts";

export const Pomodoro = () => {
    const {
        minutes,
        seconds,
        isRunning,
        start,
        pause,
        reset,
    } = usePomodoro({
        durationMs: 5 * 1000,
    });

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    return <div>
        <h1>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
        </h1>

        <p>{isRunning ? "Running" : "Stopped"}</p>

        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={reset}>Reset</button>
    </div>;
}