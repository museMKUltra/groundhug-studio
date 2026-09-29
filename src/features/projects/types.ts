export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export interface Project {
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
    createdAt: string; // ISO-8601 instant
}

export interface CreateProjectRequest {
    name: string;
}

export interface UpdateProjectRequest {
    name: string; // required, max 100 chars
    description?: string | null; // max 255 chars
}
