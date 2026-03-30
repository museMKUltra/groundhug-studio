interface Label {
    id: number;
    name: string;
    color: string;
}

interface Session {
    id: number;
    clockIn: string;
    clockOut: string | null;
    workDate: string;
    workMinutes: number | null;
    status: "ACTIVE" | "COMPLETED" | "DRAFT" | string;
    description: string | null;
    label: Label;
}

interface Summary {
    id: string | null;
    year: number;
    month: number;
    hourlyRate: number;
    totalMinutes: number;
    salaryAmont: number;
    totalHours: number;
}

export interface ActiveSessionResponse {
    active: boolean;
    session: Session | null;
    summary: Summary | null;
}