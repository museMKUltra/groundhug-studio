import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {AuthProvider} from "@/features/auth/AuthProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <>
                <CssBaseline/>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </>
        </BrowserRouter>
    </React.StrictMode>
);