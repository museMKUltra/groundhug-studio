import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";

export default function LoginPage() {
    const { login, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const success = await login(email, password);
        if (success) {
            window.location.href = "/";
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
            />

            <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
            />

            <button onClick={handleLogin} disabled={loading}>
                Login
            </button>
        </div>
    );
}