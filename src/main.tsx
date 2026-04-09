import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {AuthProvider} from "@/features/auth/AuthProvider.tsx";
import {SnackbarProvider} from "@/context/SnackbarProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <>
                <CssBaseline/>
                <SnackbarProvider>
                    <AuthProvider>
                        <App/>
                    </AuthProvider>
                </SnackbarProvider>
            </>
        </BrowserRouter>
    </React.StrictMode>
);