import { useState } from "react";
import { loginApi, registerApi } from "./api";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const data = await loginApi({ email, password });
            localStorage.setItem("access_token", data.accessToken);
            return true;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const data = await registerApi({ name, email, password });
            localStorage.setItem("access_token", data.accessToken);
            return true;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        register,
        loading,
    };
};