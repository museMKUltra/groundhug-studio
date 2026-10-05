import {describe, expect, it, vi} from "vitest";
import {workSummaryRepository} from "@/features/attendance/infrastructure/repositories/workSummaryRepositoryImpl.ts";
import * as api from "@/features/attendance/infrastructure/api/workSummaryApi.ts";

vi.mock("@/features/attendance/infrastructure/api/workSummaryApi");

const mockedApi = vi.mocked(api);

describe("workSummaryRepository", () => {
    it("forwards getList call to API", async () => {
        mockedApi.getWorkSummaryListApi.mockResolvedValue({
            content: [],
            page: {
                size: 10,
                number: 0,
                totalElements: 0,
                totalPages: 1
            },
        });

        await workSummaryRepository.getList(0, 10, 0);

        expect(api.getWorkSummaryListApi).toHaveBeenCalledWith(0, 10, 0);
    });

    it("forwards getOptions call to API", async () => {
        mockedApi.getWorkSummaryOptionsApi.mockResolvedValue({
            projects: [
                {
                    id: 2,
                    name: "Default",
                    description: null,
                    status: "ACTIVE",
                    createdAt: "2026-10-05T19:17:06"
                }
            ],
            periods: [
                {
                    year: 2026,
                    month: 10
                }
            ]
        });

        await workSummaryRepository.getOptions();

        expect(api.getWorkSummaryOptionsApi).toHaveBeenCalled();
    });
});