import {Box} from "@mui/material";
import {Outlet} from "react-router-dom";
import Header from "@/components/Header.tsx";

export default function HomeLayout() {

    return (
        <>
            <Header/>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                    minHeight: {
                        xs: "calc(100vh - 56px)",
                        sm: "calc(100vh - 64px)",
                    },
                }}
            >
                <Outlet/>
            </Box>
        </>

    );
}