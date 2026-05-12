import {createContext, useContext} from "react";

interface SnackbarContextValue {
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar(): SnackbarContextValue {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
    return ctx;
}
