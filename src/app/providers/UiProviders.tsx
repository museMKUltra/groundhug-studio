import {type ReactNode} from "react";
import {SnackbarProvider} from "@/shared/providers/SnackbarProvider.tsx";

interface Props {
    children: ReactNode;
}

export function UiProviders({children}: Props) {
    return (
        <SnackbarProvider>
            {children}
        </SnackbarProvider>
    );
}