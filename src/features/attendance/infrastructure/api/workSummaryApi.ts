import axios from "@/app/api/axios";
import type {WorkSummaryResponse} from "../../types";

export const getWorkSummaryListApi = async (
    page: number,
    size: number,
): Promise<WorkSummaryResponse> => {
    const res = await axios.get("/work-summary/list", {
        params: {page, size},
    });

    return res.data;
};
