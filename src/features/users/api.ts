import axios from "@/api/axios";
import type {RegisterRequest, UserResponse, UpdateRequest} from "./types";

export const registerApi = async (data: RegisterRequest) => {
    const res = await axios.post<UserResponse>("/users", data);
    return res.data;
};

export const updateApi = async (data: UpdateRequest) => {
    const res = await axios.put<UserResponse>("/users/update", data);
    return res.data;
};
