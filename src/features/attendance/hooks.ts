import {useState} from "react";
import {
    clockInApi,
    clockOutApi,
    confirmWorkSummaryApi,
    createEmployeeRateApi,
    deleteSessionApi,
    getActiveSessionApi,
    getPeriodSessionsApi,
    getWorkSummaryPreviewApi,
    updateSessionApi,
} from "./api.ts";
import type {ClockInAndOutRequest, Session, Summary, UpdateSessionRequest} from "./types";

export const useSessions = () => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [periodSessions, setPeriodSessions] = useState<Session[]>([]);
    const [todaySummary, setTodaySummary] = useState<Summary | null>(null);

    const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    };

    const normalizeSession = (active: boolean, session: Session | null) => {
        return active ? session : null;
    };

    const getActiveSession = () => withLoading(getActiveSessionApi);

    const handleActiveSession = async () => {
        const res = await getActiveSession();
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const clockIn = async (data?: ClockInAndOutRequest) => {
        const res = await withLoading(() => clockInApi(data));
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const clockOut = async (data?: ClockInAndOutRequest) => {
        const res = await withLoading(() => clockOutApi(data));
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const handlePeriodSessions = async (startDate: string, endDate: string) => {
        const res = await getPeriodSessionsApi(startDate, endDate);
        setPeriodSessions(res);
    }

    const updateSession = async (id: number, data: UpdateSessionRequest) => {
        return await updateSessionApi(id, data);
    }

    const deleteSession = async (id: number) => {
        return await deleteSessionApi(id);
    }

    return {
        loading,
        session,
        setSession,
        todaySummary,
        setTodaySummary,
        handleActiveSession,
        getActiveSession,
        clockIn,
        clockOut,
        periodSessions,
        handlePeriodSessions,
        updateSession,
        deleteSession,
    };
};

export const useSummary = () => {
    const [loading, setLoading] = useState(false);
    const [monthSummary, setMonthSummary] = useState<Summary | null>(null);

    const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    };

    const getWorkSummaryPreview = (year: number, month: number) =>
        withLoading(() => getWorkSummaryPreviewApi(year, month));

    const confirmWorkSummary = (summaryId: string) =>
        withLoading(() => confirmWorkSummaryApi(summaryId));

    const previewSummary = async (year: number, month: number) => {
        const res = await getWorkSummaryPreview(year, month);
        setMonthSummary(res);
    };

    return {
        loading,
        monthSummary,
        confirmWorkSummary,
        previewSummary,
    };
};

export const useEmployeeRate = () => {
    const [loading, setLoading] = useState(false);

    const createEmployeeRate = async (hourlyRate: number) => {
        setLoading(true);
        try {
            return await createEmployeeRateApi({hourlyRate});
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createEmployeeRate,
    };
};
