import axios from "@/app/api/axios";
import type {
    ActiveSessionResponse,
    ClockInAndOutRequest,
    CreateLabelRequest,
    CreateSessionRequest,
    EmployeeRateRequest,
    EmployeeRateResponse,
    Label,
    PeriodSessionsResponse,
    ReorderLabelsRequest,
    Session,
    Summary,
    UpdateSessionRequest,
    WorkSummaryResponse,
} from "./types";

export const getPeriodSessionsApi = async (startDate: string, endDate: string) => {
    const res = await axios.get<PeriodSessionsResponse>("/attendance/period-sessions", {
        params: {startDate, endDate}
    });
    return res.data;
};

export const getActiveSessionApi = async () => {
    const res = await axios.get<ActiveSessionResponse>("/attendance/active-session");
    return res.data;
};

export const createSessionApi = async (
    data: CreateSessionRequest,
) => {
    const res = await axios.post<Session>(`/attendance/sessions`, data);
    return res.data;
};

export const updateSessionApi = async (
    id: number,
    data: UpdateSessionRequest
) => {
    const res = await axios.put<Session>(`/attendance/sessions/${id}`, data);
    return res.data;
};

export const deleteSessionApi = async (
    id: number,
) => {
    await axios.delete<Session>(`/attendance/sessions/${id}`);
};

export const clockInApi = async (data?: ClockInAndOutRequest) => {
    const res = await axios.post<ActiveSessionResponse>("/attendance/clock-in", data);
    return res.data;
};

export const clockOutApi = async (data?: ClockInAndOutRequest) => {
    const res = await axios.post<ActiveSessionResponse>("/attendance/clock-out", data);
    return res.data;
};

export const getWorkSummaryPreviewApi = async (year: number, month: number) => {
    const res = await axios.get<Summary>(`/work-summary/preview`, {
        params: {year, month},
    });
    return res.data;
};

export const getWorkSummaryListApi = async (page: number, size: number) => {
    const res = await axios.get<WorkSummaryResponse>(`/work-summary/list`, {
        params: {page, size},
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

export const reorderLabelsApi = async (data: ReorderLabelsRequest) => {
    await axios.post(`/attendance/labels/reorder`, data);
};

export const createEmployeeRateApi = async (data: EmployeeRateRequest) => {
    const res = await axios.post<EmployeeRateResponse>("/employee-rates", data);
    return res.data;
};
