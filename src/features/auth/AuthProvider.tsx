import {useState} from "react";
import type {User} from "./types";
import {AuthContext} from "./auth.context";

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
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