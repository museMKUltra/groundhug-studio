import Header from "@/components/Header";
import {Box} from "@mui/material";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header/>
            <Box
                display="flex"
                flexDirection="column"
                sx={{
                    minHeight: {
                        xs: "calc(100vh - 56px)",
                        sm: "calc(100vh - 64px)",
                    },
                    bgcolor: "#f5f5f5",
                }}
            >
                <Box flex={1} display="flex">
                    {children}
                </Box>
            </Box>
        </>
    );
}