type Status = "ACTIVE" | "COMPLETED" | "DRAFT" | string;

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface Session {
    id: number;
    clockIn: string;
    clockOut: string | null;
    workDate: string;
    workMinutes: number | null;
    status: Status;
    description: string | null;
    label: Label;
}

export interface Summary {
    id: string | null;
    year: number;
    month: number;
    hourlyRate: number;
    totalMinutes: number;
    totalHours?: number;
    salaryAmount: number;
    status?: Status;
}

export interface ActiveSessionResponse {
    active: boolean;
    session: Session | null;
    summary: Summary | null;
}

export interface CreateLabelRequest {
    name: string;
    color: string;
}