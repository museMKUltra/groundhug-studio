import type {AxiosRequestConfig} from "axios";
import axios, {AxiosError} from "axios";
import {tokenStorage} from "@/features/auth/tokenStorage.ts";
import {refreshController} from "@/features/auth/refreshController.ts";

const axiosInstance = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = tokenStorage.get();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };
        const isUnauthorized = error.response?.status === 401;
        const isForbidden = error.response?.status === 403;
        const isAuthPath = AUTH_PATHS.some(p => originalRequest.url?.includes(p));

        if (isForbidden) {
            alert("You don't have permission to perform this action.");
            return Promise.reject(error);
        }

        if (
            !isUnauthorized ||
            originalRequest._retry ||
            isAuthPath
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (refreshController.isRefreshing()) {
            return new Promise((resolve) => {
                refreshController.subscribe((token) => {
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: `Bearer ${token}`,
                    };
                    resolve(axiosInstance(originalRequest));
                });
            });
        }

        refreshController.start();

        try {
            const res = await axios.post(
                "/api/auth/refresh",
                {},
                {withCredentials: true}
            );

            const newToken = res.data.token;

            tokenStorage.set(newToken);
            refreshController.notify(newToken);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
            };

            return axiosInstance(originalRequest);
        } catch (err) {
            alert("Please log in again.");

            tokenStorage.clear();
            window.location.href = "/login";

            return Promise.reject(err);
        } finally {
            refreshController.finish();
        }
    }
);

export default axiosInstance;