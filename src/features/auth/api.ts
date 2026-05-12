import axios from "@/app/api/axios";
import type {AuthResponse, GuestRequest, LoginRequest, MeResponse} from "./types";

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

export const guestApi = async (data: GuestRequest) => {
    const res = await axios.post<AuthResponse>("/auth/guest", data);
    return res.data;
};

export const meApi = async () => {
    const res = await axios.get<MeResponse>("/auth/me");
    return res.data;
};
