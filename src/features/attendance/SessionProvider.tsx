import {useRef, useState} from "react";
import {SessionContext} from "./SessionContext";
import {getPeriodSessionsApi} from "./api";
import type {Session} from "./types";
import dayjs from "dayjs";

export const SessionProvider = ({children}: { children: React.ReactNode }) => {
    const startTime = useRef<dayjs.Dayjs | null>(null);
    const endTime = useRef<dayjs.Dayjs | null>(null);

    const [periodSessions, setPeriodSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);

    const getMonday = (d = dayjs()) => d.add(-1, "day").startOf("week").add(1, "day");
    const formatDate = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
    const [weekStart, setWeekStart] = useState(() => getMonday());

    const prevWeek = () => setWeekStart(prev => prev.subtract(7, "day"));
    const nextWeek = () => setWeekStart(prev => prev.add(7, "day"));
    const goToday = () => setWeekStart(getMonday());
    const goDay = (day: dayjs.Dayjs) => setWeekStart(getMonday(day));

    const fetchPeriodSessions = async (startDate: string, endDate: string) => {
        setLoading(true);
        try {
            const res = await getPeriodSessionsApi(startDate, endDate);
            setPeriodSessions(res);
        } finally {
            setLoading(false);
        }
    };

    const updatePeriodSessions = async () => {
        const startDate = startTime.current ? formatDate(startTime.current) : "";
        const endDate = endTime.current ? formatDate(endTime.current) : "";

        await fetchPeriodSessions(startDate, endDate);
    };

    const updateSession = async (session: Session) => {
        if (session == null) {
            return;
        }
        setPeriodSessions(prev => prev.map(s => s.id === session.id ? session : s));
    };

    return (
        <SessionContext.Provider
            value={{
                periodSessions,
                loading,
                fetchPeriodSessions,
                updatePeriodSessions,
                updateSession,
                setStartTime: (v) => {
                    startTime.current = v;
                },
                setEndTime: (v) => {
                    endTime.current = v;
                },
                weekStart,
                prevWeek,
                nextWeek,
                goToday,
                goDay,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};