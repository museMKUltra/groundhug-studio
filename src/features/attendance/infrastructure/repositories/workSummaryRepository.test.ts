import {describe, expect, it, vi} from "vitest";
import {workSummaryRepository} from "@/features/attendance/infrastructure/repositories/workSummaryRepositoryImpl.ts";
import * as api from "@/features/attendance/infrastructure/api/workSummaryApi.ts";

vi.mock("@/features/attendance/infrastructure/api/workSummaryApi");

const mockedApi = vi.mocked(api);

describe("workSummaryRepository", () => {
    it("forwards call to API", async () => {
        mockedApi.getWorkSummaryListApi.mockResolvedValue({
            content: [],
            page: {
                size: 10,
                number: 0,
                totalElements: 0,
                totalPages: 1
            },
        });

        await workSummaryRepository.getList(0, 10);

        expect(api.getWorkSummaryListApi).toHaveBeenCalledWith(0, 10);
    });
});