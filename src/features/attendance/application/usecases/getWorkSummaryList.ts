import type {WorkSummaryRepository} from "../../domain/repositories/workSummaryRepository";

export const createGetWorkSummaryListUseCase = (
    repo: WorkSummaryRepository,
) => {
    return async (page: number, size: number) => {
        return repo.getList(page, size);
    };
};