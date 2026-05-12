import {useMemo, useState} from "react";

import {ClockContext} from "./useClockContext";
import {SystemClock} from "./SystemClock";
import {DemoClock} from "./DemoClock";
import {ClockDebugContext} from "./useClockDebug";

import {useAuth} from "@/features/auth/hooks.ts";

const systemClock = new SystemClock();
const demoClock = new DemoClock();

export function ClockProvider({children}: {children: React.ReactNode}) {
    const {user} = useAuth();
    const [, forceUpdate] = useState(0);

    const mode = user?.isGuest ? "demo" : "system";

    const clock = useMemo(() => {
        return mode === "demo"
            ? demoClock
            : systemClock;
    }, [mode]);

    const debugApi = useMemo(() => ({
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
            <ClockDebugContext.Provider value={debugApi}>
                {children}
            </ClockDebugContext.Provider>
        </ClockContext.Provider>
    );
}