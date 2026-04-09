import {useState} from "react";
import {Alert, Snackbar} from "@mui/material";
import {SnackbarContext} from "./SnackbarContext.ts";

export function SnackbarProvider({children}: { children: React.ReactNode }) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    return (
        <SnackbarContext.Provider value={{
            showError: setError,
            showSuccess: setSuccess,
        }}>
            {children}

            <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}
