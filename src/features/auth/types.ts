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

export interface MeResponse {
    id: number;
    name: string;
    email: string;
    hourlyRate: number;
}

export type Role = "ADMIN" | "USER";

export type User = {
    sub: string;
    name: string;
    email: string;
    role: Role;
    isGuest: boolean;
    exp: number;
};
