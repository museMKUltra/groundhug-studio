import {type ReactNode} from "react";
import {SnackbarProvider} from "@/context/SnackbarProvider.tsx";

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