import {useEffect, useRef, useState} from "react";
import {jwtDecode} from "jwt-decode";

import type {User} from "./types";
import {AuthContext} from "./useAuthContext";
import {refreshApi} from "./api";

import {tokenStorage} from "@/features/auth/tokenStorage.ts";
import {type ClockMode, ClockProvider} from "@/features/clock/ClockProvider";


export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hourlyRate, setHourlyRate] = useState<number>(0);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
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

    const [clockMode, setClockMode] = useState<ClockMode>("system");

    useEffect(() => {
        if (!isInitializing && user) {
            setClockMode(user?.isGuest ? "demo" : "system");
        }
    }, [user, isInitializing]);

    return (
        <AuthContext.Provider value={{
            user,
            hourlyRate,
            expiresAt,
            isInitializing,
            setUser,
            updateUser,
            setHourlyRate,
            setExpiresAt
        }}>
            <ClockProvider mode={clockMode}>
                {children}
            </ClockProvider>
        </AuthContext.Provider>
    );
};
