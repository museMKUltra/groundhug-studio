type Status = "ACTIVE" | "COMPLETED" | "DRAFT" | string;

export interface Label {
    id: number;
    name: string;
    color: string;
    isGlobal: boolean;
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

export interface SummaryLabel {
    id: number;
    name: string;
    color: string;
    workMinutes: number;
    isGlobal: boolean;
}

export interface Summary {
    id: string | null;
    year: number;
    month: number;
    date: number;
    hourlyRate: number;
    totalMinutes: number;
    totalHours?: number;
    salaryAmount: number;
    status?: Status;
    labels?: SummaryLabel[];
}

export type PeriodSessionsResponse = Session[];

export interface ActiveSessionResponse {
    active: boolean;
    session: Session | null;
    summary: Summary | null;
}

export interface UpdateSessionRequest {
    clockIn?: string;
    clockOut?: string;
    labelId?: number;
    description?: string;
}

export interface CreateLabelRequest {
    name: string;
    color: string;
}

export interface ClockInAndOutRequest {
    labelId?: number;
    description?: string;
}

export interface EmployeeRateRequest {
    hourlyRate: number;
}

export interface EmployeeRateResponse {
    id: number;
    hourlyRate: number;
    effectiveFrom: string;
    effectiveTo: string | null;
}