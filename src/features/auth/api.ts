import axios from "@/api/axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "./types";

export const loginApi = async (data: LoginRequest) => {
    const res = await axios.post<AuthResponse>("/auth/login", data);
    return res.data;
};

export const registerApi = async (data: RegisterRequest) => {
    const res = await axios.post<AuthResponse>("/auth/register", data);
    return res.data;
};

export const refreshApi = async () => {
    const res = await axios.post<AuthResponse>("/auth/refresh");
    return res.data;
};