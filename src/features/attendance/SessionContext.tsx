import {createContext, useContext} from "react";
import type {Session} from "./types";
import dayjs from "dayjs";

export type SessionContextType = {
    periodSessions: Session[];
    loading: boolean;
    fetchPeriodSessions: (startDate: string, endDate: string) => Promise<void>;
    updatePeriodSessions: () => Promise<void>;
    updateSession: (session: Session) => void;
    deleteSession: (session: Session) => void;
    setStartTime: (startTime: dayjs.Dayjs | null) => void;
    setEndTime: (endTime: dayjs.Dayjs | null) => void;
    weekStart: dayjs.Dayjs;
    prevWeek: () => void;
    nextWeek: () => void;
    goToday: () => void;
    goDay: (day: dayjs.Dayjs) => void;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const useSessionContext = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSessionContext must be used inside SessionProvider");
    return ctx;
};