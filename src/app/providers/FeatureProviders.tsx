import {type ReactNode} from "react";
import {AuthProvider} from "@/features/auth/AuthProvider";

interface Props {
    children: ReactNode;
}

export function FeatureProviders({children}: Props) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}