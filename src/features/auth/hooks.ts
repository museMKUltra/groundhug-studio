import {useState} from "react";
import {loginApi, meApi} from "./api";
import {jwtDecode} from "jwt-decode";

type User = {
    sub: string;
    name: string;
    email: string;
    role: string;
    exp: number;
};

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("access_token");

    const getUserFromToken = (): User | null => {
        const token = getToken();
        if (!token) return null;

        try {
            return jwtDecode<User>(token);
        } catch {
            return null;
        }
    };

    const [hourlyRate, setHourlyRate] = useState<number>(0);
    const setMe = async () => {
        const me = await meApi();

        setHourlyRate(me.hourlyRate);
    }

    const [user, setUser] = useState<User | null>(getUserFromToken());

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            return {...prev, ...updates};
        });
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const data = await loginApi({email, password});
            localStorage.setItem("access_token", data.token);

            const user = jwtDecode<User>(data.token);
            setUser(user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
    };

    return {
        login,
        logout,
        loading,
        user,
        hourlyRate,
        setMe,
        updateUser,
        setHourlyRate,
    };
};