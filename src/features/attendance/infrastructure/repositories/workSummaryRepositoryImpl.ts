import type {WorkSummaryRepository} from "../../domain/repositories/workSummaryRepository";
import {getWorkSummaryListApi} from "../api/workSummaryApi";

export const workSummaryRepository: WorkSummaryRepository = {
    getList(page, size) {
        return getWorkSummaryListApi(page, size);
    },
};