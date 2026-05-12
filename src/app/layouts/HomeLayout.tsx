import {Container} from "@mui/material";
import {Outlet} from "react-router-dom";
import Header from "@/components/Header.tsx";

export default function HomeLayout() {

    return (
        <>
            <Header/>
            <Container
                maxWidth="lg"
                sx={{
                    minHeight: {
                        xs: "calc(100vh - 72px)",
                        sm: "calc(100vh - 80px)",
                    },
                    paddingY: 8
                }}
            >
                <Outlet/>
            </Container>
        </>

    );
}