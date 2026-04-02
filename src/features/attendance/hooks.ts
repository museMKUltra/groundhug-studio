import {useState} from "react";
import {clockInApi, clockOutApi, confirmWorkSummaryApi, getActiveSessionApi, getWorkSummaryPreviewApi,} from "./api.ts";
import type {Session, Summary} from "./types";

export const useSessions = () => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
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

    const clockIn = async () => {
        const res = await withLoading(clockInApi);
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

    const clockOut = async () => {
        const res = await withLoading(clockOutApi);
        setSession(normalizeSession(res.active, res.session));
        setTodaySummary(res?.summary);
    };

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
    };
};

export const useSummary = () => {
    const [loading, setLoading] = useState(false);

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

    return {
        loading,
        getWorkSummaryPreview,
        confirmWorkSummary,
    };
};