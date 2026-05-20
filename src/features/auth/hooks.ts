import {useState} from "react";
import {guestApi, loginApi, logoutApi} from "./api";
import type {User} from "./types";
import {jwtDecode} from "jwt-decode";
import {useAuthContext} from "./useAuthContext";
import {tokenStorage} from "./tokenStorage";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const {
        user,
        hourlyRate,
        expiresAt,
        permissions,
        isInitializing,
        setUser,
        updateUser,
        setHourlyRate,
    } = useAuthContext();

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
        } finally {
            tokenStorage.clear();
            setUser(null);
            setLoading(false);
        }
    };

    function hasPermissions(permission: string) {
        return permissions?.includes(permission) ?? false;
    }

    return {
        guest,
        login,
        logout,
        loading,
        user,
        isInitializing,
        isSalaryVisible: hasPermissions("MANAGE_OWN_HOURLY_RATE"),
        expiresAt,
        hourlyRate,
        updateUser,
        setHourlyRate,
    };
};