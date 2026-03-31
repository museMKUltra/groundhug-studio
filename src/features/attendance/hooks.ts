import { useState } from "react";
import {
    getActiveSessionApi,
    clockInApi,
    clockOutApi,
    getWorkSummaryPreviewApi,
    confirmWorkSummaryApi,
} from "./api";

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);

    const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    };

    const getActiveSession = () => withLoading(getActiveSessionApi);

    const clockIn = () => withLoading(clockInApi);

    const clockOut = () => withLoading(clockOutApi);

    const getWorkSummaryPreview = (year: number, month: number) =>
        withLoading(() => getWorkSummaryPreviewApi(year, month));

    const confirmWorkSummary = (summaryId: string) =>
        withLoading(() => confirmWorkSummaryApi(summaryId));

    return {
        loading,
        getActiveSession,
        clockIn,
        clockOut,
        getWorkSummaryPreview,
        confirmWorkSummary,
    };
};