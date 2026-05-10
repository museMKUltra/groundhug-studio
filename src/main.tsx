import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {createTheme, ThemeProvider} from "@mui/material/styles";

import {AuthProvider} from "@/features/auth/AuthProvider.tsx";
import {SnackbarProvider} from "@/context/SnackbarProvider";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1D192B",
        },
        // info: {
        //     main: "#3F81EA",
        // },
        // success: {
        //     main: "#8CD293",
        // },
        // warning: {
        //     main: "#E8B931",
        // },
        // error: {
        //     main: "#FF6F00",
        // },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <BrowserRouter>
                <SnackbarProvider>
                    <AuthProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <App/>
                        </LocalizationProvider>
                    </AuthProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
);