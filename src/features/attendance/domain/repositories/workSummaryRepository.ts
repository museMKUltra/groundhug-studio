import type {WorkSummaryResponse} from "../../types";

export interface WorkSummaryRepository {
    getList(page: number, size: number): Promise<WorkSummaryResponse>;
}