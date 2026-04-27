import {useState} from "react";
import {loginApi, meApi} from "./api";
import type {User} from "./types";
import {jwtDecode} from "jwt-decode";
import {useAuthContext} from "./useAuthContext";
import {tokenStorage} from "./tokenStorage";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const {user, hourlyRate, isInitializing, setUser, updateUser, setHourlyRate} = useAuthContext();

    const setMe = async () => {
        const me = await meApi();

        setHourlyRate(me.hourlyRate);
    }

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const data = await loginApi({email, password});
            tokenStorage.set(data.token);

            const user = jwtDecode<User>(data.token);
            setUser(user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        tokenStorage.clear();
        setUser(null);
    };

    return {
        login,
        logout,
        loading,
        user,
        isInitializing,
        isAdmin: user?.role === "ADMIN",
        hourlyRate,
        setMe,
        updateUser,
        setHourlyRate,
    };
};