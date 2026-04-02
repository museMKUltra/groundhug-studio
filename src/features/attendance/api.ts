import axios from "@/api/axios";
import type {ActiveSessionResponse, Summary, Label, CreateLabelRequest} from "./types";

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

export const getLabelsApi = async () => {
    const res = await axios.get<Label[]>("/attendance/labels");
    return res.data;
};

export const createLabelApi = async (data: {
    name: string;
    color: string;
}) => {
    const res = await axios.post<Label>("/attendance/labels", data);
    return res.data;
};

export const updateLabelApi = async (
    id: number,
    data: CreateLabelRequest
) => {
    const res = await axios.put<Label>(`/attendance/labels/${id}`, data);
    return res.data;
};

export const deleteLabelApi = async (id: number) => {
    await axios.delete(`/attendance/labels/${id}`);
};