import {Box} from "@mui/material";
import {Outlet} from "react-router-dom";

export default function LoginLayout() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
        >
            <Outlet/>
        </Box>
    );
}