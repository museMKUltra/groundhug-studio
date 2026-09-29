import axios from "@/app/api/axios";
import type {CreateProjectRequest, Project, UpdateProjectRequest} from "./types";

export const getProjectsApi = async () => {
    const res = await axios.get<Project[]>("/projects");
    return res.data;
};

export const createProjectApi = async (data: CreateProjectRequest) => {
    const res = await axios.post<Project>("/projects", data);
    return res.data;
};

export const updateProjectApi = async (
    id: number,
    data: UpdateProjectRequest
) => {
    const res = await axios.put<Project>(`/projects/${id}`, data);
    return res.data;
};

export const archiveProjectApi = async (id: number) => {
    const res = await axios.post<Project>(`/projects/${id}/archive`);
    return res.data;
};

export const restoreProjectApi = async (id: number) => {
    const res = await axios.post<Project>(`/projects/${id}/restore`);
    return res.data;
};
