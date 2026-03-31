import {Box} from "@mui/material";

export default function AuthLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
        >
            {children}
        </Box>
    );
}