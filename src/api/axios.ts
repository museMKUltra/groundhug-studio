import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api",
    withCredentials: true, // if using cookies
});

// Request interceptor (attach token)
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor (handle refresh)
axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axiosInstance.post("/auth/refresh");

                const newToken = res.data.accessToken;
                localStorage.setItem("access_token", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch {
                // logout fallback
                localStorage.removeItem("access_token");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;