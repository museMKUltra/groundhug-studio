import {useEffect, useRef, useState} from "react";
import type {User} from "./types";
import {AuthContext} from "./useAuthContext";
import {tokenStorage} from "@/features/auth/tokenStorage.ts";
import {jwtDecode} from "jwt-decode";
import {refreshApi} from "./api";

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hourlyRate, setHourlyRateState] = useState<number>(0);
    const [isInitializing, setIsInitializing] = useState(true);
    const isRefreshing = useRef(false);

    const refresh = async () => {
        if (isRefreshing.current) return;

        try {
            isRefreshing.current = true;

            const data = await refreshApi();

            tokenStorage.set(data.token);
            setUser(jwtDecode<User>(data.token));
        } catch (err) {
            console.error("Failed to refresh token:", err);

            tokenStorage.clear();
            setUser(null);
        } finally {
            setIsInitializing(false);
            isRefreshing.current = false;
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => prev ? {...prev, ...updates} : prev);
    };

    const setHourlyRate = (rate: number) => {
        setHourlyRateState(rate);
    };

    return (
        <AuthContext.Provider value={{
            user,
            hourlyRate,
            isInitializing,
            setUser,
            updateUser,
            setHourlyRate
        }}>
            {children}
        </AuthContext.Provider>
    );
};
