import {useState} from "react";
import {loginApi} from "./api";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const data = await loginApi({email, password});
            localStorage.setItem("access_token", data.token);
            return data;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
    };
};