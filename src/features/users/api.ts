import axios from "@/api/axios";
import type {RegisterRequest, RegisterResponse} from "./types";

export const registerApi = async (data: RegisterRequest) => {
    const res = await axios.post<RegisterResponse>("/users/register", data);
    return res.data;
};
