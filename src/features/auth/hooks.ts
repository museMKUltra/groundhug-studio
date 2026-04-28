import {useState} from "react";
import {guestApi, loginApi, logoutApi, meApi} from "./api";
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

    const guest = async (name: string) => {
        setLoading(true);
        try {
            const data = await guestApi({name});
            tokenStorage.set(data.token);

            const user = jwtDecode<User>(data.token);
            setUser(user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutApi();

            tokenStorage.clear();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        guest,
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