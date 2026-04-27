import {useState} from "react";
import type {User} from "./types";
import {AuthContext} from "./useAuthContext";
import {tokenStorage} from "@/features/auth/tokenStorage.ts";
import {jwtDecode} from "jwt-decode";

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = tokenStorage.get();
        if (!token) return null;

        try {
            return jwtDecode<User>(token);
        } catch {
            return null;
        }
    });
    const [hourlyRate, setHourlyRateState] = useState<number>(0);

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
            setUser,
            updateUser,
            setHourlyRate
        }}>
            {children}
        </AuthContext.Provider>
    );
};