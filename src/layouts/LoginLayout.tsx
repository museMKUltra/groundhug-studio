import {Box} from "@mui/material";
import {Outlet} from "react-router-dom";
import Header from "@/components/Header.tsx";

export default function LoginLayout() {
    return (
        <>
            <Header/>
            <Box
                display="flex"
                justifyContent="center"
                minHeight="100vh"
                bgcolor="#f5f5f5"
                sx={{
                    minHeight: {
                        xs: "calc(100vh - 56px)",
                        sm: "calc(100vh - 64px)",
                    },
                    paddingTop: "20vh"
                }}
            >
                <Outlet/>
            </Box>
        </>
    );
}