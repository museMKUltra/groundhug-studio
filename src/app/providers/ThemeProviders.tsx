import {type ReactNode} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {createTheme, ThemeProvider,} from "@mui/material/styles";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1D192B",
        },
    },
});

interface Props {
    children: ReactNode;
}

export function ThemeProviders({children}: Props) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            <LocalizationProvider
                dateAdapter={AdapterDayjs}
            >
                {children}
            </LocalizationProvider>
        </ThemeProvider>
    );
}