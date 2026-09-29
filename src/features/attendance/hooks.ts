import {useState} from "react";
import {
    clockInApi,
    clockOutApi,
    confirmWorkSummaryApi,
    createEmployeeRateApi,
    createSessionApi,
    deleteSessionApi,
    getActiveSessionApi,
    getPeriodSessionsApi,
    getWorkSummaryListApi,
    getWorkSummaryPreviewApi,
    updateSessionApi
} from "./api.ts";
import type {ClockInAndOutRequest, CreateSessionRequest, Session, Summary, UpdateSessionRequest} from "./types";
import {useProjectId} from "@/features/projects/hooks.ts";

export const useSessions = () => {
    const projectId = useProjectId();
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

    const getActiveSession = () => withLoading(() => getActiveSessionApi(projectId));

    const handleActiveSession = async () => {
        const res = await getActiveSession();
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const clockIn = async (data?: ClockInAndOutRequest) => {
        const res = await withLoading(() => clockInApi(projectId, data));
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const clockOut = async (data?: ClockInAndOutRequest) => {
        const res = await withLoading(() => clockOutApi(projectId, data));
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const handlePeriodSessions = async (startDate: string, endDate: string) => {
        const res = await getPeriodSessionsApi(projectId, startDate, endDate);
        setPeriodSessions(res);
    }

    const createSession = async (data: CreateSessionRequest) => {
        return await createSessionApi(projectId, data);
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
        createSession,
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

    const getWorkSummaryList = (page: number, size: number) =>
        withLoading(() => getWorkSummaryListApi(page, size));

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
        getWorkSummaryList,
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
