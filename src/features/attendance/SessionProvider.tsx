import {useState} from "react";
import {SessionContext} from "./SessionContext";
import {getPeriodSessionsApi} from "./api";
import type {Session} from "./types";

export const SessionProvider = ({children}: {children: React.ReactNode}) => {
    const [periodSessions, setPeriodSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPeriodSessions = async (startDate: string, endDate: string) => {
        setLoading(true);
        try {
            const res = await getPeriodSessionsApi(startDate, endDate);
            setPeriodSessions(res);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SessionContext.Provider
            value={{
                periodSessions,
                loading,
                fetchPeriodSessions,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};