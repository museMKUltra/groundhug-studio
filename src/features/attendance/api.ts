import axios from "@/api/axios";
import type {ActiveSessionResponse} from "./types";

export const getActiveSessionApi = async () => {
    const res = await axios.get<ActiveSessionResponse>("/attendance/active-session");
    return res.data;
};
