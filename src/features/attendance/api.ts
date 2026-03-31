import axios from "@/api/axios";
import type {ActiveSessionResponse, Summary} from "./types";

export const getActiveSessionApi = async () => {
    const res = await axios.get<ActiveSessionResponse>("/attendance/active-session");
    return res.data;
};

export const clockInApi = async () => {
    const res = await axios.post<ActiveSessionResponse>("/attendance/clock-in");
    return res.data;
};

export const clockOutApi = async () => {
    const res = await axios.post<ActiveSessionResponse>("/attendance/clock-out");
    return res.data;
};

export const getWorkSummaryPreviewApi = async (year: number, month: number) => {
    const res = await axios.get<Summary>(`/work-summary/preview`, {
        params: {year, month},
    });
    return res.data;
};

export const confirmWorkSummaryApi = async (summaryId: string) => {
    const res = await axios.post<Summary>(`/work-summary/${summaryId}/confirm`);
    return res.data;
};