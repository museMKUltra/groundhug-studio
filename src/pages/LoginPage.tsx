import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks.ts";
import {useSnackbar} from "@/context/SnackbarContext.ts";

import {Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography,} from "@mui/material";
import type {AxiosError} from "axios";

type Mode = "login" | "register" | "guest";

export default function LoginPage() {
    const {guest, login, loading} = useAuth();
    const {register} = useUsers();
    const {showError, showSuccess} = useSnackbar();

    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.replace("/", "");
    const mode: Mode = (path === "register" || path === "guest") ? path : "login";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        try {
            if (mode === "login") {
                await login(email, password);
            }
            if (mode === "register") {
                await register(name, email, password);

                setName("");
                setPassword("");
                navigate("/login");
                showSuccess("Register successful. Please login.");
            }
            if (mode === "guest") {
                await guest(name);
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{
                error?: string
                name?: string
                email?: string
                password?: string
            }>;

            showError(
                error.response?.data?.error
                || error.response?.data?.name
                || error.response?.data?.email
                || error.response?.data?.password
                || "Email or Password is incorrect."
            );
        }
    };

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        handleSubmit();
    }

    return (
        <Box>
            <Card sx={{width: 400, borderRadius: 3, boxShadow: 3}}>
                <CardContent>
                    <Typography variant="h5" textAlign="center" mb={2}>
                        {mode === "login" && "Login"}
                        {mode === "register" && "Register"}
                        {mode === "guest" && "Guest"}
                    </Typography>

                    <Tabs
                        value={mode}
                        onChange={(_, value) => navigate(`/${value}`)}
                        centered
                        sx={{mb: 2}}
                    >
                        <Tab label="Login" value="login"/>
                        <Tab label="Register" value="register"/>
                        <Tab label="Guest" value="guest"/>
                    </Tabs>

                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            {
                                (mode === "register" || mode === "guest") && (
                                    <TextField
                                        label="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        fullWidth
                                    />
                                )
                            }

                            {
                                (mode === "login" || mode === "register") && (
                                    <>
                                        <TextField
                                            label="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            fullWidth
                                        />
                                    </>
                                )
                            }

                            {
                                mode === "guest" && (
                                    <Typography variant="caption" color="text.secondary" textAlign="center">
                                        Guest data will be deleted after 24 hours
                                    </Typography>
                                )
                            }


                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                fullWidth
                                size="large"
                            >
                                {mode === "login" && "Login"}
                                {mode === "register" && "Register"}
                                {mode === "guest" && "Try as Guest"}
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
