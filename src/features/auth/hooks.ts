import {useEffect, useState} from "react";
import {loginApi, meApi} from "./api";
import type {User} from "./types";
import {jwtDecode} from "jwt-decode";
import {useAuthContext} from "./useAuthContext";

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

    const {user, hourlyRate, setUser, updateUser, setHourlyRate} = useAuthContext();

    useEffect(() => {
        setUser(getUserFromToken());
    }, [])

    const setMe = async () => {
        const me = await meApi();

        setHourlyRate(me.hourlyRate);
    }

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