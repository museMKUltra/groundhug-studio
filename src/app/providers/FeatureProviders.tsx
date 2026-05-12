import {type ReactNode} from "react";
import {AuthProvider} from "@/features/auth/AuthProvider";
import {ClockProvider} from "@/features/clock/ClockProvider";

interface Props {
    children: ReactNode;
}

export function FeatureProviders({children}: Props) {
    return (
        <AuthProvider>
            <ClockProvider>
                {children}
            </ClockProvider>
        </AuthProvider>
    );
}