import type {WorkSummaryRepository} from "../../domain/repositories/workSummaryRepository";

export const createGetWorkSummaryListUseCase = (
    repo: WorkSummaryRepository,
) => {
    return async (page: number, size: number, projectId?: number) => {
        return repo.getList(page, size, projectId);
    };
};

export const createGetWorkSummaryOptionsUseCase = (
    repo: WorkSummaryRepository,
) => {
    return async () => {
        return repo.getOptions();
    };
};
