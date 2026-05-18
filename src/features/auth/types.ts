export interface LoginRequest {
    email: string;
    password: string;
}

export interface GuestRequest {
    name: string;
}

export interface AuthResponse {
    token: string;
}

export type Role = "ADMIN" | "PREMIUM" | "USER";

export interface MeResponse {
    id: number;
    name: string;
    email: string;
    hourlyRate: number;
    expiresAt: string | null;
    role: Role;
    permissions: string[];
}

export type User = {
    sub: string;
    name: string;
    email: string;
    role: Role;
    isGuest: boolean;
    exp: number;
};
