import React, {useMemo, useState} from "react";
import {ClockContext} from "./useClockContext.ts";
import {SystemClock} from "./SystemClock.ts";
import {DemoClock} from "./DemoClock.ts";
import {ClockDebugContext} from "./useClockDebug.ts";

export type ClockMode = "system" | "demo";

interface ClockProviderProps {
    mode: ClockMode;
    children: React.ReactNode;
}

const systemClock = new SystemClock();
const demoClock = new DemoClock();

export function ClockProvider({mode, children}: ClockProviderProps) {
    const [, forceUpdate] = useState(0);

    const clock = mode === "demo" ? demoClock : systemClock;

    const api = useMemo(() => ({
        addHours: (h: number) => {
            demoClock.addHours(h);
            forceUpdate(x => x + 1);
        },
        addMinutes: (m: number) => {
            demoClock.addMinutes(m);
            forceUpdate(x => x + 1);
        },
        reset: () => {
            demoClock.reset();
            forceUpdate(x => x + 1);
        },
        getOffset: () => demoClock.getOffset()
    }), []);

    return (
        <ClockContext.Provider value={clock}>
            <ClockDebugContext.Provider value={api}>
                {children}
            </ClockDebugContext.Provider>
        </ClockContext.Provider>
    );
}
