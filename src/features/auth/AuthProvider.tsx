import {useEffect, useState} from "react";
import type {User} from "./types";
import {AuthContext} from "./useAuthContext";
import {tokenStorage} from "@/features/auth/tokenStorage.ts";
import {jwtDecode} from "jwt-decode";
import {refreshApi} from "./api";

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hourlyRate, setHourlyRateState] = useState<number>(0);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        refreshApi()
            .then((data) => {
                tokenStorage.set(data.token);
                setUser(jwtDecode<User>(data.token));
            })
            .catch(() => {
                // Not authenticated — stay as null
            })
            .finally(() => {
                setIsInitializing(false);
            });
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
