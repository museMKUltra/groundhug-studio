import {Box} from "@mui/material";
import {Outlet} from "react-router-dom";

export default function HomeLayout() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <Outlet/>
        </Box>
    );
}