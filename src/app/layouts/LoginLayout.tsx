import {Box, Container} from "@mui/material";
import {Outlet} from "react-router-dom";
import Header from "@/components/Header.tsx";

export default function LoginLayout() {
    return (
        <>
            <Header/>
            <Box bgcolor="grey.100">
                <Container
                    maxWidth="lg"
                    sx={{
                        minHeight: {
                            xs: "calc(100vh - 72px)",
                            sm: "calc(100vh - 80px)",
                        },
                        paddingBottom: 8,
                        paddingTop: "20vh"
                    }}
                >
                    <Outlet/>
                </Container>
            </Box>
        </>
    );
}