import type {WorkSummaryRepository} from "../../domain/repositories/workSummaryRepository";
import {getWorkSummaryListApi, getWorkSummaryOptionsApi} from "../api/workSummaryApi";

export const workSummaryRepository: WorkSummaryRepository = {
    getList(page, size, projectId) {
        return getWorkSummaryListApi(page, size, projectId);
    },
    getOptions() {
        return getWorkSummaryOptionsApi();
    },
};