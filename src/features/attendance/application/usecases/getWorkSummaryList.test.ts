import {describe, expect, it, vi} from "vitest";
import {createGetWorkSummaryListUseCase} from "@/features/attendance/application/usecases/getWorkSummaryList.ts";
import type {WorkSummaryRepository} from "@/features/attendance/domain/repositories/workSummaryRepository.ts";

describe("getWorkSummaryList use case", () => {
    it("calls repository with correct params", async () => {
        const mockRepo: WorkSummaryRepository = {
            getList: vi.fn().mockResolvedValue({
                content: [{id: 1}],
                page: {totalPages: 2},
            }),
        };

        const useCase = createGetWorkSummaryListUseCase(mockRepo);

        const result = await useCase(0, 10);

        expect(mockRepo.getList).toHaveBeenCalledWith(0, 10);
        expect(result.content).toEqual([{id: 1}]);
    });
});