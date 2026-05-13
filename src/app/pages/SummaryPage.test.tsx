import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import SummaryPage from "@/app/pages/SummaryPage.tsx";
import {renderWithProviders} from "@/app/test/render";

vi.mock("@/features/attendance/presentation/hooks/useWorkSummary", () => ({
    useWorkSummary: () => ({
        loading: false,
        page: 1,
        setPage: vi.fn(),
        list: [
            {
                id: 1,
                year: 2025,
                month: 5,
                status: "DRAFT",
                totalMinutes: 0,
                hourlyRate: 0,
                salaryAmount: 0,
            },
        ],
        totalPages: 2,
    }),
}));

vi.mock("@/features/auth/hooks", () => ({
    useAuth: () => ({
        isAdmin: true,
    }),
}));

describe("SummaryPage", () => {
    it("renders table and data", () => {
        renderWithProviders(<SummaryPage/>);

        expect(screen.getByText("Monthly Summary")).toBeInTheDocument();
        expect(screen.getByText("2025")).toBeInTheDocument();
        expect(screen.getByText("Preview")).toBeInTheDocument();
    });
});