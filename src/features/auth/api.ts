import axios from "@/api/axios";
import type {AuthResponse, LoginRequest, MeResponse} from "./types";

export const loginApi = async (data: LoginRequest) => {
    const res = await axios.post<AuthResponse>("/auth/login", data);
    return res.data;
};

export const refreshApi = async () => {
    const res = await axios.post<AuthResponse>("/auth/refresh");
    return res.data;
};

export const logoutApi = async () => {
    await axios.post<void>("/auth/logout");
};

export const meApi = async () => {
    const res = await axios.get<MeResponse>("/auth/me");
    return res.data;
};
