export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface UpdateRequest {
    name: string;
}