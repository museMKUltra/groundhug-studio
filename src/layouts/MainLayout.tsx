import Header from "@/components/Header";
import {Box, Stack, Typography} from "@mui/material";
import {useAuth} from "@/features/auth/hooks.ts";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    const {user} = useAuth();
    const userName = user?.name || "";

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
                    bgcolor: "grey.100",
                }}
            >
                <Box flex={1} display="flex">
                    <Stack spacing={3} sx={{py: 3, width: "80%", mx: "auto"}}>
                        <Typography>
                            Hi, <Box component="span" fontWeight="bold">{userName}</Box>. Keep going!
                        </Typography>

                        {children}
                    </Stack>
                </Box>
            </Box>
        </>
    );
}