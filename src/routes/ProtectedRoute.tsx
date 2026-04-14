import {Navigate, useLocation} from "react-router-dom";
import {tokenStorage} from "@/features/auth/tokenStorage";

export default function ProtectedRoute({children}: {
    children: React.ReactNode;
}) {
    const location = useLocation();

    if (tokenStorage.get()) {
        return children;
    }

    return (
        <Navigate
            to="/login"
            replace
            state={{from: location}}
        />
    );
}