import type {OptionsResponse, WorkSummaryResponse} from "../../types";

export interface WorkSummaryRepository {
    getList(page: number, size: number, projectId?: number): Promise<WorkSummaryResponse>;

    getOptions(): Promise<OptionsResponse>;
}