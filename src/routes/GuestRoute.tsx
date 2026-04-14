import {Navigate} from "react-router-dom";
import {tokenStorage} from "@/features/auth/tokenStorage";

export default function GuestRoute({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    if (tokenStorage.get()) {
        return <Navigate to="/attendance" replace/>;
    }

    return children;
}