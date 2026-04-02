import {useEffect, useState} from "react";
import {
    clockInApi,
    clockOutApi,
    confirmWorkSummaryApi,
    createLabelApi,
    deleteLabelApi,
    getActiveSessionApi,
    getLabelsApi,
    getWorkSummaryPreviewApi,
    updateLabelApi,
} from "./api.ts";
import type {ClockInAndOutRequest, CreateLabelRequest, Label, Session, Summary} from "./types";

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

export const useLabels = () => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLabels = async () => {
        setLoading(true);
        try {
            const data = await getLabelsApi();
            setLabels(data);
        } finally {
            setLoading(false);
        }
    };

    const createLabel = async (data: CreateLabelRequest) => {
        const newLabel = await createLabelApi({
            name: data.name,
            color: data.color,
        });

        setLabels((prev) => [...prev, newLabel]);
    };

    const updateLabel = async (id: number, updated: Label) => {
        const res = await updateLabelApi(id, {
            name: updated.name,
            color: updated.color,
        });

        setLabels((prev) =>
            prev.map((l) => (l.id === id ? res : l))
        );
    };

    const deleteLabel = async (id: number) => {
        await deleteLabelApi(id);
        setLabels((prev) => prev.filter((l) => l.id !== id));
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    return {
        labels,
        loading,
        createLabel,
        updateLabel,
        deleteLabel,
    };
};