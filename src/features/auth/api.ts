import axios from "@/api/axios";
import type { LoginRequest, AuthResponse } from "./types";

export const loginApi = async (data: LoginRequest) => {
    const res = await axios.post<AuthResponse>("/auth/login", data);
    return res.data;
};

export const refreshApi = async () => {
    const res = await axios.post<AuthResponse>("/auth/refresh");
    return res.data;
};