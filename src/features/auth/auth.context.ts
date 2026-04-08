import {createContext} from "react";
import type {User} from "./types";

export type AuthContextType = {
    user: User | null;
    hourlyRate: number;
    setUser: (user: User | null) => void;
    updateUser: (updates: Partial<User>) => void;
    setHourlyRate: (rate: number) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);