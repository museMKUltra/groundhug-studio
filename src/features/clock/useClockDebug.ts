import {createContext, useContext} from "react";

export interface ClockDebugApi {
    addHours(h: number): void;

    addMinutes(m: number): void;

    reset(): void;

    getOffset(): number;
}

export const ClockDebugContext =
    createContext<ClockDebugApi | null>(null);

export function useClockDebug() {
    return useContext(ClockDebugContext);
}