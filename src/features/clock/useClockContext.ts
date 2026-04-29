import {createContext, useContext} from "react";
import type {Clock} from "@/features/clock/types.ts";

export const ClockContext = createContext<Clock | null>(null);

export function useClock() {
    const ctx = useContext(ClockContext);
    if (!ctx) throw new Error("useClock must be used inside ClockProvider");
    return ctx;
}
