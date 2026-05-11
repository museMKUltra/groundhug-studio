import {type ReactNode} from "react";
import {SnackbarProvider} from "@/context/SnackbarProvider";

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