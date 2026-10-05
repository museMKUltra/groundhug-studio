import axios from "@/app/api/axios";
import type {OptionsResponse, WorkSummaryResponse} from "../../types";

export const getWorkSummaryListApi = async (
    page: number,
    size: number,
    projectId: number,
): Promise<WorkSummaryResponse> => {
    const res = await axios.get("/work-summary/list", {
        params: {page, size, projectId},
    });

    return res.data;
};

export const getWorkSummaryOptionsApi = async (): Promise<OptionsResponse> => { const res = await axios.get("/work-summary/options");
    return res.data;
};
