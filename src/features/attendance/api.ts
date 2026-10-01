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

export const getPeriodSessionsApi = async (projectId: number, startDate: string, endDate: string) => {
    const res = await axios.get<PeriodSessionsResponse>(`/attendance/projects/${projectId}/period-sessions`, {
        params: {startDate, endDate}
    });
    return res.data;
};

export const getActiveSessionApi = async (projectId: number) => {
    const res = await axios.get<ActiveSessionResponse>(`/attendance/projects/${projectId}/active-session`);
    return res.data;
};

export const createSessionApi = async (
    projectId: number,
    data: CreateSessionRequest,
) => {
    const res = await axios.post<Session>(`/attendance/projects/${projectId}/sessions`, data);
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

export const clockInApi = async (projectId: number, data?: ClockInAndOutRequest) => {
    const res = await axios.post<ActiveSessionResponse>(`/attendance/projects/${projectId}/clock-in`, data);
    return res.data;
};

export const clockOutApi = async (projectId: number, data?: ClockInAndOutRequest) => {
    const res = await axios.post<ActiveSessionResponse>(`/attendance/projects/${projectId}/clock-out`, data);
    return res.data;
};

export const getWorkSummaryPreviewApi = async (projectId: number, year: number, month: number) => {
    const res = await axios.get<Summary>(`/work-summary/preview`, {
        params: {year, month, projectId},
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

export const getLabelsApi = async (projectId: number) => {
    const res = await axios.get<Label[]>(`/attendance/projects/${projectId}/labels`);
    return res.data;
};

export const createLabelApi = async (projectId: number, data: {
    name: string;
    color: string;
}) => {
    const res = await axios.post<Label>(`/attendance/projects/${projectId}/labels`, data);
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

export const reorderLabelsApi = async (projectId: number, data: ReorderLabelsRequest) => {
    await axios.post(`/attendance/projects/${projectId}/labels/reorder`, data);
};

export const createEmployeeRateApi = async (data: EmployeeRateRequest) => {
    const res = await axios.post<EmployeeRateResponse>("/employee-rates", data);
    return res.data;
};
