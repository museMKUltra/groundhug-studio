import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Outlet} from "react-router-dom";
import {Box, Container, Stack, Typography} from "@mui/material";

import {useAuth} from "@/features/auth/hooks.ts";
import Header from "@/shared/components/Header.tsx";
import {useEffect} from "react";

dayjs.extend(relativeTime);

export default function MainLayout() {
    const {user, setMe, expiresAt} = useAuth();

    useEffect(() => {
        setMe();
    }, []);

    const userName = user?.name || "";
    const isGuest = user?.isGuest ?? false;

    const now = dayjs();
    const expiry = expiresAt ? dayjs(expiresAt) : null;

    const isExpired = expiry ? expiry.isBefore(now) : false;

    const hoursLeft = expiry ? expiry.diff(now, "hour") : null;

    const expiryText =
        expiry && expiry.isValid()
            ? isExpired
                ? "This guest account has expired."
                : `This guest account expires ${expiry.fromNow()}.`
            : null;

    const textColor =
        hoursLeft !== null && hoursLeft < 1 ? "error.main" : "warning.main";

    return (
        <>
            <Header/>

            <Box bgcolor="grey.100">
                <Container
                    maxWidth="lg"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: {
                            xs: "calc(100vh - 72px)",
                            sm: "calc(100vh - 80px)",
                        },
                        paddingY: 3
                    }}
                >
                    <Box flex={1} display="flex">
                        <Stack spacing={3} width="100%">

                            <Box display="flex" gap={1} alignItems="baseline">
                                <Typography>
                                    Hi,{" "}
                                    <Box component="span" fontWeight="bold">
                                        {userName}
                                    </Box>
                                    .
                                </Typography>

                                {isGuest ? (
                                    <Typography variant="body2" color={textColor}>
                                        {expiryText}
                                    </Typography>
                                ) : (
                                    <Typography>Keep going!</Typography>
                                )}
                            </Box>

                            <Outlet/>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </>
    );
}