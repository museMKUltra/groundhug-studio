import axios from "@/api/axios";
import type {RegisterRequest, UserResponse, UpdateRequest, UpdateUserResponse} from "./types";

export const registerApi = async (data: RegisterRequest) => {
    const res = await axios.post<UserResponse>("/users", data);
    return res.data;
};

export const updateApi = async (data: UpdateRequest) => {
    const res = await axios.put<UpdateUserResponse>("/users/update", data);
    return res.data;
};
