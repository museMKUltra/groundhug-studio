import {createContext, useContext} from "react";
import type {Session} from "./types";

export type SessionContextType = {
    periodSessions: Session[];
    loading: boolean;
    fetchPeriodSessions: (startDate: string, endDate: string) => Promise<void>;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const useSessionContext = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSessionContext must be used inside SessionProvider");
    return ctx;
};